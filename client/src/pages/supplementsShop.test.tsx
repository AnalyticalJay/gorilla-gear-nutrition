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
vi.mock("@/_core/hooks/useAuth", () => ({ useAuth: () => ({ user: { status: "approved" } }) }));
vi.mock("@/components/Navbar", () => ({ default: () => <nav>Navigation</nav> }));
vi.mock("@/components/Footer", () => ({ default: () => <footer>Footer</footer> }));
vi.mock("@/components/ProductCard", () => ({ default: ({ product }: any) => <article>{product.name}</article> }));
vi.mock("wouter", () => ({ Link: ({ children, href, className }: any) => <a href={href} className={className}>{children}</a> }));

import SupplementsShop from "@/pages/SupplementsShop";

beforeEach(() => {
  categoriesQuery.mockReturnValue({ data: [{ id: 90001, name: "Supplements", slug: "supplements" }], isLoading: false });
  productsQuery.mockReturnValue({ data: { items: [{ id: 2251, name: "HU - Creatine Monohydrate" }], total: 1 }, isLoading: false });
});
afterEach(() => cleanup());

describe("SupplementsShop", () => {
  it("queries the Supplements category and renders every returned product", () => {
    render(<SupplementsShop />);

    expect(productsQuery).toHaveBeenCalledWith({ categoryId: 90001, limit: 48, offset: 0 }, expect.objectContaining({ enabled: true }));
    expect(screen.getByRole("heading", { name: /supplements shop/i })).toBeTruthy();
    expect(screen.getByText("HU - Creatine Monohydrate")).toBeTruthy();
    expect(screen.getByText(/1 product in this collection/i)).toBeTruthy();
    expect(screen.getByAltText("Athlete holding NutriTech Premium Whey Natural").getAttribute("src")).toBe("/manus-storage/ggn-supplements-nutritech-lifestyle_56a682c5.jpg");
  });
});
