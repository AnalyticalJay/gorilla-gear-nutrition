/**
 * @vitest-environment jsdom
 */
import React from "react";
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import OrderStatusSummaryCard, { type CustomerOrderSummary } from "./OrderStatusSummaryCard";

const makeOrder = (overrides: Partial<CustomerOrderSummary> = {}): CustomerOrderSummary => ({
  id: 42,
  totalAmount: "1450.00",
  createdAt: new Date("2026-08-13T08:00:00.000Z"),
  reviewedAt: new Date("2026-08-13T09:00:00.000Z"),
  paidAt: new Date("2026-08-13T10:00:00.000Z"),
  dispatchedAt: null,
  deliveredAt: null,
  status: "processing",
  paymentStatus: "paid",
  trackingNumber: null,
  trackingCarrier: null,
  trackingUrl: null,
  trackingNotes: null,
  ...overrides,
});

describe("OrderStatusSummaryCard", () => {
  afterEach(() => cleanup());

  it("shows a browse action when the customer has no orders", () => {
    render(<OrderStatusSummaryCard orders={[]} />);

    expect(screen.getByText("No order activity yet")).toBeTruthy();
    const browseLink = screen.getByRole("link", { name: /browse products/i });
    expect(browseLink.getAttribute("href")).toBe("/products");
    expect(browseLink.className).toContain("bg-[#a8751c]");
  });

  it("summarizes the latest active order with status and progress", () => {
    render(<OrderStatusSummaryCard orders={[makeOrder()]} />);

    expect(screen.getByText("Quote #42")).toBeTruthy();
    expect(screen.getByText("Processing · Updated from your order timeline.")).toBeTruthy();
    expect(screen.getByRole("progressbar").getAttribute("aria-valuenow")).toBe("60");
    expect(screen.getByRole("link", { name: /view tracking/i }).getAttribute("href")).toBe("/orders/42");
    expect(screen.getByRole("progressbar").firstElementChild?.className).toContain("bg-[#a8751c]");
  });

  it("prefers an active order over a newer terminal order", () => {
    render(
      <OrderStatusSummaryCard
        orders={[
          makeOrder({ id: 42, createdAt: new Date("2026-08-13T08:00:00.000Z"), status: "processing" }),
          makeOrder({ id: 43, createdAt: new Date("2026-08-14T08:00:00.000Z"), status: "completed", paymentStatus: "paid", dispatchedAt: new Date("2026-08-14T09:00:00.000Z"), deliveredAt: new Date("2026-08-14T10:00:00.000Z") }),
        ]}
      />,
    );

    expect(screen.getByText("Quote #42")).toBeTruthy();
    expect(screen.queryByText("Quote #43")).toBeNull();
    expect(screen.getByText("1 active")).toBeTruthy();
  });
});
