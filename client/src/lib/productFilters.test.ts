import { describe, it, expect } from "vitest";
import { AVAILABLE_BRANDS, getProductBrand, matchesBrand, matchesPriceRange } from "./productFilters";

describe("product brand and price filters", () => {
  it("detects HD Labs from a product name", () => {
    expect(getProductBrand({ name: "Testosterone Enanthate 250mg HD Labs" })).toBe("HD Labs");
  });

  it("detects BP Pharma from a product slug or description", () => {
    expect(getProductBrand({ slug: "bp-pharma-superdrol-10mg" })).toBe("BP Pharma");
    expect(getProductBrand({ description: "BP Pharma oral steroid" })).toBe("BP Pharma");
  });

  it("detects Ouroboros Labs from product details", () => {
    expect(getProductBrand({ name: "Ouroboros Labs - Retatrutide 30mg" })).toBe("Ouroboros Labs");
  });

  it("matches all products when no brand is selected", () => {
    expect(matchesBrand({ name: "Unlabelled compound" }, "all")).toBe(true);
  });

  it("filters products to the selected brand", () => {
    expect(matchesBrand({ name: "HD Labs product" }, "HD Labs")).toBe(true);
    expect(matchesBrand({ name: "BP Pharma product" }, "HD Labs")).toBe(false);
  });

  it("covers the approved PDF brand vocabulary and avoids generic pharma collisions", () => {
    expect(AVAILABLE_BRANDS as string[]).toEqual(expect.arrayContaining(["BodyPharm", "Pharmacom", "Cooper Pharmaceuticals", "DoughBro Cookies"]));
    expect(getProductBrand({ name: "Pharmacom Test Product" })).toBe("Pharmacom");
    expect(getProductBrand({ name: "Cooper Pharmaceuticals Product" })).toBe("Cooper Pharmaceuticals");
  });

  it("does not surface retired Biolabs or Genesis suppliers in product filters", () => {
    expect(AVAILABLE_BRANDS as string[]).not.toContain("Genesis");
    expect(AVAILABLE_BRANDS as string[]).not.toContain("Biolab");
    expect(getProductBrand({ name: "Genesis product" })).toBe("Other");
    expect(getProductBrand({ name: "Biolab product" })).toBe("Other");
  });

  it("filters products by max price range", () => {
    expect(matchesPriceRange({ price: 850 }, 1000)).toBe(true);
    expect(matchesPriceRange({ price: 1500 }, 1000)).toBe(false);
    expect(matchesPriceRange({ price: 500 }, 0)).toBe(true); // 0 means any price
  });
});
