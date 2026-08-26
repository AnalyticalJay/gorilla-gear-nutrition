/**
 * @vitest-environment jsdom
 */
import React from "react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

const { listPageQuery } = vi.hoisted(() => ({
  listPageQuery: vi.fn(),
}));

vi.mock("@/lib/trpc", () => ({
  trpc: {
    useUtils: () => ({ cart: { get: { invalidate: vi.fn() } } }),
    categories: { list: { useQuery: () => ({ data: [] }) } },
    products: { listPage: { useQuery: listPageQuery } },
    cart: {
      get: { useQuery: () => ({ data: [] }) },
      upsert: { useMutation: () => ({ mutate: vi.fn(), isPending: false }) },
    },
  },
}));

vi.mock("@/_core/hooks/useAuth", () => ({
  useAuth: () => ({ user: { status: "approved", role: "user" } }),
}));

vi.mock("wouter", () => ({
  Link: ({ children, href }: any) => <a href={href}>{children}</a>,
  useLocation: () => ["/products", vi.fn()],
}));

import Products from "@/pages/Products";

beforeEach(() => {
  listPageQuery.mockImplementation((input: { offset: number; limit: number }) => ({
    data: {
      items: [{
        id: input.offset + 1,
        name: `NOVA - Product ${input.offset + 1}`,
        slug: `nova-product-${input.offset + 1}`,
        description: "Test product",
        price: 250,
      }],
      total: 49,
      limit: input.limit,
      offset: input.offset,
    },
    isLoading: false,
    isFetching: false,
  }));
});

describe("Products pagination", () => {
  it("requests the next offset and updates the page indicator", () => {
    render(<Products />);
    expect(screen.getByText("Page 1 of 3")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Next page" }));

    expect(screen.getByText("Page 2 of 3")).toBeTruthy();
    expect(listPageQuery).toHaveBeenLastCalledWith(
      expect.objectContaining({ limit: 24, offset: 24 }),
      { enabled: true },
    );
  });
});
