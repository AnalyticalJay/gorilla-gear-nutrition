import { describe, expect, it } from "vitest";
import { generatePayFastSignature, verifyPayFastItnSignature } from "./payfast";

describe("PayFast signature utility", () => {
  it("generates a valid MD5 signature with passphrase", () => {
    const data = {
      merchant_id: "34646767",
      merchant_key: "admv2dO4kck1k",
      amount: "1450.00",
      item_name: "Test Quote",
    };
    const sig = generatePayFastSignature(data, "secret123");
    expect(sig).toHaveLength(32);

    const isValid = verifyPayFastItnSignature({ ...data, signature: sig }, sig, "secret123");
    expect(isValid).toBe(true);
  });
});
