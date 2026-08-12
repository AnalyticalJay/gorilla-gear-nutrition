/**
 * @vitest-environment jsdom
 */
import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("@/lib/trpc", () => ({
  trpc: {
    useUtils: () => ({
      cart: { get: { invalidate: () => {} } },
    }),
    categories: {
      list: {
        useQuery: () => ({ data: [{ id: 1, name: "Peptides" }] }),
      },
    },
    products: {
      list: {
        useQuery: () => ({
          data: [
            {
              id: 1,
              name: "Ouroboros Labs - Retatrutide 30mg",
              slug: "ouroboros-labs-retatrutide-30mg-1",
              description: "Retatrutide 30mg vial",
              price: 1500,
            },
          ],
          isLoading: false,
        }),
      },
    },
    cart: {
      get: {
        useQuery: () => ({ data: [] }),
      },
      upsert: {
        useMutation: () => ({ mutate: () => {}, isPending: false }),
      },
    },
  },
}));

vi.mock("@/_core/hooks/useAuth", () => ({
  useAuth: () => ({ user: { status: "approved", role: "user" } }),
}));

vi.mock("wouter", () => ({
  Link: ({ children, href }: any) => <a href={href}>{children}</a>,
  useLocation: () => ["/products", () => {}],
}));

import Products from "@/pages/Products";

describe("Products page component", () => {
  it("renders search input and brand filters", () => {
    render(<Products />);
    expect(screen.getByPlaceholderText(/Name, compound, or dosage/i)).toBeTruthy();
    expect(screen.getByText("Ouroboros Labs")).toBeTruthy();
  });
});
