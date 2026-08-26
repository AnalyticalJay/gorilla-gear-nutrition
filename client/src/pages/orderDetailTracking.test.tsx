/**
 * @vitest-environment jsdom
 */
import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";

const mocks = vi.hoisted(() => ({
  orderQuery: vi.fn(),
  invalidate: vi.fn(),
  paymentMutate: vi.fn(),
  paymentPending: false,
  location: "/orders/42",
  trackingMutate: vi.fn(),
}));

vi.mock("@/lib/trpc", () => ({
  trpc: {
    useUtils: () => ({ orders: { detail: { invalidate: mocks.invalidate } } }),
    orders: {
      detail: { useQuery: mocks.orderQuery },
      choosePayment: { useMutation: (options: { onMutate?: (input: { method: "ikhokha" }) => void } = {}) => ({ isPending: mocks.paymentPending, mutate: (input: { orderId: number; method: "ikhokha" }) => { mocks.paymentMutate(input); options.onMutate?.(input); } }) },
      refreshTracking: { useMutation: () => ({ isPending: false, mutate: mocks.trackingMutate, mutateAsync: vi.fn().mockResolvedValue({ configured: false, synced: 0, events: [] }) }) },
    },
  },
}));

vi.mock("@/_core/hooks/useAuth", () => ({
  useAuth: () => ({ isAuthenticated: true, user: { role: "user", email: "member@example.com", fullName: "Member" } }),
}));

vi.mock("wouter", () => ({
  useParams: () => ({ orderId: "42" }),
  useLocation: () => [mocks.location, vi.fn()],
  Link: ({ href, children }: { href: string; children: React.ReactNode }) => <a href={href}>{children}</a>,
}));

vi.mock("@/components/Navbar", () => ({ default: () => <nav>Navbar</nav> }));
vi.mock("@/components/Footer", () => ({ default: () => <footer>Footer</footer> }));
vi.mock("@/components/QuoteProgressTracker", () => ({ default: () => <div>Quote progress</div> }));
vi.mock("@/components/QuoteConversation", () => ({ default: () => <div>Quote conversation</div> }));

import OrderDetail from "./OrderDetail";

function makeOrder(paymentMethod: "eft" | "ikhokha" | null = "ikhokha") {
  return {
    id: 42,
    userId: 7,
    totalAmount: "850.00",
    deliveryFee: "0.00",
    status: "awaiting_payment",
    paymentStatus: "pending",
    paymentMethod,
    createdAt: new Date("2026-08-12T08:00:00.000Z"),
    reviewedAt: new Date("2026-08-12T09:00:00.000Z"),
    paidAt: null,
    dispatchedAt: null,
    deliveredAt: null,
    trackingNumber: null,
    trackingCarrier: null,
    trackingUrl: null,
    trackingNotes: null,
    proofStatus: "not_submitted",
    proofReviewNote: null,
    proofOfPaymentUrl: null,
    quoteNotes: null,
    rejectionReason: null,
    items: [{ id: 1, productName: "Test Product", strength: "10mg", quantity: 2, priceAtPurchase: "425.00" }],
    shipping: null,
    comments: [],
  };
}

describe("customer order detail iKhokha-only payment flow", () => {
  afterEach(() => { mocks.paymentPending = false; mocks.location = "/orders/42"; cleanup(); });
  it("shows only iKhokha checkout when payment is awaiting method selection", () => {
    mocks.orderQuery.mockReturnValue({ isLoading: false, data: { ...makeOrder(null), paymentMethod: null } });
    render(<OrderDetail />);
    expect(screen.getByRole("button", { name: /pay securely with iKhokha/i })).toBeTruthy();
    expect(screen.queryByRole("button", { name: /manual eft.*pop/i })).toBeNull();
    expect(document.querySelector('input[type="file"]')).toBeNull();
    expect(screen.getByText(/Secure iKhokha checkout/i)).toBeTruthy();
    mocks.paymentMutate.mockClear();
    fireEvent.click(screen.getByRole("button", { name: /pay securely with iKhokha/i }));
    expect(mocks.paymentMutate).toHaveBeenCalledWith({ orderId: 42, method: "ikhokha" });
  });

  it("shows payment CTAs for a newly approved quote", () => {
    mocks.orderQuery.mockReturnValue({ isLoading: false, data: { ...makeOrder(null), status: "quote_approved", paymentMethod: null } });
    render(<OrderDetail />);
    expect(screen.getByRole("button", { name: /pay securely with iKhokha/i })).toBeTruthy();
    expect(screen.queryByText(/manual eft/i)).toBeNull();
  });

  it("shows a clear loading state while iKhokha payment-link generation is in progress", () => {
    mocks.orderQuery.mockReturnValue({ isLoading: false, data: { ...makeOrder(null), status: "quote_approved", paymentMethod: null } });
    render(<OrderDetail />);
    mocks.paymentPending = true;
    fireEvent.click(screen.getByRole("button", { name: /pay securely with iKhokha/i }));
    expect(screen.getByRole("status").textContent).toMatch(/creating your secure iKhokha payment link/i);
    expect((screen.getByRole("button", { name: /preparing secure checkout/i }) as HTMLButtonElement).disabled).toBe(true);
  });

  it("explains a failed iKhokha return and keeps the approved quote available for a secure retry", () => {
    mocks.location = "/orders/42?payment=failed";
    mocks.orderQuery.mockReturnValue({ isLoading: false, data: { ...makeOrder(null), status: "awaiting_payment", paymentMethod: null, paymentStatus: "failed" } });
    render(<OrderDetail />);
    expect(screen.getByRole("alert").textContent).toMatch(/payment was not completed/i);
    expect(screen.getByRole("button", { name: /pay securely with iKhokha/i })).toBeTruthy();
    expect(screen.queryByText(/manual eft/i)).toBeNull();
  });

  it("keeps quote product details visible without rendering legacy proof controls", () => {
    mocks.orderQuery.mockReturnValue({ isLoading: false, data: makeOrder() });
    render(<OrderDetail />);
    expect(screen.getAllByText("Test Product").length).toBeGreaterThan(0);
    expect(screen.getAllByText("10mg").length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Qty: 2 × R425\.00/).length).toBeGreaterThan(0);
    expect(screen.getAllByText("R850.00").length).toBeGreaterThan(0);
    expect(screen.queryByText(/proof of payment/i)).toBeNull();
  });
});
