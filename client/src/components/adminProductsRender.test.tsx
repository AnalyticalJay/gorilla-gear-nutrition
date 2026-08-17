/**
 * @vitest-environment jsdom
 */
import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("@/lib/trpc", () => ({
  trpc: {
    useUtils: () => ({
      products: {
        list: { invalidate: () => {} },
        adminList: { invalidate: () => {} },
      },
    }),
    products: {
      list: {
        useQuery: () => ({
          data: [
            {
              id: 1,
              name: "OL - Retatrutide 30mg (Not Mixed)",
              category: { name: "PEPTIDES" },
              price: "1500.00",
              stockQuantity: 100,
              isActive: true,
            },
          ],
          isLoading: false,
        }),
      },
      adminList: {
        useQuery: () => ({
          data: [
            {
              id: 1,
              name: "OL - Retatrutide 30mg (Not Mixed)",
              category: { name: "PEPTIDES" },
              price: "1500.00",
              stockQuantity: 100,
              isActive: true,
            },
          ],
          isLoading: false,
        }),
      },
      update: {
        useMutation: () => ({ mutateAsync: async () => {} }),
      },
      delete: {
        useMutation: () => ({ mutateAsync: async () => {} }),
      },
      toggleActive: {
        useMutation: () => ({ mutateAsync: async () => {} }),
      },
    },
    admin: {
      stats: {
        useQuery: () => ({
          data: { totalUsers: 5, pendingUsers: 2, approvedUsers: 3, pendingQuotes: 1, totalOrders: 4, revenue: 12500 },
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
    logout: () => {},
  }),
}));

vi.mock("wouter", async () => {
  const actual: any = await vi.importActual("wouter");
  return {
    ...actual,
    useLocation: () => ["/admin/products", () => {}],
  };
});

import AdminProducts from "@/pages/admin/AdminProducts";

describe("AdminProducts Component CSV Inventory Rendering", () => {
  it("renders imported CSV products in the admin management table", () => {
    const { container } = render(<AdminProducts />);
    expect(screen.getAllByText(/OL - Retatrutide 30mg \(Not Mixed\)/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/R1500\.00/i).length).toBeGreaterThan(0);
    expect(container.innerHTML).toContain("border-[#e5dfd4]");
    expect(container.innerHTML).toContain("text-[#a8751c]");
  });
});
