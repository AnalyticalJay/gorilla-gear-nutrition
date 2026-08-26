import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const projectRoot = resolve(import.meta.dirname, "..");

function source(relativePath: string) {
  return readFileSync(resolve(projectRoot, relativePath), "utf8");
}

describe("responsive layout contracts", () => {
  it("keeps the product catalog usable on mobile", () => {
    const products = source("client/src/pages/Products.tsx");
    expect(products).toContain("lg:hidden");
    expect(products).toContain("w-[min(88vw,360px)]");
    expect(products).toContain("grid-cols-1 gap-5 sm:grid-cols-2");
  });

  it("stacks checkout content and disables sticky summary behavior on mobile", () => {
    const checkout = source("client/src/pages/Checkout.tsx");
    expect(checkout).toContain("grid gap-6 lg:grid-cols-3");
    expect(checkout).toContain("lg:sticky lg:top-24");
    expect(checkout).toContain("min-h-11 w-full");
  });

  it("keeps the admin navigation in a mobile drawer with bounded width", () => {
    const adminLayout = source("client/src/pages/admin/AdminLayout.tsx");
    expect(adminLayout).toContain("w-[min(82vw,15rem)]");
    expect(adminLayout).toContain("lg:hidden");
    expect(adminLayout).toContain("overflow-x-hidden");
  });

  it("keeps quote cart and checkout actions clear without a fixed bottom navigation", () => {
    const cart = source("client/src/pages/Cart.tsx");
    const checkout = source("client/src/pages/Checkout.tsx");
    expect(cart).toContain("pb-10 sm:pb-8");
    expect(cart).toContain("sm:flex-nowrap");
    expect(checkout).toContain("pb-10 sm:pb-8");
    expect(checkout).toContain("flex-wrap items-start justify-between");
  });

  it("keeps customer dashboard, product detail, and order detail touch-friendly", () => {
    const account = source("client/src/pages/Account.tsx");
    const productDetail = source("client/src/pages/ProductDetail.tsx");
    const orderDetail = source("client/src/pages/OrderDetail.tsx");
    expect(account).toContain("grid grid-cols-2 gap-2");
    expect(account).toContain("min-h-11 w-full");
    expect(productDetail).toContain("flex flex-col gap-3 sm:flex-row");
    expect(productDetail).toContain("h-11 w-11");
    expect(orderDetail).toContain("pb-10 sm:py-12 sm:pb-12");
    expect(orderDetail).toContain("flex flex-col gap-2");
    expect(orderDetail).toContain("Pay securely with iKhokha");
    expect(orderDetail).toContain("min-h-11 w-full bg-[#a8751c]");
    expect(orderDetail).not.toContain('aria-label="Upload proof of payment"');
  });

  it("uses header controls as the only mobile navigation system", () => {
    const app = source("client/src/App.tsx");
    expect(app).not.toContain("MobileBottomNav");
    expect(app).not.toContain("shouldShowMobileNav");
    expect(app).not.toContain("pb-24 md:pb-0");
  });

  it("uses mobile card layouts for admin quote and product management instead of forcing table overflow", () => {
    const adminOrders = source("client/src/pages/admin/AdminOrders.tsx");
    const adminProducts = source("client/src/pages/admin/AdminProducts.tsx");
    expect(adminOrders).toContain("space-y-3 p-3 md:hidden");
    expect(adminOrders).toContain("hidden overflow-x-auto md:block");
    expect(adminOrders).toContain("min-h-10 flex-1");
    expect(adminProducts).toContain("space-y-3 p-3 md:hidden");
    expect(adminProducts).toContain("hidden overflow-x-auto md:block");
    expect(adminProducts).toContain("min-h-10 w-full");
  });
});
