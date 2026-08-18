import crypto from "crypto";
import { describe, expect, it } from "vitest";

const API_BASE = "https://api.ikhokha.com/public-api/v1/api";

describe("iKhokha credential configuration", () => {
  it("authenticates a read-only payment-history request without creating a charge", async () => {
    const appId = process.env.IKHOKHA_APP_ID?.trim();
    const appSecret = process.env.IKHOKHA_APP_SECRET?.trim();

    expect(appId, "IKHOKHA_APP_ID must be configured").toBeTruthy();
    expect(appSecret, "IKHOKHA_APP_SECRET must be configured").toBeTruthy();

    const endDate = new Date();
    const startDate = new Date(endDate);
    startDate.setDate(endDate.getDate() - 1);
    const formatDate = (value: Date) => value.toISOString().slice(0, 10);
    const endpoint = `${API_BASE}/payments/history?startDate=${formatDate(startDate)}&endDate=${formatDate(endDate)}`;
    const signingPath = new URL(endpoint).pathname;
    const signature = crypto.createHmac("sha256", appSecret!).update(signingPath).digest("hex");

    const response = await fetch(endpoint, {
      headers: {
        Accept: "application/json",
        "IK-APPID": appId!,
        "IK-SIGN": signature,
      },
    });

    expect([401, 403], "iKhokha rejected the configured credentials").not.toContain(response.status);
  }, 20_000);
});
