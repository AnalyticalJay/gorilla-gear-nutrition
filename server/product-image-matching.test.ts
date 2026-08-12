import { describe, expect, it } from "vitest";
import { getProductImageMatchKeys, normalizeProductImageKey } from "./db";

describe("product image matching", () => {
  it("normalizes extensions, punctuation, hyphens, and casing", () => {
    expect(normalizeProductImageKey("Testosterone_Enanthate-250mg HD Labs.JPG")).toBe(
      "testosterone enanthate 250mg hd labs"
    );
  });

  it("creates matching keys from both a product name and slug", () => {
    expect(getProductImageMatchKeys({
      name: "Testosterone Enanthate 250mg HD Labs",
      slug: "testosterone-enanthate-250mg-hd-labs",
    })).toEqual([
      "testosterone enanthate 250mg hd labs",
      "testosterone enanthate 250mg hd labs",
    ]);
  });

  it("matches common filename separators consistently", () => {
    const productKey = normalizeProductImageKey("BP Pharma Superdrol 10mg");
    const filenameKey = normalizeProductImageKey("BP-Pharma_Superdrol_10mg.png");
    expect(filenameKey).toBe(productKey);
  });
});
