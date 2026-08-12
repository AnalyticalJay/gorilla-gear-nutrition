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
    cart: {
      get: {
        useQuery: () => ({ data: [] }),
      },
    },
  },
}));

vi.mock("@/_core/hooks/useAuth", () => ({
  useAuth: () => ({
    user: { id: 1, name: "Admin User", role: "admin", status: "approved" },
    isAuthenticated: true,
    logout: () => {},
  }),
}));

vi.mock("wouter", async () => {
  const actual: any = await vi.importActual("wouter");
  return {
    ...actual,
    useLocation: () => ["/admin/dashboard", () => {}],
  };
});

import App from "@/App";

describe("App Router Admin Dashboard Route", () => {
  it("renders admin dashboard when App mounts at /admin/dashboard", () => {
    render(<App />);
    expect(screen.getAllByText(/Gorilla Gear/i).length).toBeGreaterThan(0);
  });
});
