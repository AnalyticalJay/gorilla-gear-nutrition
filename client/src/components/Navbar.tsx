import React, { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { LogOut, Menu, Shield, ShoppingCart, User, X } from "lucide-react";
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
    { href: "/products", label: "Shop" },
  ];

  return (
    <nav className="fixed top-0 z-50 w-full border-b border-[#1E293B] bg-[#0A0A0A]/90 backdrop-blur-md">
      <div className="h-[3px] w-full" style={{ background: "linear-gradient(90deg, #E11D48 0%, #E11D48 50%, #0EA5E9 50%, #0EA5E9 100%)" }} />
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-3 no-underline">
          <div className="flex h-10 w-10 items-center justify-center rounded bg-[#111111] border border-[#1E293B]">
            <span className="font-black tracking-wider text-white">GG</span>
          </div>
          <div>
            <span className="block text-sm font-black uppercase tracking-wider text-white">Gorilla Gear</span>
            <span className="block text-[10px] font-bold uppercase tracking-[0.2em] text-[#0EA5E9]">Nutrition</span>
          </div>
        </Link>

        <div className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => {
            const active = location === link.href;
            return (
              <Link key={link.href} href={link.href} className={`text-xs font-bold uppercase tracking-widest no-underline transition-colors ${active ? "text-[#0EA5E9]" : "text-[#94A3B8] hover:text-white"}`}>
                {link.label}
              </Link>
            );
          })}
          {isAdmin && (
            <Link href="/admin/dashboard" className={`text-xs font-bold uppercase tracking-widest no-underline transition-colors ${location.startsWith("/admin") ? "text-[#E11D48]" : "text-[#94A3B8] hover:text-white"}`}>
              Admin
            </Link>
          )}
        </div>

        <div className="flex items-center gap-3">
          {isApproved && (
            <Link href="/cart" className="relative flex h-10 w-10 items-center justify-center rounded border border-[#1E293B] bg-[#111111] text-white hover:border-[#0EA5E9]/50">
              <ShoppingCart className="h-4 w-4" />
              {cartCount > 0 && <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#E11D48] text-[10px] font-bold text-white">{cartCount}</span>}
            </Link>
          )}

          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="h-10 border-[#1E293B] bg-[#111111] text-xs font-bold uppercase tracking-wider text-white hover:border-[#0EA5E9]/50">
                  <User className="mr-2 h-3.5 w-3.5 text-[#0EA5E9]" />
                  <span className="max-w-[100px] truncate sm:max-w-[140px]">{(user as any)?.name || (user as any)?.email || "Account"}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 border-[#1E293B] bg-[#0F0F0F] text-white">
                <div className="px-3 py-2">
                  <p className="text-xs font-bold text-white">{(user as any)?.name || "Member"}</p>
                  <p className="text-[10px] text-[#64748B]">Status: <span className="capitalize text-[#0EA5E9]">{(user as any)?.status}</span></p>
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
            <div className="flex items-center gap-2">
              <Link href="/login" className="no-underline">
                <Button variant="outline" className="h-9 border-[#1E293B] bg-transparent text-xs font-bold uppercase tracking-wider text-white hover:border-[#0EA5E9]/50 hover:bg-[#0EA5E9]/10">
                  Sign In
                </Button>
              </Link>
              <Link href="/register" className="no-underline">
                <Button className="h-9 px-4 text-xs font-bold uppercase tracking-wider text-white shadow-lg" style={{ background: "linear-gradient(135deg, #E11D48, #BE123C)" }}>
                  Apply Access
                </Button>
              </Link>
            </div>
          )}

          <button onClick={() => setMobileOpen(!mobileOpen)} className="flex h-10 w-10 items-center justify-center rounded border border-[#1E293B] bg-[#111111] text-white md:hidden" aria-label="Toggle Menu">
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-b border-[#1E293B] bg-[#0A0A0A] p-4 md:hidden">
          <div className="flex flex-col gap-3">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)} className="py-2 text-sm font-bold uppercase tracking-widest text-[#94A3B8] hover:text-white no-underline">
                {link.label}
              </Link>
            ))}
            {isAdmin && (
              <Link href="/admin/dashboard" onClick={() => setMobileOpen(false)} className="py-2 text-sm font-bold uppercase tracking-widest text-[#E11D48] hover:text-white no-underline">
                Admin Dashboard
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
