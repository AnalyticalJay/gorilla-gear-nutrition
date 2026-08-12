import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { LogOut, Menu, Shield, ShoppingCart, User, X } from "lucide-react";
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

const logoSrc = "/manus-storage/logo_2d6e0f20.png";

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
    <nav className="sticky top-0 z-50 border-b border-black/10 bg-[#f7f5f0]/95 backdrop-blur">
      <div className="h-1 w-full bg-[#111111]" />
      <div className="container">
        <div className="flex min-h-[4.5rem] items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3 no-underline">
            <div className="h-12 w-11 overflow-hidden rounded-md bg-white/60 p-1">
              <img src={logoSrc} alt="Gorilla Gear Nutrition logo" className="h-full w-full object-contain" />
            </div>
            <div className="hidden leading-none sm:block">
              <span className="block text-[15px] font-black uppercase tracking-[0.11em] text-[#111111]">Gorilla Gear</span>
              <span className="mt-1 block text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#d7472f]">Nutrition</span>
            </div>
          </Link>

          <div className="hidden items-center gap-1 md:flex">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} className={`rounded-sm px-4 py-2 text-xs font-extrabold uppercase tracking-[0.16em] no-underline transition-colors ${location === link.href ? "bg-black/7 text-[#d7472f]" : "text-black/55 hover:bg-black/5 hover:text-black"}`}>
                {link.label}
              </Link>
            ))}
            {isAdmin && <Link href="/admin" className={`flex items-center gap-1.5 rounded-sm px-4 py-2 text-xs font-extrabold uppercase tracking-[0.16em] no-underline ${location.startsWith("/admin") ? "bg-[#d7472f]/10 text-[#b33c28]" : "text-black/55 hover:bg-black/5 hover:text-black"}`}><Shield className="h-3.5 w-3.5" /> Admin</Link>}
          </div>

          <div className="flex items-center gap-2">
            {isApproved && (
              <Link href="/cart" aria-label="View quote cart" className="relative rounded-sm p-2 text-black/65 no-underline hover:bg-black/5 hover:text-black">
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#d7472f] px-1 text-[9px] font-black text-white">{cartCount > 9 ? "9+" : cartCount}</span>}
              </Link>
            )}

            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 rounded-sm border border-black/15 bg-white/45 px-2.5 py-1.5 transition-colors hover:border-black/30">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#111111] text-xs font-black text-white">{((user as any)?.fullName ?? "U").charAt(0).toUpperCase()}</div>
                    <span className="hidden max-w-[100px] truncate text-xs font-bold uppercase tracking-[0.1em] text-black/65 sm:block">{(user as any)?.fullName?.split(" ")[0] ?? "Account"}</span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 border-black/10 bg-white text-[#111111]">
                  <DropdownMenuItem asChild><Link href="/account" className="flex items-center gap-2 no-underline"><User className="h-4 w-4" /> My account</Link></DropdownMenuItem>
                  {isAdmin && <><DropdownMenuSeparator className="bg-black/10" /><DropdownMenuItem asChild><Link href="/admin" className="flex items-center gap-2 no-underline text-[#b33c28]"><Shield className="h-4 w-4" /> Admin panel</Link></DropdownMenuItem></>}
                  <DropdownMenuSeparator className="bg-black/10" />
                  <DropdownMenuItem onClick={logout} className="flex items-center gap-2 text-black/65"><LogOut className="h-4 w-4" /> Sign out</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="hidden items-center gap-2 md:flex">
                <Link href="/login" className="no-underline"><Button variant="ghost" size="sm" className="text-xs font-extrabold uppercase tracking-[0.13em] text-black/60 hover:bg-black/5 hover:text-black">Sign in</Button></Link>
                <Link href="/register" className="no-underline"><Button size="sm" className="rounded-sm bg-[#111111] text-xs font-extrabold uppercase tracking-[0.13em] text-white hover:bg-[#d7472f]">Apply for membership</Button></Link>
              </div>
            )}

            <button type="button" aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"} aria-expanded={mobileOpen} className="flex h-11 w-11 items-center justify-center rounded-sm text-black/65 hover:bg-black/5 hover:text-black md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="space-y-1 border-t border-black/10 py-3 md:hidden">
            {navLinks.map((link) => <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)} className={`block rounded-sm px-4 py-3 text-xs font-extrabold uppercase tracking-[0.15em] no-underline ${location === link.href ? "bg-black/5 text-[#d7472f]" : "text-black/65 hover:bg-black/5 hover:text-black"}`}>{link.label}</Link>)}
            {isApproved && <Link href="/cart" onClick={() => setMobileOpen(false)} className="flex min-h-11 items-center gap-2 rounded-sm px-4 py-3 text-xs font-extrabold uppercase tracking-[0.15em] text-black/65 no-underline hover:bg-black/5 hover:text-black"><ShoppingCart className="h-4 w-4" /> Quote cart {cartCount > 0 && `(${cartCount})`}</Link>}
            {isAdmin && <Link href="/admin" onClick={() => setMobileOpen(false)} className="flex min-h-11 items-center gap-2 rounded-sm px-4 py-3 text-xs font-extrabold uppercase tracking-[0.15em] text-[#b33c28] no-underline hover:bg-[#d7472f]/5"><Shield className="h-4 w-4" /> Admin panel</Link>}
            {isAuthenticated ? <><Link href="/account" onClick={() => setMobileOpen(false)} className="block rounded-sm px-4 py-3 text-xs font-extrabold uppercase tracking-[0.15em] text-black/65 no-underline hover:bg-black/5 hover:text-black">My account</Link><button onClick={() => { logout(); setMobileOpen(false); }} className="block min-h-11 w-full rounded-sm px-4 py-3 text-left text-xs font-extrabold uppercase tracking-[0.15em] text-black/65 hover:bg-black/5 hover:text-black">Sign out</button></> : <div className="flex flex-col gap-2 px-1 pt-2"><Link href="/login" onClick={() => setMobileOpen(false)} className="no-underline"><Button variant="outline" size="sm" className="w-full rounded-sm border-black/20 text-xs font-extrabold uppercase tracking-[0.13em] text-black/65">Sign in</Button></Link><Link href="/register" onClick={() => setMobileOpen(false)} className="no-underline"><Button size="sm" className="w-full rounded-sm bg-[#111111] text-xs font-extrabold uppercase tracking-[0.13em] text-white hover:bg-[#d7472f]">Apply for membership</Button></Link></div>}
          </div>
        )}
      </div>
    </nav>
  );
}
