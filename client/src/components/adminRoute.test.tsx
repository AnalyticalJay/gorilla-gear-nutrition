/**
 * @vitest-environment jsdom
 */
import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

beforeEach(() => {
  if (typeof window !== "undefined" && !window.ResizeObserver) {
    window.ResizeObserver = class {
      observe() {}
      unobserve() {}
      disconnect() {}
    };
  }
});

vi.mock("@/lib/trpc", () => ({
  trpc: {
    admin: {
      analytics: {
        useQuery: () => ({
          data: {
            generatedAt: new Date().toISOString(),
            users: { total: 5, pending: 2, approved: 3, rejected: 0, newLast30Days: 2 },
            products: { total: 703, active: 703, withImages: 255, missingImages: 448, imageCoveragePercent: 36.3, categories: 4 },
            quotes: { total: 4, pending: 1, approved: 2, rejected: 1, awaitingPayment: 1 },
            orders: { total: 4, paid: 2, processing: 1, shipped: 0, completed: 1, cancelled: 0, revenue: "12500.00", averagePaidOrderValue: "6250.00" },
            recentUsers: [{ id: 1, fullName: "Test User", status: "pending", createdAt: new Date() }],
            recentOrders: [{ id: 1, userFullName: "Test User", status: "paid", paymentStatus: "paid", totalAmount: "12500.00", createdAt: new Date() }],
          },
          isLoading: false,
          isFetching: false,
          isError: false,
          refetch: () => {},
        }),
      },
      stats: {
        useQuery: () => ({
          data: {
            totalUsers: 5,
            pendingUsers: 2,
            approvedUsers: 3,
            pendingQuotes: 1,
            totalOrders: 4,
            revenue: 12500,
          },
          isLoading: false,
        }),
      },
    },
  },
}));

vi.mock("@/_core/hooks/useAuth", () => ({
  useAuth: () => ({
    user: { id: 1, name: "Admin User", role: "admin", status: "approved" },
    isAuthenticated: true,
  }),
}));

vi.mock("wouter", () => ({
  Link: ({ children, href }: any) => <a href={href}>{children}</a>,
  useLocation: () => ["/admin/dashboard", () => {}],
}));

import AdminDashboard from "@/pages/admin/AdminDashboard";

describe("Admin dashboard route rendering", () => {
  it("renders admin stats and dashboard overview with analytics sections", () => {
    const { container } = render(<AdminDashboard />);
    expect(screen.getAllByText(/Gorilla Gear/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Total users/i)).toBeTruthy();
    expect(screen.getByText(/Ready to sell/i)).toBeTruthy();
    expect(screen.getByText(/Where work is moving/i)).toBeTruthy();
    expect(screen.getByText(/Member approvals/i)).toBeTruthy();
    expect(container.innerHTML).toContain("border-[#e5dfd4]");
    expect(container.innerHTML).toContain("bg-[#a8751c]");
  });
});
