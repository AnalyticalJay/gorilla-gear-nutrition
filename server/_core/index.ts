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
import { sendAdminNotificationEmail, sendPaymentApprovedEmail } from "../email";
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
  app.disable("x-powered-by");
  app.set("trust proxy", 1);
  app.use((_req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "SAMEORIGIN");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    res.setHeader("Permissions-Policy", "camera=(), geolocation=(), microphone=()");
    res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
    next();
  });
  // Supports the largest permitted proof-of-payment upload after base64 encoding while bounding request memory.
  app.use(express.json({ limit: "12mb" }));
  app.use(express.urlencoded({ limit: "12mb", extended: true }));
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
        await Promise.all([
          customer?.email
            ? sendPaymentApprovedEmail({
                orderId: order.id,
                customerName: customer.fullName ?? "Valued Customer",
                customerEmail: customer.email,
                total: Number(order.totalAmount ?? "0"),
              })
            : Promise.resolve(false),
          sendAdminNotificationEmail({
            subject: `Payment received — Order #${order.id} | Gorilla Gear Nutrition`,
            title: `Payment received for Order #${order.id}`,
            content: `Amount: R${Number(order.totalAmount ?? "0").toFixed(2)}\nCustomer: ${customer?.fullName ?? "Unknown customer"}\nEmail: ${customer?.email ?? "Unavailable"}\nReference: ${reference}\n\nThe order is ready for fulfilment processing.`,
          }),
        ]);
      }
      if (outcome === "failed") {
        const customer = await getUserById(order.userId);
        await sendAdminNotificationEmail({
          subject: `Payment failed — Order #${order.id} | Gorilla Gear Nutrition`,
          title: `Payment failed for Order #${order.id}`,
          content: `Customer: ${customer?.fullName ?? "Unknown customer"}\nEmail: ${customer?.email ?? "Unavailable"}\nReference: ${reference}\nGateway status: ${typeof gatewayStatus === "string" ? gatewayStatus : "Not supplied"}\n\nPlease review the iKhokha payment audit.`,
        });
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
