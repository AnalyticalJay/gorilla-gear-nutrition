import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { registerStorageProxy } from "./storageProxy";
import { appRouter } from "../routers";
import { getOrderByIkhokhaReference, getUserById, updateIkhokhaPaymentAttemptStatus, updateOrderIkhokhaPayment } from "../db";
import { getIkhokhaPaymentOutcome, getIkhokhaPaymentStatus } from "../ikhokha";
import { sendPaymentApprovedEmail } from "../email";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  registerStorageProxy(app);
  registerOAuthRoutes(app);

  // iKhokha callbacks are reconciled through the authenticated payment-status API.
  // The callback body itself is never trusted to mark an order paid.
  app.post("/api/payments/ikhokha/callback", async (req, res) => {
    let reference = "";
    try {
      reference = String(req.query.reference ?? req.body?.externalTransactionID ?? req.body?.externalTransactionId ?? "").trim();
      if (!reference) return res.status(400).send("Missing iKhokha payment reference");
      const order = await getOrderByIkhokhaReference(reference);
      if (!order) {
        res.status(404).send("Payment reference not found");
        return;
      }
      if (!order.ikhokhaPaylinkId) {
        res.status(409).send("iKhokha payment link is not ready");
        return;
      }
      const statusPayload = await getIkhokhaPaymentStatus(order.ikhokhaPaylinkId);
      const gatewayReference = String(statusPayload.externalTransactionID ?? statusPayload.externalTransactionId ?? "").trim();
      if (gatewayReference && gatewayReference !== reference) {
        await updateIkhokhaPaymentAttemptStatus(reference, "pending", "REFERENCE_MISMATCH", "iKhokha returned a different transaction reference");
        return res.status(400).send("Payment reference mismatch");
      }
      const amount = Number(statusPayload.amount ?? statusPayload.amountInCents ?? statusPayload.transactionAmount);
      const expectedCents = Math.round(Number(order.totalAmount) * 100);
      if (Number.isFinite(amount) && amount > 0 && amount !== expectedCents && Number(amount.toFixed(2)) !== Number(order.totalAmount)) {
        await updateIkhokhaPaymentAttemptStatus(reference, "pending", "AMOUNT_MISMATCH", "iKhokha amount did not match the approved quote total");
        return res.status(400).send("Payment amount mismatch");
      }
      const outcome = getIkhokhaPaymentOutcome(statusPayload);
      const gatewayStatus = [statusPayload.paymentStatus, statusPayload.status, statusPayload.transactionStatus, statusPayload.responseCode]
        .find((value) => typeof value === "string");
      if (outcome === "pending") {
        await updateIkhokhaPaymentAttemptStatus(reference, "pending", typeof gatewayStatus === "string" ? gatewayStatus : null);
        return res.status(202).send("Payment is still pending");
      }
      await updateOrderIkhokhaPayment(reference, outcome);
      await updateIkhokhaPaymentAttemptStatus(reference, outcome, typeof gatewayStatus === "string" ? gatewayStatus : null);
      if (outcome === "paid" && order.paymentStatus !== "paid") {
        const customer = await getUserById(order.userId);
        if (customer?.email) {
          sendPaymentApprovedEmail({
            orderId: order.id,
            customerName: customer.fullName ?? "Valued Customer",
            customerEmail: customer.email,
            total: Number(order.totalAmount ?? "0"),
          }).catch((emailError) => console.error("[iKhokha callback] Payment email error", emailError));
        }
      }
      return res.status(200).send("OK");
    } catch (error) {
      console.error("[iKhokha callback] Failed to process payment status", error);
      if (reference) {
        const message = error instanceof Error ? error.message : "Unexpected iKhokha reconciliation error";
        updateIkhokhaPaymentAttemptStatus(reference, "pending", "RECONCILIATION_ERROR", message)
          .catch((auditError) => console.error("[iKhokha callback] Failed to record reconciliation error", auditError));
      }
      return res.status(500).send("Payment reconciliation failed");
    }
  });
  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
