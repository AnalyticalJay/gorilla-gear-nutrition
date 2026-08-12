/**
 * @vitest-environment jsdom
 */
import React from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

const mocks = vi.hoisted(() => ({
  orderQuery: vi.fn(),
  invalidate: vi.fn(),
  paymentMutate: vi.fn(),
}));

vi.mock("@/lib/trpc", () => ({
  trpc: {
    useUtils: () => ({ orders: { detail: { invalidate: mocks.invalidate } } }),
    orders: {
      detail: { useQuery: mocks.orderQuery },
      choosePayment: { useMutation: () => ({ isPending: false, mutate: mocks.paymentMutate }) },
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

describe("customer order detail tracking", () => {
  it("renders the admin-provided tracking number, note, and courier action", () => {
    mocks.orderQuery.mockReturnValue({
      isLoading: false,
      data: {
        id: 42,
        userId: 7,
        totalAmount: "850.00",
        deliveryFee: "0.00",
        status: "shipped",
        paymentStatus: "paid",
        paymentMethod: "eft",
        createdAt: new Date("2026-08-12T08:00:00.000Z"),
        reviewedAt: new Date("2026-08-12T09:00:00.000Z"),
        paidAt: new Date("2026-08-12T10:00:00.000Z"),
        dispatchedAt: new Date("2026-08-12T11:00:00.000Z"),
        deliveredAt: null,
        trackingNumber: "TCG123456789",
        trackingCarrier: "The Courier Guy",
        trackingUrl: null,
        trackingNotes: "Dispatched from Johannesburg depot.",
        quoteNotes: null,
        rejectionReason: null,
        items: [],
        shipping: null,
        comments: [],
      },
    });

    render(<OrderDetail />);

    expect(screen.getByText("TCG123456789")).toBeTruthy();
    expect(screen.getByText(/Dispatched from Johannesburg depot/i)).toBeTruthy();
    expect(screen.getByRole("link", { name: /track with courier/i }).getAttribute("href")).toBe("https://thecourierguy.co.za/tracking/");
    expect(screen.getByText("Order dispatched")).toBeTruthy();
  });
});
