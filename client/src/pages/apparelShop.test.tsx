/**
 * @vitest-environment jsdom
 */
import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";

const { categoriesQuery, productsQuery } = vi.hoisted(() => ({
  categoriesQuery: vi.fn(),
  productsQuery: vi.fn(),
}));

vi.mock("@/lib/trpc", () => ({
  trpc: {
    categories: { list: { useQuery: categoriesQuery } },
    products: { listPage: { useQuery: productsQuery } },
  },
}));

vi.mock("@/_core/hooks/useAuth", () => ({
  useAuth: () => ({ user: { status: "approved", role: "user" }, isAuthenticated: true }),
}));

vi.mock("@/components/Navbar", () => ({ default: () => <nav>Navigation</nav> }));
vi.mock("@/components/Footer", () => ({ default: () => <footer>Footer</footer> }));
vi.mock("@/components/ProductCard", () => ({ default: ({ product }: any) => <article>{product.name}</article> }));
vi.mock("wouter", () => ({ Link: ({ children, href, className }: any) => <a href={href} className={className}>{children}</a> }));

import ApparelShop from "@/pages/ApparelShop";

describe("Apparel Shop", () => {
  beforeEach(() => {
    categoriesQuery.mockReturnValue({ data: [{ id: 17, name: "Clothing", slug: "clothing" }], isLoading: false });
    productsQuery.mockReturnValue({ data: { items: [{ id: 1, name: "White 220gsm Tee" }, { id: 2, name: "Black 220gsm Tee" }] }, isLoading: false });
  });

  afterEach(() => cleanup());

  it("loads the Clothing category only and renders its apparel products", () => {
    render(<ApparelShop />);

    expect(screen.getByRole("heading", { name: /the apparel shop/i })).toBeTruthy();
    expect(screen.getByText("White 220gsm Tee")).toBeTruthy();
    expect(screen.getByText("Black 220gsm Tee")).toBeTruthy();
    expect(productsQuery).toHaveBeenCalledWith({ categoryId: 17, limit: 24, offset: 0 }, { enabled: true });
  });
});
