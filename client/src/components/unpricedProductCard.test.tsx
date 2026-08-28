/**
 * @vitest-environment jsdom
 */
import React from "react";
import "@testing-library/jest-dom/vitest";
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
    }} />);

    expect(screen.getAllByText(/price on request/i).length).toBeGreaterThan(1);
    expect(screen.queryByRole("button", { name: /add to quote/i })).toBeNull();
  });

  it("lazily decodes non-priority product images to protect catalogue load time", () => {
    render(<ProductCard isApproved product={{
      id: 2,
      name: "Gorilla Gear Creatine",
      slug: "gorilla-gear-creatine",
      description: null,
      price: "350.00",
      primaryImage: "/manus-storage/gorilla-gear-creatine.webp",
    }} />);

    const image = screen.getByRole("img", { name: "Gorilla Gear Creatine" });
    expect(image).toHaveAttribute("loading", "lazy");
    expect(image).toHaveAttribute("decoding", "async");
  });

  it("prioritises the first visible catalogue images", () => {
    render(<ProductCard isApproved prioritizeImage product={{
      id: 3,
      name: "Gorilla Gear Whey",
      slug: "gorilla-gear-whey",
      description: null,
      price: "450.00",
      primaryImage: "/manus-storage/gorilla-gear-whey.webp",
    }} />);

    expect(screen.getByRole("img", { name: "Gorilla Gear Whey" })).toHaveAttribute("loading", "eager");
  });
});
