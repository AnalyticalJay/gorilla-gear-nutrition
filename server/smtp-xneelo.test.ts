import { describe, expect, it } from "vitest";
import nodemailer from "nodemailer";
import { ENV } from "./_core/env";

describe("Xneelo SMTP configuration", () => {
  it("authenticates with the configured SMTP server without sending mail", async () => {
    if (process.env.RUN_LIVE_SMTP_TEST !== "true") return;
    expect(ENV.smtpHost).toBeTruthy();
    expect(ENV.smtpPort).toBeGreaterThan(0);
    expect(ENV.smtpUser).toBeTruthy();
    expect(ENV.smtpPassword).toBeTruthy();
    expect(ENV.smtpFrom).toBeTruthy();
    expect(process.env.ADMIN_NOTIFICATION_EMAIL).toMatch(/^[^@\s]+@[^@\s]+\.[^@\s]+$/);

    const transporter = nodemailer.createTransport({
      host: ENV.smtpHost,
      port: ENV.smtpPort,
      secure: ENV.smtpSecure,
      tls: ENV.smtpTlsServername ? { servername: ENV.smtpTlsServername, rejectUnauthorized: true } : undefined,
      auth: { user: ENV.smtpUser, pass: ENV.smtpPassword },
      connectionTimeout: 10_000,
      greetingTimeout: 10_000,
      socketTimeout: 10_000,
    });

    await expect(transporter.verify()).resolves.toBe(true);
    transporter.close();
  }, 20_000);
});
