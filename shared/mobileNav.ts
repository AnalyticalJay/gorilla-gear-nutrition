export const mobileNavItems = [
  { href: "/", label: "Home", icon: "home" },
  { href: "/products", label: "Products", icon: "products" },
  { href: "/cart", label: "Quote Cart", icon: "cart" },
  { href: "/account", label: "Account", icon: "account" },
] as const;

export type MobileNavHref = (typeof mobileNavItems)[number]["href"];

export function isMobileNavActive(pathname: string, href: MobileNavHref) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function shouldShowMobileNav(pathname: string) {
  return !pathname.startsWith("/admin") && pathname !== "/login" && pathname !== "/register";
}

export function formatMobileCartCount(count: number) {
  if (count <= 0) return null;
  return count > 99 ? "99+" : String(count);
}
