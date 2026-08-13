import { beforeEach, describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "./_core/context";

const dbMocks = vi.hoisted(() => ({
  getCartItems: vi.fn(),
  createOrder: vi.fn(),
  clearCart: vi.fn(),
  getOrderById: vi.fn(),
  chooseQuotePayment: vi.fn(),
  reviewQuote: vi.fn(),
  confirmEftPayment: vi.fn(),
  rejectProofOfPayment: vi.fn(),
}));

vi.mock("./db", async () => ({
  ...(await vi.importActual<typeof import("./db")>("./db")),
  ...dbMocks,
}));

vi.mock("./_core/notification", () => ({
  notifyOwner: vi.fn().mockResolvedValue(true),
}));

import { appRouter } from "./routers";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function makeUser(overrides: Partial<AuthenticatedUser> = {}): AuthenticatedUser {
  return {
    id: 7,
    openId: "quote-member",
    email: "member@example.com",
    fullName: "Quote Member",
    phone: "+27123456789",
    city: "Gqeberha",
    passwordHash: null,
    loginMethod: "email",
    role: "user",
    status: "approved",
    isActive: true,
    isOver18: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
    ...overrides,
  };
}

function makeContext(user = makeUser()): TrpcContext {
  return {
    user,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("quote workflow router", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("submits the approved user's quote cart as a quote_pending order and clears the cart", async () => {
    dbMocks.getCartItems.mockResolvedValue([
      { productId: 11, quantity: 2, productPrice: "100.00", productStock: 5 },
    ]);
    dbMocks.createOrder.mockResolvedValue(55);
    dbMocks.clearCart.mockResolvedValue(undefined);

    const caller = appRouter.createCaller(makeContext());
    const result = await caller.orders.submitQuote({
      shipping: {
        fullName: "Quote Member",
        phone: "+27123456789",
        addressLine1: "1 Main Road",
        city: "Port Elizabeth",
        postalCode: "6001",
        country: "South Africa",
      },
      notes: "Please confirm availability.",
    });

    expect(result).toMatchObject({ quoteId: 55, status: "quote_pending", deliveryFee: "140.00", total: "340.00" });
    expect(dbMocks.createOrder).toHaveBeenCalledWith(expect.objectContaining({
      userId: 7,
      status: "quote_pending",
      quoteNotes: "Please confirm availability.",
      totalAmount: "340.00",
      deliveryFee: "140.00",
      deliveryType: "flat_rate",
    }));
    expect(dbMocks.clearCart).toHaveBeenCalledWith(7);
  });

  it("allows an admin to approve or reject a quote with review notes", async () => {
    const caller = appRouter.createCaller(makeContext(makeUser({ role: "admin" })));

    await caller.orders.review({
      orderId: 55,
      decision: "quote_approved",
      notes: "Approved for payment.",
    });

    expect(dbMocks.reviewQuote).toHaveBeenCalledWith(55, 7, "quote_approved", "Approved for payment.");
  });

  it("gates payment selection until the quote is approved and supports both methods", async () => {
    dbMocks.getOrderById.mockResolvedValue({ userId: 7, status: "quote_pending" });
    const caller = appRouter.createCaller(makeContext());

    await expect(caller.orders.choosePayment({ orderId: 55, method: "eft" })).rejects.toMatchObject({
      code: "PRECONDITION_FAILED",
    });

    dbMocks.getOrderById.mockResolvedValue({ userId: 7, status: "quote_approved" });
    dbMocks.chooseQuotePayment.mockResolvedValue({
      paymentStatus: "awaiting_payfast",
      payfastReference: "AA-55",
      total: "200.00",
    });

    const payfast = await caller.orders.choosePayment({ orderId: 55, method: "payfast" });
    expect(payfast).toMatchObject({ orderId: 55, method: "payfast", payfastReference: "AA-55" });

    dbMocks.chooseQuotePayment.mockResolvedValue({ paymentStatus: "awaiting_eft", eftReference: "EFT-55" });
    const eft = await caller.orders.choosePayment({ orderId: 55, method: "eft" });
    expect(eft).toMatchObject({ orderId: 55, method: "eft", eftReference: "EFT-55" });

    dbMocks.getOrderById.mockResolvedValue({ userId: 7, status: "awaiting_payment", paymentMethod: null });
    dbMocks.chooseQuotePayment.mockResolvedValue({ paymentStatus: "awaiting_eft", eftReference: "EFT-56" });
    const recovered = await caller.orders.choosePayment({ orderId: 55, method: "eft" });
    expect(recovered).toMatchObject({ orderId: 55, method: "eft", eftReference: "EFT-56" });
  });

  it("lets an admin confirm an EFT payment and transition the quote to paid", async () => {
    const caller = appRouter.createCaller(makeContext(makeUser({ role: "admin" })));

    await caller.orders.confirmEft({ orderId: 55 });

    expect(dbMocks.confirmEftPayment).toHaveBeenCalledWith(55);
  });

  it("lets an admin reject a proof with a customer-facing note", async () => {
    const caller = appRouter.createCaller(makeContext(makeUser({ role: "admin" })));

    await caller.orders.rejectProof({ orderId: 55, note: "Please upload a clearer receipt." });

    expect(dbMocks.rejectProofOfPayment).toHaveBeenCalledWith(55, 7, "Please upload a clearer receipt.");
  });
});
