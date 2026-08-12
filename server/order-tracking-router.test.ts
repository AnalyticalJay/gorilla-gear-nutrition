import { beforeEach, describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "./_core/context";

const dbMocks = vi.hoisted(() => ({
  updateOrderTracking: vi.fn(),
  updateOrderStatus: vi.fn(),
}));

vi.mock("./db", async () => ({
  ...(await vi.importActual<typeof import("./db")>("./db")),
  ...dbMocks,
}));

import { appRouter } from "./routers";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function makeUser(overrides: Partial<AuthenticatedUser> = {}): AuthenticatedUser {
  return {
    id: 7,
    openId: "tracking-admin",
    email: "admin@example.com",
    fullName: "Tracking Admin",
    phone: null,
    city: null,
    passwordHash: null,
    loginMethod: "email",
    role: "admin",
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

describe("order tracking router", () => {
  beforeEach(() => vi.clearAllMocks());

  it("allows an admin to save tracking metadata for an order", async () => {
    const caller = appRouter.createCaller(makeContext());

    await caller.orders.adminUpdateTracking({
      orderId: 42,
      trackingNumber: "TCG123456789",
      trackingCarrier: "The Courier Guy",
      trackingUrl: "https://thecourierguy.co.za/tracking/",
      trackingNotes: "Dispatched from Johannesburg depot.",
    });

    expect(dbMocks.updateOrderTracking).toHaveBeenCalledWith(42, {
      trackingNumber: "TCG123456789",
      trackingCarrier: "The Courier Guy",
      trackingUrl: "https://thecourierguy.co.za/tracking/",
      trackingNotes: "Dispatched from Johannesburg depot.",
    });
  });

  it("rejects tracking changes from a non-admin member", async () => {
    const caller = appRouter.createCaller(makeContext(makeUser({ role: "user" })));

    await expect(caller.orders.adminUpdateTracking({ orderId: 42, trackingNumber: "TCG123456789" })).rejects.toMatchObject({ code: "FORBIDDEN" });
    expect(dbMocks.updateOrderTracking).not.toHaveBeenCalled();
  });

  it("passes status transitions to the existing admin status mutation", async () => {
    const caller = appRouter.createCaller(makeContext());

    await caller.orders.adminUpdateStatus({ orderId: 42, status: "shipped", notes: "Handed to courier." });

    expect(dbMocks.updateOrderStatus).toHaveBeenCalledWith(42, "shipped", "Handed to courier.");
  });
});
