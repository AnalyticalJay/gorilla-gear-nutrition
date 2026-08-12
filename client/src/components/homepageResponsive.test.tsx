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
  it("renders the responsive hero, member CTA, category section, process, and final CTA", () => {
    const { container } = render(<Home />);

    expect(screen.getByText("Fuel your")).toBeTruthy();
    expect(screen.getByText("Enter member catalogue")).toBeTruthy();
    expect(screen.getByText("Find your")).toBeTruthy();
    expect(screen.getByText("Access is")).toBeTruthy();
    expect(screen.getByText("Ready to fuel your")).toBeTruthy();
    expect(screen.getByRole("contentinfo")).toBeTruthy();

    const heroHeading = screen.getByText("Fuel your").closest("h1");
    expect(heroHeading?.className).toContain("sm:text-[clamp(3.2rem,8vw,6.8rem)]");
    expect(container.querySelector(".pt-24")).toBeTruthy();
  });

  it("requests compact featured products through the paginated endpoint", () => {
    render(<Home />);

    expect(listPageQuery).toHaveBeenCalledWith(
      expect.objectContaining({ featuredOnly: true, limit: 4, offset: 0 }),
    );
  });
});
