/**
 * @vitest-environment jsdom
 */
import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";

const mocks = vi.hoisted(() => ({
  orderQuery: vi.fn(),
  invalidate: vi.fn(),
  paymentMutate: vi.fn(),
  trackingMutate: vi.fn(),
}));

vi.mock("@/lib/trpc", () => ({
  trpc: {
    useUtils: () => ({ orders: { detail: { invalidate: mocks.invalidate } } }),
    orders: {
      detail: { useQuery: mocks.orderQuery },
      choosePayment: { useMutation: () => ({ isPending: false, mutate: mocks.paymentMutate }) },
      uploadProof: { useMutation: () => ({ isPending: false, mutate: vi.fn() }) },
      refreshTracking: { useMutation: () => ({ isPending: false, mutate: mocks.trackingMutate, mutateAsync: vi.fn().mockResolvedValue({ configured: false, synced: 0, events: [] }) }) },
    },
  },
}));

vi.mock("@/_core/hooks/useAuth", () => ({
  useAuth: () => ({ isAuthenticated: true, user: { role: "user", email: "member@example.com", fullName: "Member" } }),
}));

vi.mock("wouter", () => ({
  useParams: () => ({ orderId: "42" }),
  Link: ({ href, children }: { href: string; children: React.ReactNode }) => <a href={href}>{children}</a>,
}));

vi.mock("@/components/Navbar", () => ({ default: () => <nav>Navbar</nav> }));
vi.mock("@/components/Footer", () => ({ default: () => <footer>Footer</footer> }));
vi.mock("@/components/QuoteProgressTracker", () => ({ default: () => <div>Quote progress</div> }));
vi.mock("@/components/QuoteConversation", () => ({ default: () => <div>Quote conversation</div> }));

import OrderDetail from "./OrderDetail";

function makeOrder(proofStatus: "pending" | "approved" | "rejected", proofReviewNote: string | null = null, paymentMethod: "eft" | null = "eft") {
  return {
    id: 42,
    userId: 7,
    totalAmount: "850.00",
    deliveryFee: "0.00",
    status: proofStatus === "approved" ? "paid" : "awaiting_payment",
    paymentStatus: proofStatus === "approved" ? "paid" : "proof_uploaded",
    paymentMethod,
    createdAt: new Date("2026-08-12T08:00:00.000Z"),
    reviewedAt: new Date("2026-08-12T09:00:00.000Z"),
    paidAt: proofStatus === "approved" ? new Date("2026-08-12T10:00:00.000Z") : null,
    dispatchedAt: null,
    deliveredAt: null,
    trackingNumber: null,
    trackingCarrier: null,
    trackingUrl: null,
    trackingNotes: null,
    proofStatus,
    proofReviewNote,
    proofOfPaymentUrl: "/manus-storage/orders/42/pop.png",
    quoteNotes: null,
    rejectionReason: null,
    items: [{ id: 1, productName: "Test Product", strength: "10mg", quantity: 2, priceAtPurchase: "425.00" }],
    shipping: null,
    comments: [],
  };
}

describe("customer order detail payment proof status", () => {
  afterEach(() => cleanup());
  it("shows PayFast and EFT actions when payment is awaiting method selection", () => {
    mocks.orderQuery.mockReturnValue({ isLoading: false, data: { ...makeOrder("pending"), paymentMethod: null, proofStatus: "not_submitted", proofOfPaymentUrl: null, paymentStatus: "pending" } });
    render(<OrderDetail />);
    expect(screen.getByRole("button", { name: /pay via payfast/i })).toBeTruthy();
    expect(screen.getByRole("button", { name: /pay via eft/i })).toBeTruthy();
  });

  it("shows payment CTAs for a newly approved quote", () => {
    mocks.orderQuery.mockReturnValue({ isLoading: false, data: { ...makeOrder("pending"), status: "quote_approved", paymentMethod: null, proofStatus: "not_submitted", proofOfPaymentUrl: null, paymentStatus: "pending" } });
    render(<OrderDetail />);
    expect(screen.getByRole("button", { name: /pay via payfast/i })).toBeTruthy();
    expect(screen.getByRole("button", { name: /pay via eft/i })).toBeTruthy();
  });

  it("shows upload and rejected re-upload states for EFT proof", () => {
    mocks.orderQuery.mockReturnValue({ isLoading: false, data: { ...makeOrder("pending"), proofStatus: "not_submitted", proofOfPaymentUrl: null, paymentStatus: "awaiting_eft" } });
    const view = render(<OrderDetail />);
    expect(view.container.querySelector('input[type="file"]')).toBeTruthy();

    mocks.orderQuery.mockReturnValue({ isLoading: false, data: makeOrder("rejected", "Please upload a clearer receipt.") });
    view.rerender(<OrderDetail />);
    expect(view.container.querySelector('input[type="file"]')).toBeTruthy();
    expect(screen.getAllByText(/Please upload a clearer receipt/i).length).toBeGreaterThan(0);
  });

  it("renders pending, approved, and rejected badges with customer guidance", () => {
    mocks.orderQuery.mockReturnValue({ isLoading: false, data: makeOrder("pending") });
    const view = render(<OrderDetail />);
    expect(screen.getByText("Pending review")).toBeTruthy();
    expect(screen.getAllByText("Test Product").length).toBeGreaterThan(0);
    expect(screen.getAllByText("10mg").length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Qty: 2 × R425\.00/).length).toBeGreaterThan(0);
    expect(screen.getAllByText("R850.00").length).toBeGreaterThan(0);

    mocks.orderQuery.mockReturnValue({ isLoading: false, data: makeOrder("approved") });
    view.rerender(<OrderDetail />);
    expect(screen.getByText("Approved")).toBeTruthy();

    mocks.orderQuery.mockReturnValue({ isLoading: false, data: makeOrder("rejected", "Please upload a clearer receipt.") });
    view.rerender(<OrderDetail />);
    expect(screen.getByText("Rejected")).toBeTruthy();
    expect(screen.getAllByText(/Please upload a clearer receipt/i).length).toBeGreaterThan(0);
  });
});
