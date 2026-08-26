import React, { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { LogOut, Menu, ShoppingCart, User, X } from "lucide-react";
import { Link, useLocation } from "wouter";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

const suppliedHeaderLogoSrc = "/manus-storage/ggn-logo-transparent_bf4fb645.png";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [location] = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const isApproved = (user as any)?.status === "approved";
  const isAdmin = (user as any)?.role === "admin";
  const shopHref = isApproved ? "/products" : "/#collections";

  const cartQuery = trpc.cart.get.useQuery(undefined, { enabled: isApproved });
  const cartCount = cartQuery.data?.reduce((sum, item) => sum + item.quantity, 0) ?? 0;
  const navLinks = [
    { href: shopHref, mobileHref: shopHref, desktopLabel: "Shop", mobileLabel: isApproved ? "Browse full catalogue" : "Shop public collections" },
    { href: "/coaching", mobileHref: "/coaching", desktopLabel: "Coaching", mobileLabel: "Coaching Plans" },
    { href: "/#membership", mobileHref: "/register", desktopLabel: "Apply", mobileLabel: "Apply for Access" },
  ];

  return (
    <nav className="fixed top-0 z-50 w-full border-b border-black/10 bg-white/95 text-black shadow-[0_8px_26px_rgba(0,0,0,0.08)] backdrop-blur-md">
      <div className="border-b border-black/10 py-1.5 text-center text-[8px] font-bold uppercase tracking-[0.3em] text-black/62 sm:text-[9px]">Premium supplements. Elite coaching. <span className="text-[#a8751c]">Real results.</span></div>
      <div className="container flex h-16 items-center justify-between gap-2">
        <Link href="/" aria-label="Gorilla Gear Nutrition home" className="flex shrink-0 items-center no-underline">
          <div className="flex h-11 w-12 items-center justify-center overflow-hidden sm:h-12 sm:w-14">
            <img src={suppliedHeaderLogoSrc} alt="Gorilla Gear Nutrition" className="h-full w-full object-contain" />
          </div>
        </Link>

        <div className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => {
            const active = location === link.href;
            return (
              <a key={link.href} href={link.href} className={`text-[10px] font-bold uppercase tracking-[0.16em] no-underline transition-colors ${active ? "text-[#a8751c]" : "text-black/68 hover:text-[#a8751c]"}`}>
                {link.desktopLabel}
              </a>
            );
          })}
          {isAdmin && (
            <Link href="/admin/dashboard" className={`text-[10px] font-bold uppercase tracking-[0.16em] no-underline transition-colors ${location.startsWith("/admin") ? "text-[#a8751c]" : "text-black/68 hover:text-[#a8751c]"}`}>
              Admin
            </Link>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          {isApproved && (
            <Link href="/cart" className="relative flex h-11 w-11 items-center justify-center border border-black/15 bg-white text-black transition-colors hover:border-[#a8751c]/70 hover:text-[#a8751c] sm:h-10 sm:w-10">
              <ShoppingCart className="h-4 w-4" />
              {cartCount > 0 && <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#E11D48] text-[10px] font-bold text-white">{cartCount}</span>}
            </Link>
          )}

          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button aria-label="Open account menu" variant="outline" className="h-10 min-w-10 border-black/15 bg-white px-2 text-xs font-bold uppercase tracking-wider text-black hover:border-[#a8751c]/60 hover:bg-[#fffaf0] sm:px-3">
                  <User className="h-3.5 w-3.5 text-[#a8751c] sm:mr-2" />
                  <span className="hidden max-w-[100px] truncate sm:inline sm:max-w-[140px]">{(user as any)?.name || (user as any)?.email || "Account"}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 border-black/10 bg-white text-black shadow-xl">
                <div className="px-3 py-2">
                  <p className="text-xs font-bold text-black">{(user as any)?.name || "Member"}</p>
                  <p className="text-[10px] text-black/50">Status: <span className="capitalize text-[#a8751c]">{(user as any)?.status}</span></p>
                </div>
                <DropdownMenuSeparator className="bg-black/10" />
                <DropdownMenuItem asChild className="focus:bg-black/5 focus:text-black">
                  <Link href="/account" className="flex w-full items-center cursor-pointer text-xs font-bold uppercase">Account Status</Link>
                </DropdownMenuItem>
                {isAdmin && (
                  <DropdownMenuItem asChild className="focus:bg-black/5 focus:text-black">
                    <Link href="/admin/dashboard" className="flex w-full items-center cursor-pointer text-xs font-bold uppercase text-[#E11D48]">Admin Dashboard</Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator className="bg-black/10" />
                <DropdownMenuItem onClick={() => logout()} className="cursor-pointer text-xs font-bold uppercase text-[#E11D48] focus:bg-[#E11D48]/10 focus:text-[#E11D48]">
                  <LogOut className="mr-2 h-3.5 w-3.5" /> Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="hidden items-center gap-2 sm:flex">
              <Link href="/login" className="no-underline">
                  <Button variant="outline" className="h-9 border-black/20 bg-white text-xs font-bold uppercase tracking-wider text-black hover:border-[#a8751c]/70 hover:bg-[#fffaf0]">
                  Sign In
                </Button>
              </Link>
              <Link href="/register" className="no-underline">
                <Button className="h-9 px-4 text-xs font-bold uppercase tracking-wider text-black shadow-lg hover:bg-[#e0b35a]" style={{ background: "#c99a3d" }}>
                  Apply Access
                </Button>
              </Link>
            </div>
          )}

          <button onClick={() => setMobileOpen(!mobileOpen)} className="flex h-11 w-11 items-center justify-center border border-black/15 bg-white text-black transition-colors hover:border-[#a8751c]/60 hover:text-[#a8751c] md:hidden sm:h-10 sm:w-10" aria-label="Open navigation menu" aria-expanded={mobileOpen} aria-controls="mobile-navigation-menu">
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div id="mobile-navigation-menu" aria-label="Mobile navigation" className="border-b border-black/10 bg-white p-4 md:hidden">
          <div className="flex flex-col items-center gap-3 text-center">
            {isAuthenticated && (
              <div className="grid w-full grid-cols-2 gap-2 border-b border-black/10 pb-3">
                {isApproved && <Link href="/cart" onClick={() => setMobileOpen(false)} className="flex min-h-11 items-center justify-center gap-2 border border-[#a8751c]/30 bg-[#fffaf0] px-3 py-2 text-xs font-bold uppercase tracking-wide text-[#7c5a20] no-underline"><ShoppingCart className="h-4 w-4" />Quote Cart{cartCount > 0 ? ` (${cartCount})` : ""}</Link>}
                <Link href="/account" onClick={() => setMobileOpen(false)} className={`${isApproved ? "" : "col-span-2"} flex min-h-11 items-center justify-center gap-2 border border-black/15 bg-white px-3 py-2 text-xs font-bold uppercase tracking-wide text-black no-underline`}><User className="h-4 w-4 text-[#a8751c]" />My Account</Link>
              </div>
            )}
            {navLinks.map((link) => (
              <a key={link.href} href={link.mobileHref} onClick={() => setMobileOpen(false)} className="flex min-h-11 w-full items-center justify-center py-2 text-sm font-bold uppercase tracking-widest text-black/68 hover:text-[#a8751c] no-underline">
                {link.mobileLabel}
              </a>
            ))}
            {isAdmin && (
              <Link href="/admin/dashboard" onClick={() => setMobileOpen(false)} className="flex min-h-11 w-full items-center justify-center py-2 text-sm font-bold uppercase tracking-widest text-[#E11D48] hover:text-black no-underline">
                Admin Dashboard
              </Link>
            )}
            {!isAuthenticated && (
              <div className="grid grid-cols-2 gap-2 border-t border-black/10 pt-3">
                <Link href="/login" onClick={() => setMobileOpen(false)} className="no-underline">
                  <Button variant="outline" className="h-10 w-full border-black/20 bg-white text-xs font-bold uppercase tracking-wider text-black">Sign In</Button>
                </Link>
                <Link href="/register" onClick={() => setMobileOpen(false)} className="no-underline">
                  <Button className="h-10 w-full text-xs font-bold uppercase tracking-wider text-black" style={{ background: "#c99a3d" }}>Apply for Access</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
