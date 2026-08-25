/**
 * @vitest-environment jsdom
 */
import React from "react";
import { afterEach, describe, expect, it, vi, beforeEach } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";

const { listPageQuery } = vi.hoisted(() => ({
  listPageQuery: vi.fn(),
}));

vi.mock("@/lib/trpc", () => ({
  trpc: {
    products: {
      listPage: { useQuery: listPageQuery },
    },
  },
}));

vi.mock("@/_core/hooks/useAuth", () => ({
  useAuth: () => ({ user: { status: "approved", role: "user" }, isAuthenticated: true }),
}));

vi.mock("@/components/Navbar", () => ({ default: () => <nav aria-label="Primary navigation">Navigation</nav> }));
vi.mock("@/components/Footer", () => ({ default: () => <footer>Footer</footer> }));
vi.mock("@/components/ProductCard", () => ({ default: ({ product }: any) => <article>{product.name}</article> }));
vi.mock("wouter", () => ({
  Link: ({ children, href, className }: any) => <a href={href} className={className}>{children}</a>,
}));

import Home from "@/pages/Home";

beforeEach(() => {
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
    expect(screen.getByRole("link", { name: "Shop clothing" }).getAttribute("href")).toBe("/apparel");
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
});
