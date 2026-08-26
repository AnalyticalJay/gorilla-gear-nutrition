/**
 * @vitest-environment jsdom
 */
import React from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("@/lib/trpc", () => ({
  trpc: {
    useUtils: () => ({ cart: { get: { invalidate: () => {} } } }),
    cart: { upsert: { useMutation: () => ({ mutate: () => {}, isPending: false }) } },
  },
}));
vi.mock("wouter", () => ({ Link: ({ children, href, className }: any) => <a href={href} className={className}>{children}</a> }));

import ProductCard from "@/components/ProductCard";

describe("unpriced ProductCard", () => {
  it("shows price-on-request and does not expose a quote action for an item without a supplied price", () => {
    render(<ProductCard isApproved product={{
      id: 1,
      name: "Blue Magic Pre Workout",
      slug: "blue-magic-pre-workout",
      description: "Price has not been supplied.",
      price: "0.00",
      primaryImage: null,
      categoryName: "Supplements",
      stockQuantity: 0,
    }} />);

    expect(screen.getAllByText(/price on request/i).length).toBeGreaterThan(1);
    expect(screen.queryByRole("button", { name: /add to quote/i })).toBeNull();
  });
});
