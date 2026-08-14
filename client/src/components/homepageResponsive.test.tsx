/**
 * @vitest-environment jsdom
 */
import React from "react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

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
    expect(screen.getByRole("contentinfo")).toBeTruthy();
    expect(screen.queryByText(/trusted brands/i)).toBeNull();
    expect(screen.queryByText(/anabolics/i)).toBeNull();

    const heroHeading = screen.getByText("Discipline").closest("h1");
    expect(heroHeading?.className).toContain("text-[clamp(3.25rem,13vw,7.8rem)]");
    expect(container.querySelector("#collections")).toBeTruthy();
  });

  it("does not request member catalogue products on the public homepage", () => {
    render(<Home />);

    expect(listPageQuery).not.toHaveBeenCalled();
  });
});
