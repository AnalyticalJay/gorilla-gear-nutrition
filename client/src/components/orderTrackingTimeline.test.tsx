/**
 * @vitest-environment jsdom
 */
import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import OrderTrackingTimeline from "./OrderTrackingTimeline";

const baseTrackingOrder = {
  createdAt: new Date("2026-08-12T08:00:00.000Z"),
  reviewedAt: new Date("2026-08-12T09:00:00.000Z"),
  paidAt: null,
  dispatchedAt: null,
  deliveredAt: null,
  status: "awaiting_payment",
  paymentStatus: "pending",
  trackingNumber: null,
  trackingCarrier: null,
  trackingUrl: null,
  trackingNotes: null,
};

describe("OrderTrackingTimeline", () => {
  afterEach(() => cleanup());

  it("renders the lifecycle, tracking number, and courier link without overflow-specific assumptions", () => {
    render(
      <OrderTrackingTimeline
        order={{
          createdAt: new Date("2026-08-12T08:00:00.000Z"),
          reviewedAt: new Date("2026-08-12T09:00:00.000Z"),
          paidAt: new Date("2026-08-12T10:00:00.000Z"),
          dispatchedAt: new Date("2026-08-12T11:00:00.000Z"),
          deliveredAt: null,
          status: "shipped",
          paymentStatus: "paid",
          trackingNumber: "TCG123456789",
          trackingCarrier: "The Courier Guy",
          trackingUrl: null,
          trackingNotes: "Dispatched from Johannesburg depot.",
        }}
      />,
    );

    expect(screen.getByRole("region", { name: /order tracking timeline/i })).toBeTruthy();
    expect(screen.getByText("TCG123456789")).toBeTruthy();
    expect(screen.getByText(/Dispatched from Johannesburg depot/i)).toBeTruthy();
    expect(screen.getByRole("link", { name: /track with courier/i }).getAttribute("href")).toBe("https://thecourierguy.co.za/tracking/");
    expect(screen.getAllByText("Delivered").length).toBeGreaterThan(0);
  });

  it.each([
    ["awaiting payment", "awaiting_payment", "pending", 40, "Payment confirmed"],
    ["processing", "processing", "paid", 60, "Preparing dispatch"],
    ["shipped", "shipped", "paid", 80, "Delivered"],
    ["delivered", "completed", "paid", 100, "Delivered"],
    ["rejected", "quote_rejected", "pending", 40, "Quote not approved"],
    ["cancelled", "cancelled", "pending", 40, "Order cancelled"],
  ])("maps the %s backend state to the correct visual progress", (_label, status, paymentStatus, progress, currentLabel) => {
    const isPaid = ["processing", "shipped", "completed"].includes(status);
    const isDispatched = ["shipped", "completed"].includes(status);
    const isDelivered = status === "completed";
    render(
      <OrderTrackingTimeline
        order={{
          ...baseTrackingOrder,
          status,
          paymentStatus,
          paidAt: isPaid ? new Date("2026-08-12T10:00:00.000Z") : null,
          dispatchedAt: isDispatched ? new Date("2026-08-12T11:00:00.000Z") : null,
          deliveredAt: isDelivered ? new Date("2026-08-12T12:00:00.000Z") : null,
          trackingNumber: isDispatched ? "TCG123456789" : null,
          trackingCarrier: isDispatched ? "The Courier Guy" : null,
        }}
      />,
    );

    expect(screen.getByRole("progressbar").getAttribute("aria-valuenow")).toBe(String(progress));
    expect(screen.getAllByText(currentLabel).length).toBeGreaterThan(0);
  });

  it("renders normalized live courier scan events below the lifecycle milestones", () => {
    render(
      <OrderTrackingTimeline
        order={{
          createdAt: new Date("2026-08-12T08:00:00.000Z"),
          reviewedAt: new Date("2026-08-12T09:00:00.000Z"),
          paidAt: new Date("2026-08-12T10:00:00.000Z"),
          dispatchedAt: new Date("2026-08-12T11:00:00.000Z"),
          deliveredAt: null,
          status: "shipped",
          paymentStatus: "paid",
          trackingNumber: "TCG123456789",
          trackingCarrier: "The Courier Guy",
          trackingUrl: null,
          trackingNotes: null,
          trackingEvents: [{
            id: 9,
            eventCode: "OUT_FOR_DELIVERY",
            statusLabel: "Out for delivery",
            description: "Courier vehicle departed the depot.",
            location: "Gqeberha depot",
            source: "courier_api",
            occurredAt: new Date("2026-08-13T10:00:00.000Z"),
          }],
        }}
      />,
    );

    expect(screen.getByText("Live carrier activity")).toBeTruthy();
    expect(screen.getByText("Out for delivery")).toBeTruthy();
    expect(screen.getByText("Courier vehicle departed the depot.")).toBeTruthy();
    expect(screen.getByText("Gqeberha depot")).toBeTruthy();
  });

  it("shows dynamic progress, the current milestone, and a manual refresh control", () => {
    const onRefresh = vi.fn();
    render(
      <OrderTrackingTimeline
        order={{
          createdAt: new Date("2026-08-12T08:00:00.000Z"),
          reviewedAt: new Date("2026-08-12T09:00:00.000Z"),
          paidAt: new Date("2026-08-12T10:00:00.000Z"),
          dispatchedAt: null,
          deliveredAt: null,
          status: "processing",
          paymentStatus: "paid",
          trackingNumber: "TCG123456789",
          trackingCarrier: "The Courier Guy",
          trackingUrl: null,
          trackingNotes: null,
        }}
        onRefresh={onRefresh}
        lastUpdatedAt={Date.parse("2026-08-12T10:05:00.000Z")}
      />,
    );

    expect(screen.getByRole("progressbar").getAttribute("aria-valuenow")).toBe("60");
    expect(screen.getAllByText("Dispatch pending").length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Tracking number assigned\. Dispatch is pending\./i).length).toBeGreaterThan(0);
    expect(screen.getByText("Current")).toBeTruthy();
    expect(screen.getByText(/Last checked/i)).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: /refresh order status/i }));
    expect(onRefresh).toHaveBeenCalledTimes(1);
  });
});
