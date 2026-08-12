import { describe, expect, it } from "vitest";
import {
  formatMobileCartCount,
  isMobileNavActive,
  mobileNavItems,
  shouldShowMobileNav,
} from "../shared/mobileNav";

describe("mobile bottom navigation", () => {
  it("exposes the four storefront destinations in the intended order", () => {
    expect(mobileNavItems.map((item) => item.href)).toEqual([
      "/",
      "/products",
      "/cart",
      "/account",
    ]);
  });

  it("marks nested storefront routes as active while keeping home exact", () => {
    expect(isMobileNavActive("/products", "/products")).toBe(true);
    expect(isMobileNavActive("/products/testosterone-enanthate", "/products")).toBe(true);
    expect(isMobileNavActive("/account/orders", "/account")).toBe(true);
    expect(isMobileNavActive("/products", "/")).toBe(false);
    expect(isMobileNavActive("/", "/")).toBe(true);
  });

  it("hides the storefront bottom navigation on admin and auth entry screens", () => {
    expect(shouldShowMobileNav("/admin")).toBe(false);
    expect(shouldShowMobileNav("/admin/products")).toBe(false);
    expect(shouldShowMobileNav("/login")).toBe(false);
    expect(shouldShowMobileNav("/register")).toBe(false);
    expect(shouldShowMobileNav("/products")).toBe(true);
    expect(shouldShowMobileNav("/account")).toBe(true);
  });

  it("formats the cart badge only when there are items and caps it at 99+", () => {
    expect(formatMobileCartCount(0)).toBeNull();
    expect(formatMobileCartCount(1)).toBe("1");
    expect(formatMobileCartCount(12)).toBe("12");
    expect(formatMobileCartCount(99)).toBe("99");
    expect(formatMobileCartCount(100)).toBe("99+");
  });
});
