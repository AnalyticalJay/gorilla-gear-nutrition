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

const approvedLogoSrc = "/manus-storage/logo_2d6e0f20.png";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [location] = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const isApproved = (user as any)?.status === "approved";
  const isAdmin = (user as any)?.role === "admin";

  const cartQuery = trpc.cart.get.useQuery(undefined, { enabled: isApproved });
  const cartCount = cartQuery.data?.reduce((sum, item) => sum + item.quantity, 0) ?? 0;
  const navLinks = [
    { href: "/#collections", label: "Shop" },
    { href: "/coaching", label: "Coaching" },
    { href: "/#membership", label: "Apply" },
  ];

  return (
    <nav className="fixed top-0 z-50 w-full border-b border-white/10 bg-[#070707]/95 backdrop-blur-md">
      <div className="border-b border-white/10 py-1.5 text-center text-[8px] font-bold uppercase tracking-[0.3em] text-white/65 sm:text-[9px]">Premium supplements. Elite coaching. <span className="text-[#c99a3d]">Real results.</span></div>
      <div className="container flex h-16 items-center justify-between gap-2">
        <Link href="/" className="flex min-w-0 items-center gap-2 no-underline sm:gap-3">
          <div className="flex h-10 w-10 items-center justify-center overflow-hidden border border-white/20 bg-black">
            <img src={approvedLogoSrc} alt="Gorilla Gear Nutrition approved logo" className="h-full w-full object-contain" />
          </div>
          <div className="min-w-0">
            <span className="block truncate text-sm font-black uppercase tracking-wider text-white">Gorilla Gear</span>
            <span className="block text-[10px] font-bold uppercase tracking-[0.2em] text-[#c99a3d]">Nutrition</span>
          </div>
        </Link>

        <div className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => {
            const active = location === link.href;
            return (
              <a key={link.href} href={link.href} className={`text-[10px] font-bold uppercase tracking-[0.16em] no-underline transition-colors ${active ? "text-[#c99a3d]" : "text-white/65 hover:text-[#c99a3d]"}`}>
                {link.label}
              </a>
            );
          })}
          {isAdmin && (
            <Link href="/admin/dashboard" className={`text-[10px] font-bold uppercase tracking-[0.16em] no-underline transition-colors ${location.startsWith("/admin") ? "text-[#c99a3d]" : "text-white/65 hover:text-[#c99a3d]"}`}>
              Admin
            </Link>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          {isApproved && (
            <Link href="/cart" className="relative flex h-11 w-11 items-center justify-center border border-white/20 bg-[#111111] text-white hover:border-[#c99a3d]/70 sm:h-10 sm:w-10">
              <ShoppingCart className="h-4 w-4" />
              {cartCount > 0 && <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#E11D48] text-[10px] font-bold text-white">{cartCount}</span>}
            </Link>
          )}

          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button aria-label="Open account menu" variant="outline" className="h-10 min-w-10 border-[#1E293B] bg-[#111111] px-2 text-xs font-bold uppercase tracking-wider text-white hover:border-[#0EA5E9]/50 sm:px-3">
                  <User className="h-3.5 w-3.5 text-[#c99a3d] sm:mr-2" />
                  <span className="hidden max-w-[100px] truncate sm:inline sm:max-w-[140px]">{(user as any)?.name || (user as any)?.email || "Account"}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 border-[#1E293B] bg-[#0F0F0F] text-white">
                <div className="px-3 py-2">
                  <p className="text-xs font-bold text-white">{(user as any)?.name || "Member"}</p>
                  <p className="text-[10px] text-white/50">Status: <span className="capitalize text-[#c99a3d]">{(user as any)?.status}</span></p>
                </div>
                <DropdownMenuSeparator className="bg-[#1E293B]" />
                <DropdownMenuItem asChild className="focus:bg-[#1E293B] focus:text-white">
                  <Link href="/account" className="flex w-full items-center cursor-pointer text-xs font-bold uppercase">Account Status</Link>
                </DropdownMenuItem>
                {isAdmin && (
                  <DropdownMenuItem asChild className="focus:bg-[#1E293B] focus:text-white">
                    <Link href="/admin/dashboard" className="flex w-full items-center cursor-pointer text-xs font-bold uppercase text-[#E11D48]">Admin Dashboard</Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator className="bg-[#1E293B]" />
                <DropdownMenuItem onClick={() => logout()} className="cursor-pointer text-xs font-bold uppercase text-[#E11D48] focus:bg-[#E11D48]/10 focus:text-[#E11D48]">
                  <LogOut className="mr-2 h-3.5 w-3.5" /> Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="hidden items-center gap-2 sm:flex">
              <Link href="/login" className="no-underline">
                  <Button variant="outline" className="h-9 border-white/25 bg-transparent text-xs font-bold uppercase tracking-wider text-white hover:border-[#c99a3d]/70 hover:bg-white/5">
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

          <button onClick={() => setMobileOpen(!mobileOpen)} className="flex h-11 w-11 items-center justify-center border border-white/20 bg-[#111111] text-white md:hidden sm:h-10 sm:w-10" aria-label="Toggle Menu">
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-b border-white/10 bg-[#070707] p-4 md:hidden">
          <div className="flex flex-col gap-3">
            {navLinks.map((link) => (
              <a key={link.href} href={link.href} onClick={() => setMobileOpen(false)} className="flex min-h-11 items-center py-2 text-sm font-bold uppercase tracking-widest text-white/65 hover:text-[#c99a3d] no-underline">
                {link.label}
              </a>
            ))}
            {isAdmin && (
              <Link href="/admin/dashboard" onClick={() => setMobileOpen(false)} className="flex min-h-11 items-center py-2 text-sm font-bold uppercase tracking-widest text-[#E11D48] hover:text-white no-underline">
                Admin Dashboard
              </Link>
            )}
            {!isAuthenticated && (
              <div className="grid grid-cols-2 gap-2 border-t border-[#1E293B] pt-3">
                <Link href="/login" onClick={() => setMobileOpen(false)} className="no-underline">
                  <Button variant="outline" className="h-10 w-full border-white/25 bg-transparent text-xs font-bold uppercase tracking-wider text-white">Sign In</Button>
                </Link>
                <Link href="/register" onClick={() => setMobileOpen(false)} className="no-underline">
                  <Button className="h-10 w-full text-xs font-bold uppercase tracking-wider text-black" style={{ background: "#c99a3d" }}>Apply Access</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
