import crypto from "crypto";
import { describe, expect, it } from "vitest";
import { getIkhokhaPaymentOutcome, signIkhokhaPath, signIkhokhaRequest } from "./ikhokha";

describe("iKhokha payment helpers", () => {
  it("signs the official payment endpoint path plus exact request body with HMAC-SHA256", () => {
    const endpoint = "https://api.ikhokha.com/public-api/v1/api/payment";
    const body = JSON.stringify({ amount: 20_000, currency: "ZAR", externalTransactionID: "GGN-55" });
    const secret = "test-secret";
    const escapedPayload = ("/public-api/v1/api/payment" + body).replace(/[\\"']/g, "\\$&").replace(/\u0000/g, "\\0");
    const expected = crypto.createHmac("sha256", secret).update(escapedPayload).digest("hex");
    expect(signIkhokhaRequest(endpoint, body, secret)).toBe(expected);
    expect(signIkhokhaPath("https://api.ikhokha.com/public-api/v1/api/getStatus/paylink-55", secret)).toBe(
      crypto.createHmac("sha256", secret).update("/public-api/v1/api/getStatus/paylink-55").digest("hex"),
    );
  });

  it("marks only recognised completed and failed remote statuses as final", () => {
    expect(getIkhokhaPaymentOutcome({ paymentStatus: "PAID" })).toBe("paid");
    expect(getIkhokhaPaymentOutcome({ status: "CANCELLED" })).toBe("failed");
    expect(getIkhokhaPaymentOutcome({ responseCode: "PENDING" })).toBe("pending");
    expect(getIkhokhaPaymentOutcome({})).toBe("pending");
  });
});
