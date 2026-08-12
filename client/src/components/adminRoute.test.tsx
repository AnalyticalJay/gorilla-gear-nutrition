/**
 * @vitest-environment jsdom
 */
import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("@/lib/trpc", () => ({
  trpc: {
    admin: {
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
  it("renders admin stats and dashboard overview", () => {
    render(<AdminDashboard />);
    expect(screen.getAllByText(/Gorilla Gear/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Total Users/i)).toBeTruthy();
  });
});
