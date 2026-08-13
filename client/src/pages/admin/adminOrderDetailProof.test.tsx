/**
 * @vitest-environment jsdom
 */
import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";

const mocks = vi.hoisted(() => ({
  rejectProofMutate: vi.fn(),
  confirmEftMutate: vi.fn(),
  invalidate: vi.fn(),
  orderQuery: vi.fn(),
}));

vi.mock("@/lib/trpc", () => ({
  trpc: {
    useUtils: () => ({ orders: { adminDetail: { invalidate: mocks.invalidate }, adminList: { invalidate: mocks.invalidate } } }),
    orders: {
      adminDetail: { useQuery: mocks.orderQuery },
      confirmEft: { useMutation: () => ({ isPending: false, mutate: mocks.confirmEftMutate }) },
      rejectProof: { useMutation: () => ({ isPending: false, mutate: mocks.rejectProofMutate }) },
      adminUpdateTracking: { useMutation: () => ({ isPending: false, mutate: vi.fn() }) },
      adminUpdateStatus: { useMutation: () => ({ isPending: false, mutate: vi.fn() }) },
      adminSimulateCourierScans: { useMutation: () => ({ isPending: false, mutate: vi.fn() }) },
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
    proofOfPaymentUrl: "/manus-storage/orders/55/pop.png",
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

describe("AdminOrderDetail proof review", () => {
  afterEach(() => cleanup());

  it("shows the pending badge and calls reject with the admin note", () => {
    mocks.orderQuery.mockReturnValue({ isLoading: false, data: makeOrder() });
    render(<AdminOrderDetail />);

    expect(screen.getByText("Pending review")).toBeTruthy();
    fireEvent.change(screen.getByPlaceholderText(/optional rejection reason/i), { target: { value: "Receipt is not legible." } });
    fireEvent.click(screen.getByRole("button", { name: /reject pop/i }));

    expect(mocks.rejectProofMutate).toHaveBeenCalledWith({ orderId: 55, note: "Receipt is not legible." });
  });

  it("calls approve and confirm when the admin accepts the uploaded proof", () => {
    mocks.orderQuery.mockReturnValue({ isLoading: false, data: makeOrder() });
    render(<AdminOrderDetail />);

    fireEvent.click(screen.getByRole("button", { name: /approve & confirm eft/i }));
    expect(mocks.confirmEftMutate).toHaveBeenCalledWith({ orderId: 55 });
  });
});
