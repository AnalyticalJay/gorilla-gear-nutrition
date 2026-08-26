import { beforeEach, describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "./_core/context";

const dbMocks = vi.hoisted(() => ({
  getCartItems: vi.fn(),
  createOrder: vi.fn(),
  clearCart: vi.fn(),
  getOrderById: vi.fn(),
  chooseQuotePayment: vi.fn(),
  setOrderIkhokhaPaylink: vi.fn(),
  createIkhokhaPaymentAttempt: vi.fn(),
  recordFailedIkhokhaPaymentAttempt: vi.fn(),
  resetFailedIkhokhaPaymentAttempt: vi.fn(),
  reviewQuote: vi.fn(),
}));

const ikhokhaMocks = vi.hoisted(() => ({
  createIkhokhaPaylink: vi.fn(),
  getIkhokhaConfig: vi.fn(),
}));

vi.mock("./db", async () => ({
  ...(await vi.importActual<typeof import("./db")>("./db")),
  ...dbMocks,
}));

vi.mock("./_core/notification", () => ({
  notifyOwner: vi.fn().mockResolvedValue(true),
}));

vi.mock("./email", () => ({
  sendQuoteConfirmationEmail: vi.fn().mockResolvedValue(true),
}));

vi.mock("./ikhokha", () => ikhokhaMocks);

import { sendQuoteConfirmationEmail } from "./email";
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
      { productId: 11, productName: "Test Product", quantity: 2, productPrice: "100.00", productStock: 5 },
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
    expect(sendQuoteConfirmationEmail).toHaveBeenCalledWith(expect.objectContaining({
      quoteId: 55,
      customerEmail: "member@example.com",
      subtotal: 200,
      deliveryFee: 140,
      total: 340,
      items: [{ productName: "Test Product", quantity: 2, lineTotal: 200 }],
    }));
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

  it("gates payment selection until the quote is approved and permits only iKhokha", async () => {
    dbMocks.getOrderById.mockResolvedValue({ userId: 7, status: "quote_pending" });
    const caller = appRouter.createCaller(makeContext());

    await expect(caller.orders.choosePayment({ orderId: 55, method: "eft" } as never)).rejects.toMatchObject({
      code: "BAD_REQUEST",
    });

    dbMocks.getOrderById.mockResolvedValue({ userId: 7, status: "quote_approved", totalAmount: "200.00" });
    dbMocks.chooseQuotePayment.mockResolvedValue({
      paymentStatus: "pending",
      ikhokhaReference: "GGN-55",
      total: "200.00",
    });
    ikhokhaMocks.getIkhokhaConfig.mockReturnValue({ entityId: "GGN" });
    ikhokhaMocks.createIkhokhaPaylink.mockResolvedValue({ paylinkID: "paylink-55", paylinkUrl: "https://pay.ikhokha.example/55" });

    const ikhokha = await caller.orders.choosePayment({ orderId: 55, method: "ikhokha" });
    expect(ikhokha).toMatchObject({ orderId: 55, method: "ikhokha", ikhokhaReference: "GGN-55", ikhokhaData: { paylinkId: "paylink-55", paylinkUrl: "https://pay.ikhokha.example/55" } });
    expect(ikhokhaMocks.createIkhokhaPaylink).toHaveBeenCalledWith(expect.objectContaining({ entityID: "GGN", amount: 20_000, currency: "ZAR", externalTransactionID: "GGN-55", urls: expect.objectContaining({ callbackUrl: expect.stringContaining("/api/payments/ikhokha/callback?reference=GGN-55"), failurePageUrl: expect.stringContaining("?payment=failed"), cancelUrl: expect.stringContaining("?payment=cancelled") }) }));
    expect(dbMocks.setOrderIkhokhaPaylink).toHaveBeenCalledWith("GGN-55", "paylink-55", "https://pay.ikhokha.example/55");
    expect(dbMocks.chooseQuotePayment).toHaveBeenLastCalledWith(55, 7, "ikhokha");

  });

  it("restores payment selection when iKhokha rejects payment-link creation", async () => {
    dbMocks.getOrderById.mockResolvedValue({ userId: 7, status: "quote_approved", totalAmount: "200.00" });
    dbMocks.chooseQuotePayment.mockResolvedValue({ paymentStatus: "pending", ikhokhaReference: "GGN-55", total: "200.00" });
    ikhokhaMocks.getIkhokhaConfig.mockReturnValue({ entityId: "GGN" });
    ikhokhaMocks.createIkhokhaPaylink.mockRejectedValue(new Error("Gateway unavailable"));

    await expect(appRouter.createCaller(makeContext()).orders.choosePayment({ orderId: 55, method: "ikhokha" })).rejects.toThrow("Gateway unavailable");
    expect(dbMocks.resetFailedIkhokhaPaymentAttempt).toHaveBeenCalledWith(55, 7);
  });


});
