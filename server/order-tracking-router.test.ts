import { beforeEach, describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "./_core/context";

const dbMocks = vi.hoisted(() => ({
  updateOrderTracking: vi.fn(),
  updateOrderStatus: vi.fn(),
  getOrderById: vi.fn(),
  getOrderTrackingEvents: vi.fn(),
  saveOrderTrackingEvents: vi.fn(),
}));

const courierMocks = vi.hoisted(() => ({
  syncCourierTracking: vi.fn(),
}));

vi.mock("./db", async () => ({
  ...(await vi.importActual<typeof import("./db")>("./db")),
  ...dbMocks,
}));

vi.mock("./courierTracking", () => courierMocks);

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

  it("returns a safe not-configured response for a customer when the carrier endpoint is missing", async () => {
    dbMocks.getOrderById.mockResolvedValue({ id: 42, userId: 7, trackingNumber: "TCG123456789", trackingEvents: [] });
    courierMocks.syncCourierTracking.mockResolvedValue({ configured: false, synced: 0, events: [], message: "Endpoint missing" });
    dbMocks.getOrderTrackingEvents.mockResolvedValue([]);

    const result = await appRouter.createCaller(makeContext(makeUser({ role: "user" }))).orders.refreshTracking({ orderId: 42 });

    expect(result).toMatchObject({ configured: false, synced: 0, message: "Endpoint missing", events: [] });
    expect(dbMocks.saveOrderTrackingEvents).not.toHaveBeenCalled();
  });

  it("persists normalized carrier events and returns the refreshed event list", async () => {
    const event = {
      eventCode: "OUT_FOR_DELIVERY",
      statusLabel: "Out for delivery",
      description: "Courier vehicle departed the depot.",
      location: "Gqeberha depot",
      externalEventId: "scan-2",
      source: "courier_api",
      occurredAt: new Date("2026-08-13T10:00:00.000Z"),
    };
    dbMocks.getOrderById.mockResolvedValue({ id: 42, userId: 7, trackingNumber: "TCG123456789", trackingEvents: [] });
    courierMocks.syncCourierTracking.mockResolvedValue({ configured: true, synced: 1, events: [event] });
    dbMocks.getOrderTrackingEvents.mockResolvedValue([{ id: 9, orderId: 42, ...event }]);

    const result = await appRouter.createCaller(makeContext(makeUser({ role: "user" }))).orders.refreshTracking({ orderId: 42 });

    expect(dbMocks.saveOrderTrackingEvents).toHaveBeenCalledWith(42, [event]);
    expect(result).toMatchObject({ configured: true, synced: 1, events: [{ id: 9, statusLabel: "Out for delivery" }] });
  });
});
