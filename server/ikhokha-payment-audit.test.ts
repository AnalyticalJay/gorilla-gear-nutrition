import { vi, describe, expect, it } from "vitest";
import type { TrpcContext } from "./_core/context";

const dbMocks = vi.hoisted(() => ({ getIkhokhaPaymentAttempts: vi.fn() }));

vi.mock("./db", async () => ({
  ...(await vi.importActual<typeof import("./db")>("./db")),
  ...dbMocks,
}));

import { appRouter } from "./routers";

function makeContext(role: "admin" | "user"): TrpcContext {
  return {
    user: { id: 1, openId: "payment-audit-admin", fullName: "Payment Admin", email: "admin@example.com", role, status: "approved", isActive: true },
    req: { protocol: "https", headers: { cookie: "" } },
    res: { cookie: vi.fn(), clearCookie: vi.fn() },
  } as unknown as TrpcContext;
}

describe("iKhokha payment-attempt audit access", () => {
  it("returns internal link and payment status records to admins", async () => {
    const attempts = [{ id: 4, orderId: 55, externalReference: "GGN-55-123", paylinkId: "link-55", amountCents: 14_500, status: "pending", gatewayStatus: "PAYLINK_CREATED", failureReason: null, createdAt: new Date(), updatedAt: new Date(), completedAt: null, orderStatus: "awaiting_payment", paymentStatus: "pending", customerName: "Member", customerEmail: "member@example.com" }];
    dbMocks.getIkhokhaPaymentAttempts.mockResolvedValueOnce(attempts);

    const result = await appRouter.createCaller(makeContext("admin")).admin.ikhokhaPaymentAudit();

    expect(result).toEqual(attempts);
    expect(dbMocks.getIkhokhaPaymentAttempts).toHaveBeenCalledOnce();
  });

  it("rejects payment-attempt audit access for non-admin users", async () => {
    await expect(appRouter.createCaller(makeContext("user")).admin.ikhokhaPaymentAudit()).rejects.toMatchObject({ code: "FORBIDDEN" });
  });
});
