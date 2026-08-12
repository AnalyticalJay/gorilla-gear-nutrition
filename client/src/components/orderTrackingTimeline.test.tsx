/**
 * @vitest-environment jsdom
 */
import React from "react";
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import OrderTrackingTimeline from "./OrderTrackingTimeline";

describe("OrderTrackingTimeline", () => {
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
    expect(screen.getByText("Delivered")).toBeTruthy();
  });
});
