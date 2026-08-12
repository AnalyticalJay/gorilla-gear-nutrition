import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { ShoppingCart, Menu, X, User, LogOut, Shield } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [location] = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const isApproved = (user as any)?.status === "approved";
  const isAdmin = (user as any)?.role === "admin";

  const cartQuery = trpc.cart.get.useQuery(undefined, { enabled: isApproved });
  const cartCount = cartQuery.data?.reduce((sum, item) => sum + item.quantity, 0) ?? 0;

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/products", label: "Products" },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-[#0A0A0A] border-b border-[#1E293B]">
      {/* HD Labs dual-stripe top accent: red | blue */}
      <div className="h-[3px] w-full flex-shrink-0" style={{ background: "linear-gradient(90deg, #E11D48 0%, #E11D48 35%, #0EA5E9 35%, #0EA5E9 100%)" }} />

      <div className="container">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 no-underline group">
            <div className="w-10 h-10 rounded flex items-center justify-center overflow-hidden border border-[#1E293B] bg-black">
              <img src="/manus-storage/anabolics-africa-logo_2013ad4b.png" alt="Anabolics Africa logo" className="h-full w-full object-contain" />
            </div>
            <div className="leading-none hidden sm:block">
              <span className="font-black text-white text-base tracking-widest uppercase">Anabolics</span>
              <span className="font-black text-base tracking-widest uppercase ml-1.5" style={{ color: "#0EA5E9" }}>Africa</span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 text-sm font-semibold uppercase tracking-wide rounded transition-colors no-underline ${
                  location === link.href
                    ? "bg-[#0EA5E9]/10 text-[#0EA5E9]"
                    : "text-[#94A3B8] hover:text-white hover:bg-white/5"
                }`}
              >
                {link.label}
              </Link>
            ))}
            {isAdmin && (
              <Link
                href="/admin"
                className={`px-4 py-2 text-sm font-semibold uppercase tracking-wide rounded transition-colors no-underline flex items-center gap-1.5 ${
                  location.startsWith("/admin")
                    ? "bg-[#E11D48]/10 text-[#E11D48]"
                    : "text-[#94A3B8] hover:text-[#E11D48] hover:bg-[#E11D48]/5"
                }`}
              >
                <Shield className="h-3.5 w-3.5" />
                Admin
              </Link>
            )}
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            {/* Cart icon */}
            {isApproved && (
              <Link href="/cart" className="relative p-2 rounded hover:bg-white/5 transition-colors no-underline text-[#94A3B8] hover:text-white">
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full text-[10px] font-bold flex items-center justify-center text-white"
                    style={{ background: "#E11D48" }}>
                    {cartCount > 9 ? "9+" : cartCount}
                  </span>
                )}
              </Link>
            )}

            {/* Auth dropdown */}
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 px-3 py-1.5 rounded border border-[#1E293B] hover:border-[#0EA5E9]/50 transition-colors bg-transparent">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
                      style={{ background: "linear-gradient(135deg, #0EA5E9, #0284C7)" }}>
                      {((user as any)?.fullName ?? "U").charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm text-[#94A3B8] hidden sm:block max-w-[100px] truncate">
                      {(user as any)?.fullName?.split(" ")[0] ?? "Account"}
                    </span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 bg-[#111111] border-[#1E293B]">
                  <DropdownMenuItem asChild>
                    <Link href="/account" className="flex items-center gap-2 no-underline text-[#94A3B8] hover:text-white cursor-pointer">
                      <User className="h-4 w-4" />
                      My Account
                    </Link>
                  </DropdownMenuItem>
                  {isAdmin && (
                    <>
                      <DropdownMenuSeparator className="bg-[#1E293B]" />
                      <DropdownMenuItem asChild>
                        <Link href="/admin" className="flex items-center gap-2 no-underline cursor-pointer" style={{ color: "#E11D48" }}>
                          <Shield className="h-4 w-4" />
                          Admin Panel
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator className="bg-[#1E293B]" />
                  <DropdownMenuItem onClick={logout} className="flex items-center gap-2 text-[#94A3B8] hover:text-white cursor-pointer">
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link href="/login" className="no-underline">
                  <Button variant="ghost" size="sm" className="text-[#94A3B8] hover:text-white hover:bg-white/5 text-sm font-semibold uppercase tracking-wide">
                    Sign In
                  </Button>
                </Link>
                <Link href="/register" className="no-underline">
                  <Button size="sm" className="text-white text-sm font-bold uppercase tracking-wide"
                    style={{ background: "linear-gradient(135deg, #0EA5E9, #0284C7)" }}>
                    Apply for Access
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile toggle */}
            <button
              type="button"
              aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={mobileOpen}
              className="flex h-11 w-11 items-center justify-center rounded hover:bg-white/5 text-[#94A3B8] hover:text-white transition-colors md:hidden"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden max-h-[calc(100vh-4.25rem)] overflow-y-auto border-t border-[#1E293B] py-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`block px-4 py-2.5 text-sm font-semibold uppercase tracking-wide rounded no-underline transition-colors ${
                  location === link.href
                    ? "text-[#0EA5E9] bg-[#0EA5E9]/10"
                    : "text-[#94A3B8] hover:text-white hover:bg-white/5"
                }`}
              >
                {link.label}
              </Link>
            ))}
            {isAdmin && (
              <Link
                href="/admin"
                onClick={() => setMobileOpen(false)}
                className="block min-h-11 px-4 py-3 text-sm font-semibold uppercase tracking-wide rounded no-underline transition-colors flex items-center gap-2"
                style={{ color: "#E11D48" }}
              >
                <Shield className="h-4 w-4" />
                Admin Panel
              </Link>
            )}
            {isApproved && (
              <Link href="/cart" onClick={() => setMobileOpen(false)}
                className="block min-h-11 px-4 py-3 text-sm font-semibold uppercase tracking-wide rounded no-underline transition-colors text-[#94A3B8] hover:text-white hover:bg-white/5 flex items-center gap-2">
                <ShoppingCart className="h-4 w-4" />
                Cart {cartCount > 0 && `(${cartCount})`}
              </Link>
            )}
            {isAuthenticated ? (
              <>
                <Link href="/account" onClick={() => setMobileOpen(false)}
                  className="block px-4 py-2.5 text-sm font-semibold uppercase tracking-wide rounded no-underline text-[#94A3B8] hover:text-white hover:bg-white/5">
                  My Account
                </Link>
                <button onClick={() => { logout(); setMobileOpen(false); }}
                  className="block w-full text-left px-4 py-2.5 text-sm font-semibold uppercase tracking-wide rounded text-[#94A3B8] hover:text-white hover:bg-white/5">
                  Sign Out
                </button>
              </>
            ) : (
              <div className="flex flex-col gap-2 pt-2 px-1">
                <Link href="/login" onClick={() => setMobileOpen(false)} className="no-underline">
                  <Button variant="outline" size="sm" className="w-full border-[#1E293B] text-[#94A3B8] font-bold uppercase tracking-wide">Sign In</Button>
                </Link>
                <Link href="/register" onClick={() => setMobileOpen(false)} className="no-underline">
                  <Button size="sm" className="w-full text-white font-bold uppercase tracking-wide"
                    style={{ background: "linear-gradient(135deg, #0EA5E9, #0284C7)" }}>
                    Apply for Access
                  </Button>
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
