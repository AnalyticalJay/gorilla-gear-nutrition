import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Home, Package, ShoppingCart, UserRound } from "lucide-react";
import { Link, useLocation } from "wouter";
import {
  isMobileNavActive,
  mobileNavItems,
  shouldShowMobileNav,
  formatMobileCartCount,
  type MobileNavHref,
} from "@shared/mobileNav";

const icons = {
  home: Home,
  products: Package,
  cart: ShoppingCart,
  account: UserRound,
} as const;

export default function MobileBottomNav() {
  const [location] = useLocation();
  const { user } = useAuth();
  const isApproved = (user as any)?.status === "approved";
  const cartQuery = trpc.cart.get.useQuery(undefined, {
    enabled: isApproved && shouldShowMobileNav(location),
  });
  const cartCount = cartQuery.data?.reduce((sum, item) => sum + item.quantity, 0) ?? 0;

  if (!shouldShowMobileNav(location)) return null;

  return (
    <nav
      aria-label="Mobile navigation"
      className="fixed inset-x-0 bottom-0 z-[60] border-t border-[#454545] bg-[#090909]/95 shadow-[0_-12px_32px_rgba(0,0,0,0.35)] backdrop-blur-xl md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="h-[2px] w-full bg-gradient-to-r from-[#a8751c] via-[#a8751c] from-0% via-35% to-[#a8751c]" />
      <div className="mx-auto grid h-[4.35rem] max-w-md grid-cols-4 px-2 py-1.5">
        {mobileNavItems.map((item) => {
          const Icon = icons[item.icon];
          const active = isMobileNavActive(location, item.href as MobileNavHref);
          const isCart = item.href === "/cart";
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`relative flex min-h-11 flex-col items-center justify-center gap-1 rounded-lg px-2 text-[0.66rem] font-bold uppercase tracking-[0.08em] no-underline transition-colors ${
                active
                  ? "bg-[#a8751c]/12 text-[#f0c65e]"
                  : "text-[#9b9388] hover:bg-white/5 hover:text-white"
              }`}
            >
              <span className="relative">
                <Icon className="h-[1.15rem] w-[1.15rem]" strokeWidth={active ? 2.4 : 1.9} />
                {isCart && formatMobileCartCount(cartCount) && (
                  <span
                    aria-label={`${cartCount} cart item${cartCount === 1 ? "" : "s"}`}
                    className="absolute -right-2.5 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#a8751c] px-1 text-[0.58rem] font-black leading-none text-white ring-2 ring-[#090909]"
                  >
                    {formatMobileCartCount(cartCount)}
                  </span>
                )}
              </span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
