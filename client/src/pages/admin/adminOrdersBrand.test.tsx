// @vitest-environment jsdom

import React from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.stubGlobal("ResizeObserver", class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
});

vi.mock("sonner", () => ({ toast: { error: vi.fn(), success: vi.fn() } }));

vi.mock("@/lib/trpc", () => ({
  trpc: {
    useUtils: () => ({ orders: { adminList: { invalidate: vi.fn() } } }),
    orders: {
      adminList: {
        useQuery: () => ({
          isLoading: false,
          data: [{
            id: 42,
            userFullName: "Test Member",
            userEmail: "member@example.com",
            totalAmount: "1450.00",
            paymentStatus: "pending",
            paymentMethod: null,
            status: "quote_pending",
            createdAt: new Date("2026-08-12T10:00:00Z"),
          }],
        }),
      },
      adminUpdateStatus: { useMutation: () => ({ mutate: vi.fn() }) },
      review: { useMutation: () => ({ isPending: false, mutate: vi.fn() }) },
    },
  },
}));

import AdminOrders from "./AdminOrders";

describe("AdminOrders branded management surface", () => {
  it("renders a white management panel with Gorilla Gear gold commercial accents and prioritises new quotes awaiting approval", () => {
    const { container } = render(<AdminOrders />);

    expect(screen.getByRole("heading", { name: /quote management/i })).toBeTruthy();
    expect(screen.getAllByText("Test Member").length).toBeGreaterThan(0);
    expect(screen.getByRole("combobox", { name: /filter orders by status/i })).toBeTruthy();
    expect(screen.getAllByText(/awaiting approval/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/new quote/i).length).toBeGreaterThan(0);
    expect(container.innerHTML).toContain("border-[#e5dfd4]");
    expect(container.innerHTML).toContain("text-[#a8751c]");
  });
});
