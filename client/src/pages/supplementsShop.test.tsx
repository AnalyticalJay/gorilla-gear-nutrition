/**
 * @vitest-environment jsdom
 */
import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";

const { categoriesQuery, productsQuery } = vi.hoisted(() => ({
  categoriesQuery: vi.fn(),
  productsQuery: vi.fn(),
}));

vi.mock("@/lib/trpc", () => ({
  trpc: {
    useUtils: () => ({ cart: { get: { invalidate: () => {} } } }),
    categories: { list: { useQuery: categoriesQuery } },
    products: { listPage: { useQuery: productsQuery } },
    cart: { upsert: { useMutation: () => ({ mutate: () => {}, isPending: false }) } },
  },
}));
vi.mock("@/_core/hooks/useAuth", () => ({ useAuth: () => ({ user: { status: "approved" } }) }));
vi.mock("@/components/Navbar", () => ({ default: () => <nav>Navigation</nav> }));
vi.mock("@/components/Footer", () => ({ default: () => <footer>Footer</footer> }));
vi.mock("wouter", () => ({ Link: ({ children, href, className }: any) => <a href={href} className={className}>{children}</a> }));

import SupplementsShop from "@/pages/SupplementsShop";

beforeEach(() => {
  categoriesQuery.mockReturnValue({ data: [{ id: 90001, name: "Supplements", slug: "supplements" }], isLoading: false });
  productsQuery.mockReturnValue({ data: { items: [{ id: 2251, name: "HU - Creatine Monohydrate", slug: "hu-creatine-monohydrate", description: "Creatine Mono", dosageInfo: "Quantity: 30 servings | Strength: NA", price: "200.00", primaryImage: null, stockQuantity: 100 }], total: 1 }, isLoading: false });
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

  it("opens an accessible quick-view modal with product details", () => {
    render(<SupplementsShop />);

    fireEvent.click(screen.getByRole("button", { name: /quick view hu - creatine monohydrate/i }));

    expect(screen.getByRole("dialog")).toBeTruthy();
    expect(screen.getByText("Supplements quick view")).toBeTruthy();
    expect(screen.getByText("Quantity & strength")).toBeTruthy();
    expect(screen.getByText("100 units available")).toBeTruthy();
  });
});
