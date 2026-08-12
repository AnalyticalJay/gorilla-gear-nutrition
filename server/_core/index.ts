import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { registerStorageProxy } from "./storageProxy";
import { appRouter } from "../routers";
import { getOrderByPayFastReference, updateOrderPayment } from "../db";
import { getPayFastConfig, verifyPayFastItnSignature } from "../payfast";
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

  // PayFast sends ITN callbacks as form-encoded POST data, not tRPC JSON.
  app.post("/api/payments/payfast/itn", async (req, res) => {
    try {
      const payload = Object.fromEntries(Object.entries(req.body ?? {}).map(([key, value]) => [key, String(value ?? "")]));
      const cfg = getPayFastConfig();
      if (payload.merchant_id !== cfg.merchantId || !payload.signature || !verifyPayFastItnSignature(payload, payload.signature, cfg.passphrase)) {
        res.status(400).send("Invalid PayFast signature");
        return;
      }
      if (!payload.m_payment_id || !payload.payment_status) {
        res.status(400).send("Missing PayFast payment fields");
        return;
      }
      const order = await getOrderByPayFastReference(payload.m_payment_id);
      if (!order) {
        res.status(404).send("Payment reference not found");
        return;
      }
      if (payload.amount_gross && Number(payload.amount_gross).toFixed(2) !== Number(order.totalAmount).toFixed(2)) {
        res.status(400).send("Payment amount mismatch");
        return;
      }
      const status = payload.payment_status === "COMPLETE" ? "paid" : "failed";
      await updateOrderPayment(payload.m_payment_id, status);
      res.status(200).send("OK");
    } catch (error) {
      console.error("[PayFast ITN] Failed to process callback", error);
      res.status(500).send("ITN processing failed");
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
