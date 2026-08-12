import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import { canChooseQuotePayment, paymentStatusLabel, quoteStatusLabel } from "../shared/quoteWorkflow";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 7,
    openId: "quote-user",
    email: "member@example.com",
    fullName: "Quote Member",
    phone: null,
    city: null,
    passwordHash: null,
    loginMethod: "email",
    role: "user",
    status: "approved",
    isActive: true,
    isOver18: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("quote workflow", () => {
  it("only allows payment selection after admin approval", () => {
    expect(canChooseQuotePayment("quote_pending")).toBe(false);
    expect(canChooseQuotePayment("quote_rejected")).toBe(false);
    expect(canChooseQuotePayment("quote_approved")).toBe(true);
  });

  it("formats quote and payment statuses for customer-facing labels", () => {
    expect(quoteStatusLabel("quote_pending")).toBe("Quote Pending");
    expect(quoteStatusLabel("awaiting_payment")).toBe("Awaiting Payment");
    expect(paymentStatusLabel("awaiting_eft")).toBe("Awaiting Eft");
  });

  it("blocks the legacy direct checkout procedure", async () => {
    const caller = appRouter.createCaller(createContext());
    await expect(caller.orders.create()).rejects.toMatchObject({
      code: "PRECONDITION_FAILED",
    });
  });
});
