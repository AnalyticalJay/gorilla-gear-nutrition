import { describe, it, expect } from "vitest";

describe("filter state reset logic", () => {
  it("resets filter states correctly", () => {
    let search = "retatrutide";
    let selectedBrand = "Ouroboros Labs";
    let maxPrice = 1000;

    const clearFilters = () => {
      search = "";
      selectedBrand = "all";
      maxPrice = 0;
    };

    clearFilters();

    expect(search).toBe("");
    expect(selectedBrand).toBe("all");
    expect(maxPrice).toBe(0);
  });
});
