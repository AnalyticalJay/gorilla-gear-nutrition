import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const sources = [
  "client/src/pages/Products.tsx",
  "client/src/components/ProductCard.tsx",
  "client/src/pages/ProductDetail.tsx",
  "client/src/pages/Checkout.tsx",
  "client/src/pages/Login.tsx",
  "client/src/pages/admin/AdminOrderDetail.tsx",
  "client/src/components/Navbar.tsx",
].map((path) => readFileSync(resolve(process.cwd(), path), "utf8"));

const legacyDecorativeTokens = [
  "#0EA5E9",
  "#0284C7",
  "#E11D48",
  "#BE123C",
  "#DC2626",
  "#38BDF8",
  "#7DD3FC",
  "#FDA4AF",
];

describe("Gorilla Gear palette consistency", () => {
  it("keeps primary product, customer, and admin surfaces on the white, charcoal, and gold system", () => {
    expect(sources.join("\n")).toContain("#a8751c");
    expect(sources.join("\n")).toContain("#454545");
    legacyDecorativeTokens.forEach((token) => expect(sources.join("\n")).not.toContain(token));
  });
});
