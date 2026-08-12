import { describe, expect, it } from "vitest";
import { buildOrderTimeline, getOrderStatusTimelineUpdates, getTrackingUrl } from "./orderTracking";

describe("order tracking timeline", () => {
  it("progresses through placed, reviewed, paid, dispatched, and delivered", () => {
    const steps = buildOrderTimeline({
      createdAt: "2026-08-12T08:00:00.000Z",
      reviewedAt: "2026-08-12T09:00:00.000Z",
      paidAt: "2026-08-12T10:00:00.000Z",
      dispatchedAt: "2026-08-12T11:00:00.000Z",
      deliveredAt: "2026-08-13T13:00:00.000Z",
      status: "completed",
      paymentStatus: "paid",
      trackingNumber: "TCG123456",
    });

    expect(steps.every((step) => step.completed)).toBe(true);
    expect(steps.map((step) => step.label)).toEqual([
      "Order placed",
      "Quote reviewed",
      "Payment confirmed",
      "Order dispatched",
      "Delivered",
    ]);
  });

  it("keeps a pending quote at the review stage", () => {
    const steps = buildOrderTimeline({
      createdAt: "2026-08-12T08:00:00.000Z",
      status: "quote_pending",
      paymentStatus: "pending",
    });

    expect(steps[0]?.completed).toBe(true);
    expect(steps[1]?.completed).toBe(false);
    expect(steps[1]?.active).toBe(true);
    expect(steps[2]?.completed).toBe(false);
  });

  it("timestamps dispatch and delivery transitions without overwriting an existing dispatch time", () => {
    const now = new Date("2026-08-12T12:00:00.000Z");
    expect(getOrderStatusTimelineUpdates("shipped", null, now)).toEqual({ dispatchedAt: now });
    expect(getOrderStatusTimelineUpdates("processing", null, now)).toEqual({});
    const existingDispatch = new Date("2026-08-12T11:00:00.000Z");
    expect(getOrderStatusTimelineUpdates("completed", existingDispatch, now)).toEqual({ dispatchedAt: existingDispatch, deliveredAt: now });
  });

  it("does not imply courier handoff before dispatch even when a tracking number is assigned", () => {
    const steps = buildOrderTimeline({
      createdAt: "2026-08-12T08:00:00.000Z",
      reviewedAt: "2026-08-12T09:00:00.000Z",
      paidAt: "2026-08-12T10:00:00.000Z",
      status: "paid",
      paymentStatus: "paid",
      trackingNumber: "TEST-TRACK-001",
      trackingCarrier: "The Courier Guy (Test)",
    });

    expect(steps[3]?.completed).toBe(false);
    expect(steps[3]?.active).toBe(true);
    expect(steps[3]?.description).toBe("Tracking number assigned. Dispatch is pending.");
  });

  it("builds a Courier Guy tracking URL when no custom URL is supplied", () => {
    expect(getTrackingUrl("The Courier Guy", "TCG 123/456", null)).toBe("https://thecourierguy.co.za/tracking/");
    expect(getTrackingUrl("Other carrier", "ABC123", null)).toBeNull();
    expect(getTrackingUrl("Other carrier", "ABC123", "https://tracking.example.test/ABC123")).toBe("https://tracking.example.test/ABC123");
  });
});
