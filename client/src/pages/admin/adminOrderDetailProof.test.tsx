/**
 * @vitest-environment jsdom
 */
import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";

const mocks = vi.hoisted(() => ({
  invalidate: vi.fn(),
  orderQuery: vi.fn(),
}));

vi.mock("@/lib/trpc", () => ({
  trpc: {
    useUtils: () => ({ orders: { adminDetail: { invalidate: mocks.invalidate }, adminList: { invalidate: mocks.invalidate } } }),
    orders: {
      adminDetail: { useQuery: mocks.orderQuery },
      adminUpdateTracking: { useMutation: () => ({ isPending: false, mutate: vi.fn() }) },
      adminUpdateStatus: { useMutation: () => ({ isPending: false, mutate: vi.fn() }) },
      adminSimulateCourierScans: { useMutation: () => ({ isPending: false, mutate: vi.fn() }) },
      adminUpdateFulfilment: { useMutation: () => ({ isPending: false, mutate: vi.fn() }) },
    },
  },
}));

vi.mock("wouter", () => ({
  useParams: () => ({ orderId: "55" }),
  Link: ({ href, children }: { href: string; children: React.ReactNode }) => <a href={href}>{children}</a>,
}));

vi.mock("@/components/QuoteConversation", () => ({ default: () => <div>Quote conversation</div> }));
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

import AdminOrderDetail from "./AdminOrderDetail";

function makeOrder() {
  return {
    id: 55,
    userId: 7,
    totalAmount: "1450.00",
    deliveryFee: "0.00",
    deliveryType: "free",
    status: "awaiting_payment",
    paymentStatus: "proof_uploaded",
    paymentMethod: "eft",
    payfastReference: null,
    proofStatus: "pending",
    proofReviewNote: null,
    proofOfPaymentUrl: "/api/media/orders/55/pop.png",
    createdAt: new Date("2026-08-12T08:00:00.000Z"),
    reviewedAt: new Date("2026-08-12T09:00:00.000Z"),
    paidAt: null,
    dispatchedAt: null,
    deliveredAt: null,
    trackingNumber: null,
    trackingCarrier: "The Courier Guy",
    trackingUrl: null,
    trackingNotes: null,
    quoteNotes: null,
    rejectionReason: null,
    items: [{ id: 1, productId: 12, productName: "Test Product", strength: "10mg", quantity: 1, priceAtPurchase: "1450.00" }],
    shipping: null,
    comments: [],
  };
}

describe("AdminOrderDetail historical proof visibility", () => {
  afterEach(() => cleanup());

  it("shows an existing legacy proof record without active review controls", () => {
    mocks.orderQuery.mockReturnValue({ isLoading: false, data: makeOrder() });
    render(<AdminOrderDetail />);

    expect(screen.getByText("Pending review")).toBeTruthy();
    expect(screen.getByText("Test Product")).toBeTruthy();
    expect(screen.getByText("10mg")).toBeTruthy();
    expect(screen.getByText(/Qty: 1 × R1450\.00/)).toBeTruthy();
    expect(screen.getByText("1 item")).toBeTruthy();
    expect(screen.getByText(/historical eft records are displayed for audit only/i)).toBeTruthy();
    expect(screen.queryByRole("button", { name: /approve.*eft/i })).toBeNull();
    expect(screen.queryByRole("button", { name: /reject pop/i })).toBeNull();
  });
});
