/**
 * @vitest-environment jsdom
 */
import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";

vi.mock("@/_core/hooks/useAuth", () => ({ useAuth: () => ({ user: null, isAuthenticated: false }) }));
vi.mock("@/lib/trpc", () => ({
  trpc: {
    categories: { list: { useQuery: () => ({ data: [{ id: 11, slug: "clothing" }], isLoading: false }) } },
    products: { listPage: { useQuery: () => ({ data: { items: [{ id: 1, name: "Gorilla Gear Primal Standard", slug: "gorilla-tee", description: null, price: "350.00", primaryImage: null, stockQuantity: 100 }], total: 1 }, isLoading: false }) } },
  },
}));
vi.mock("@/components/Navbar", () => ({ default: () => <nav>Navigation</nav> }));
vi.mock("@/components/Footer", () => ({ default: () => <footer>Footer</footer> }));
vi.mock("@/components/ProductCard", () => ({ default: ({ product }: any) => <article>{product.name}</article> }));
vi.mock("wouter", () => ({ Link: ({ children, href, className }: any) => <a href={href} className={className}>{children}</a> }));

import ApparelShop from "@/pages/ApparelShop";

afterEach(() => cleanup());

describe("Apparel shop", () => {
  it("keeps Clothing products publicly browsable while explaining quote approval", () => {
    render(<ApparelShop />);
    expect(screen.getByRole("heading", { name: /apparel shop/i })).toBeTruthy();
    expect(screen.getByText("Gorilla Gear Primal Standard")).toBeTruthy();
    expect(screen.getByText(/browse freely/i)).toBeTruthy();
    expect(screen.getByRole("link", { name: /apply now/i }).getAttribute("href")).toBe("/register");
  });
});
