/**
 * @vitest-environment jsdom
 */
import React from "react";
import { afterEach, describe, expect, it, vi, beforeEach } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";

const { listPageQuery, authState } = vi.hoisted(() => ({
  listPageQuery: vi.fn(),
  authState: { current: {} as { user: { status: string; role: string } | null; isAuthenticated: boolean } },
}));

vi.mock("@/lib/trpc", () => ({
  trpc: {
    products: {
      listPage: { useQuery: listPageQuery },
    },
  },
}));

vi.mock("@/_core/hooks/useAuth", () => ({
  useAuth: () => authState.current,
}));

vi.mock("@/components/Navbar", () => ({ default: () => <nav aria-label="Primary navigation">Navigation</nav> }));
vi.mock("@/components/Footer", () => ({ default: () => <footer>Footer</footer> }));
vi.mock("@/components/ProductCard", () => ({ default: ({ product }: any) => <article>{product.name}</article> }));
vi.mock("wouter", () => ({
  Link: ({ children, href, className }: any) => <a href={href} className={className}>{children}</a>,
}));

import Home from "@/pages/Home";

beforeEach(() => {
  authState.current = { user: { status: "approved", role: "user" }, isAuthenticated: true };
  listPageQuery.mockReturnValue({
    data: { items: [], total: 0, limit: 4, offset: 0 },
    isLoading: false,
    isFetching: false,
  });
});

afterEach(() => cleanup());

describe("Homepage responsive structure", () => {
  it("renders the responsive premium hero, collection cards, member CTA, and no public catalogue grid", () => {
    const { container } = render(<Home />);

    expect(screen.getByText("Discipline")).toBeTruthy();
    expect(screen.getByText("greatness")).toBeTruthy();
    expect(screen.getByText("Enter member catalogue")).toBeTruthy();
    expect(screen.getByText("Shop our collections")).toBeTruthy();
    expect(screen.getByText("Supplements")).toBeTruthy();
    expect(screen.getByText("Clothing")).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Coaching" })).toBeTruthy();
    expect(screen.getByText("Become a member")).toBeTruthy();
    expect(screen.getByText("Admin-approved")).toBeTruthy();
    expect(screen.getByText("Secure account")).toBeTruthy();
    expect(screen.getAllByText("Member support").length).toBeGreaterThan(1);
    expect(screen.getByRole("contentinfo")).toBeTruthy();
    expect(screen.queryByText(/trusted brands/i)).toBeNull();
    expect(screen.queryByText(/anabolics/i)).toBeNull();

    const heroHeading = screen.getByText("Discipline").closest("h1");
    expect(heroHeading?.className).toContain("text-[clamp(3rem,10.5vw,6.65rem)]");
    expect(container.querySelector("#collections")).toBeTruthy();
  });

  it("centres key marketing content on phones while retaining desktop alignment fallbacks", () => {
    render(<Home />);

    const heroHeading = screen.getByText("Discipline").closest("h1");
    expect(heroHeading?.parentElement?.className).toContain("text-center");
    expect(heroHeading?.parentElement?.className).toContain("sm:text-left");

    const membershipHeading = screen.getByText("Become a member");
    expect(membershipHeading.parentElement?.className).toContain("text-center");
    expect(membershipHeading.parentElement?.className).toContain("sm:text-left");
  });

  it("does not request member catalogue products on the public homepage", () => {
    render(<Home />);

    expect(listPageQuery).not.toHaveBeenCalled();
  });

  it("links the Supplements collection and hero action to the dedicated supplements shop with the supplied managed artwork", () => {
    render(<Home />);

    expect(screen.getByRole("link", { name: /shop supplements/i }).getAttribute("href")).toBe("/supplements");
    expect(screen.getByText("Supplements").closest("a")?.getAttribute("href")).toBe("/supplements");
    expect(screen.getByAltText("Supplements").getAttribute("src")).toBe("/manus-storage/ggn-supplements-nutritech-lifestyle_56a682c5.jpg");
  });

  it("shows the locked private catalogue block and routes approved members to the full catalogue", () => {
    render(<Home />);

    expect(screen.getByText("Private member catalogue")).toBeTruthy();
    expect(screen.getByText("The full range is unlocked by approval.")).toBeTruthy();
    expect(screen.getByRole("link", { name: /browse all brands & categories/i }).getAttribute("href")).toBe("/products");
    const privateCatalogueImage = screen.getByAltText("Private member catalogue collection");
    expect(privateCatalogueImage.getAttribute("src")).toBe("/manus-storage/ggn-private-catalogue-full-range_6449fda7.jpg");
    expect(privateCatalogueImage.className).toContain("group-hover:brightness-110");
  });

  it("guides non-members from the locked catalogue block to application", () => {
    authState.current = { user: null, isAuthenticated: false };
    render(<Home />);

    expect(screen.getAllByRole("link", { name: /apply for member access/i }).some((link) => link.getAttribute("href") === "/register")).toBe(true);
  });
});
