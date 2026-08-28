import { describe, expect, it } from "vitest";
import { proofStatusMeta, resolveProofStatus } from "./paymentProof";

describe("payment proof status", () => {
  it("resolves explicit review states and exposes customer-facing labels", () => {
    expect(resolveProofStatus({ proofStatus: "pending" })).toBe("pending");
    expect(resolveProofStatus({ proofStatus: "approved" })).toBe("approved");
    expect(resolveProofStatus({ proofStatus: "rejected" })).toBe("rejected");
    expect(proofStatusMeta.pending.label).toBe("Pending review");
    expect(proofStatusMeta.approved.label).toBe("Approved");
    expect(proofStatusMeta.rejected.label).toBe("Rejected");
  });

  it("falls back to pending for legacy uploaded receipts", () => {
    expect(resolveProofStatus({ proofStatus: "not_submitted", proofOfPaymentUrl: "/api/media/pop.png" })).toBe("pending");
    expect(resolveProofStatus({ proofStatus: null, paymentStatus: "proof_uploaded" })).toBe("pending");
    expect(resolveProofStatus({ proofStatus: "not_submitted", paymentStatus: "awaiting_eft" })).toBe("not_submitted");
  });
});
