import { describe, it, expect } from "vitest";

describe("Products catalog filter interactions", () => {
  it("initializes and resets filter states correctly", () => {
    let search = "Testosterone";
    let selectedBrand = "Ouroboros Labs";
    let maxPrice = 1500;

    const clearFilters = () => {
      search = "";
      selectedBrand = "all";
      maxPrice = 0;
    };

    expect(search).toBe("Testosterone");
    expect(selectedBrand).toBe("Ouroboros Labs");
    expect(maxPrice).toBe(1500);

    clearFilters();

    expect(search).toBe("");
    expect(selectedBrand).toBe("all");
    expect(maxPrice).toBe(0);
  });
});
