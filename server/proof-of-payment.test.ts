import { beforeEach, describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "./_core/context";

const dbMocks = vi.hoisted(() => ({
  getOrderById: vi.fn(),
  uploadProofOfPayment: vi.fn(),
}));

vi.mock("./db", async () => ({
  ...(await vi.importActual<typeof import("./db")>("./db")),
  ...dbMocks,
}));

const storageMocks = vi.hoisted(() => ({
  storagePut: vi.fn().mockResolvedValue({ key: "orders/42/pop.png", url: "/manus-storage/orders/42/pop.png" }),
}));

vi.mock("./storage", () => storageMocks);

import { appRouter } from "./routers";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function makeUser(overrides: Partial<AuthenticatedUser> = {}): AuthenticatedUser {
  return {
    id: 7,
    openId: "customer-member",
    email: "member@example.com",
    fullName: "Customer Member",
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

describe("proof of payment workflow", () => {
  beforeEach(() => vi.clearAllMocks());

  it("allows a customer to upload a proof of payment for their approved quote", async () => {
    dbMocks.getOrderById.mockResolvedValue({
      id: 42,
      userId: 7,
      status: "awaiting_payment",
      paymentStatus: "awaiting_eft",
      paymentMethod: "eft",
      items: [{ id: 1, productName: "Test Product", quantity: 2, priceAtPurchase: "100.00" }],
    });

    const caller = appRouter.createCaller(makeContext());
    const result = await caller.orders.uploadProof({
      orderId: 42,
      dataUrl: "data:image/png;base64,iVBORw0KGgo=",
      fileName: "pop.png",
    });

    expect(result).toMatchObject({ success: true });
    expect(result.url).toContain("/manus-storage/orders/42/");
    expect(storageMocks.storagePut).toHaveBeenCalled();
    expect(dbMocks.uploadProofOfPayment).toHaveBeenCalledWith(42, 7, expect.any(String), expect.any(String));
  });
});
