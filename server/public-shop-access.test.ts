import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const homeSource = readFileSync(resolve(process.cwd(), "client/src/pages/Home.tsx"), "utf8");
const navbarSource = readFileSync(resolve(process.cwd(), "client/src/components/Navbar.tsx"), "utf8");
const productDetailSource = readFileSync(resolve(process.cwd(), "client/src/pages/ProductDetail.tsx"), "utf8");
const productsSource = readFileSync(resolve(process.cwd(), "client/src/pages/Products.tsx"), "utf8");
const routerSource = readFileSync(resolve(process.cwd(), "server/routers.ts"), "utf8");

describe("public collection browsing and protected purchases", () => {
  it("keeps Supplements and Apparel as public collection destinations", () => {
    expect(homeSource).toContain('href: "/supplements"');
    expect(homeSource).toContain('href: "/apparel"');
    expect(homeSource).toContain('<Link href="/apparel" className="no-underline">');
    expect(navbarSource).toContain('const shopHref = isApproved ? "/products" : "/#collections"');
  });

  it("keeps quote actions and customer-dashboard access behind approval guidance", () => {
    expect(productDetailSource).toContain('isApproved && hasPrice && (');
    expect(productDetailSource).not.toContain("stockQuantity");
    expect(routerSource).toContain("function withoutCustomerStock");
    expect(routerSource).toContain("productStock: _productStock");
    expect(productDetailSource).toContain("Membership approval is required to request quotes and access your customer dashboard.");
    expect(productDetailSource).toContain("Apply to request a quote");
    expect(productDetailSource).toContain("View approval status");
  });

  it("does not render the private catalogue UI before a member is approved", () => {
    expect(productsSource).toContain("enabled: isApproved");
    expect(productsSource).toContain("Private catalogue access is limited to approved members.");
  });
});
