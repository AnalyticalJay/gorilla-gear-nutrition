import React, { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Link, useLocation } from "wouter";
import {
  FileImage,
  CreditCard,
  GraduationCap,
  KeyRound,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  ShoppingBag,
  Shield,
  Tag,
  Upload,
  Users,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/users", label: "Applications", icon: Users },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/bulk-import", label: "Bulk Import", icon: Upload },
  { href: "/admin/bulk-images", label: "Bulk Images", icon: FileImage },
  { href: "/admin/categories", label: "Categories", icon: Tag },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { href: "/admin/payment-audit", label: "Payment Audit", icon: CreditCard },
  { href: "/admin/reset-audit", label: "Reset Audit", icon: KeyRound },
  { href: "/admin/coaching-enquiries", label: "Coaching", icon: GraduationCap },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, logout } = useAuth();
  const [location] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const statsQuery = trpc.admin.stats.useQuery(undefined, { refetchInterval: 30000 });
  const pendingQuotes = statsQuery.data?.pendingQuotes ?? 0;
  const pendingUsers = statsQuery.data?.pendingUsers ?? 0;

  if (!isAuthenticated || (user as { role?: string } | undefined)?.role !== "admin") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7f5f1]">
        <div className="rounded-lg border border-[#e5dfd4] bg-white p-8 text-center shadow-[0_14px_34px_rgba(69,69,69,0.08)]">
          <Shield className="mx-auto mb-4 h-12 w-12 text-[#b42318]" />
          <h2 className="mb-2 text-2xl font-black uppercase tracking-tight text-[#1f1f1f]">Access Denied</h2>
          <p className="mb-6 text-[#6b665e]">Admin access required.</p>
          <Link href="/" className="no-underline">
            <Button variant="outline" className="border-[#d5c7b0] text-[#454545] hover:bg-[#f6f0e4] hover:text-[#1f1f1f]">Go Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  const isActive = (href: string, exact?: boolean) => exact ? location === href : location.startsWith(href);

  return (
    <div className="flex min-h-screen bg-[#f7f5f1]">
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[min(82vw,15rem)] flex-col overflow-x-hidden overscroll-contain border-r border-black/10 bg-[#454545] transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        <div className="h-[3px] w-full shrink-0 bg-[linear-gradient(90deg,#a8751c_0%,#a8751c_55%,#f0c65e_55%,#f0c65e_100%)]" />

        <div className="border-b border-white/10 p-5">
          <Link href="/" className="flex items-center gap-2.5 no-underline">
            <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded">
              <img src="/api/media/ggn-logo-transparent-light_b806869d.png" alt="Gorilla Gear Nutrition logo" className="h-full w-full object-contain" />
            </div>
            <div>
              <span className="text-sm font-black uppercase tracking-widest text-white">Gorilla Gear</span>
              <span className="ml-1 text-sm font-black uppercase tracking-widest text-[#f0c65e]">Nutrition</span>
            </div>
          </Link>
        </div>

        <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
          {navItems.map((item) => {
            const active = isActive(item.href, item.exact);
            return (
              <Link key={item.href} href={item.href} className="no-underline" onClick={() => setSidebarOpen(false)}>
                <div
                  className={`flex items-center gap-3 rounded px-3 py-2.5 text-sm transition-all ${
                    active
                      ? "border-l-2 border-[#f0c65e] bg-white/10 font-bold text-[#f0c65e]"
                      : "border-l-2 border-transparent text-white/65 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                  {item.href === "/admin/users" && pendingUsers > 0 && (
                    <span className="ml-auto rounded-full bg-[#f0c65e] px-1.5 py-0.5 text-[10px] font-bold text-[#1f1f1f]">{pendingUsers}</span>
                  )}
                  {item.href === "/admin/orders" && pendingQuotes > 0 && (
                    <span className="ml-auto rounded-full bg-[#f0c65e] px-1.5 py-0.5 text-[10px] font-bold text-[#1f1f1f]">{pendingQuotes}</span>
                  )}
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-white/10 bg-black/10 p-3">
          <div className="flex items-center justify-between px-2 py-1.5">
            <div className="truncate">
              <p className="truncate text-xs font-bold text-white">{(user as { name?: string })?.name || "Admin"}</p>
              <p className="truncate text-[10px] text-white/55">Administrator</p>
            </div>
            <button onClick={() => logout()} className="rounded p-2 text-white/55 transition-colors hover:text-[#f0c65e]" title="Logout">
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      <div className="flex flex-1 flex-col lg:pl-[15rem]">
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-[#e5dfd4] bg-white/95 px-4 backdrop-blur-md lg:hidden">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="rounded border border-[#d5c7b0] bg-white p-2 text-[#1f1f1f]" aria-label="Toggle Menu">
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <span className="text-sm font-black uppercase tracking-wider text-[#1f1f1f]">Admin Panel</span>
          </div>
          <Link href="/" className="text-xs font-bold uppercase tracking-widest text-[#a8751c] no-underline">View Store</Link>
        </header>

        {sidebarOpen && <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />}

        <main className="mx-auto w-full max-w-7xl flex-1 p-6 md:p-10">{children}</main>
      </div>
    </div>
  );
}
