import { describe, expect, it } from "vitest";

describe("PayFast credential configuration", () => {
  it("exposes the required production credential set without leaking values", () => {
    const merchantId = process.env.PAYFAST_MERCHANT_ID?.trim();
    const merchantKey = process.env.PAYFAST_MERCHANT_KEY?.trim();
    const passphrase = process.env.PAYFAST_PASSPHRASE?.trim();

    expect(merchantId).toMatch(/^\d+$/);
    expect(merchantKey).toMatch(/^[A-Za-z0-9]+$/);
    expect(passphrase).toBeTruthy();

    expect(merchantId).not.toContain(merchantKey);
  });
});
