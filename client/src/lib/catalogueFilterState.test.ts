import { describe, expect, it } from "vitest";
import { countActiveCatalogueFilters, createEmptyCatalogueFilterState } from "./catalogueFilterState";

describe("catalogue filter state", () => {
  it("counts all active dual-taxonomy and search/price filters", () => {
    expect(countActiveCatalogueFilters({
      search: "  peptides  ",
      categoryId: 8,
      brandId: 2,
      subcategoryId: 4,
      shopCollectionId: 6,
      maxPrice: 1000,
    })).toBe(6);
  });

  it("does not count blank search or the any-price state", () => {
    expect(countActiveCatalogueFilters({ search: "   ", maxPrice: 0 })).toBe(0);
  });

  it("returns an empty state for clearing every filter", () => {
    expect(createEmptyCatalogueFilterState()).toEqual({
      search: "",
      categoryId: undefined,
      brandId: undefined,
      subcategoryId: undefined,
      shopCollectionId: undefined,
      maxPrice: 0,
    });
  });
});
