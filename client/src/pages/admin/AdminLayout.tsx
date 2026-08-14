import React from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Link, useLocation } from "wouter";
import {
  LayoutDashboard,
  Users,
  Package,
  Tag,
  ShoppingBag,
  ChevronRight,
  LogOut,
  Menu,
  X,
  Shield,
  Upload,
  FileImage,
  GraduationCap,
  KeyRound,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true, color: "#0EA5E9" },
  { href: "/admin/users", label: "Applications", icon: Users, color: "#E11D48" },
  { href: "/admin/products", label: "Products", icon: Package, color: "#0EA5E9" },
  { href: "/admin/bulk-import", label: "Bulk Import", icon: Upload, color: "#10B981" },
  { href: "/admin/bulk-images", label: "Bulk Images", icon: FileImage, color: "#E11D48" },
  { href: "/admin/categories", label: "Categories", icon: Tag, color: "#0EA5E9" },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag, color: "#E11D48" },
  { href: "/admin/reset-audit", label: "Reset Audit", icon: KeyRound, color: "#38BDF8" },
  { href: "/admin/coaching-enquiries", label: "Coaching", icon: GraduationCap, color: "#c99a3d" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, logout } = useAuth();
  const [location] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const statsQuery = trpc.admin.stats.useQuery(undefined, { refetchInterval: 30000 });
  const pendingQuotes = statsQuery.data?.pendingQuotes ?? 0;
  const pendingUsers = statsQuery.data?.pendingUsers ?? 0;

  if (!isAuthenticated || (user as any)?.role !== "admin") {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="text-center p-8 rounded-lg border border-[#1E293B] bg-[#111111]">
          <Shield className="h-12 w-12 mx-auto mb-4 text-[#E11D48]" />
          <h2 className="text-2xl font-black uppercase tracking-tight text-white mb-2">Access Denied</h2>
          <p className="text-[#64748B] mb-6">Admin access required.</p>
          <Link href="/" className="no-underline">
            <Button variant="outline" className="border-[#1E293B] text-[#94A3B8] hover:text-white">Go Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return location === href;
    return location.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-[min(82vw,15rem)] bg-[#090909] border-r border-[#1E293B] flex flex-col overscroll-contain overflow-x-hidden transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        {/* Gorilla Gear top stripe */}
        <div className="h-[3px] w-full flex-shrink-0" style={{ background: "linear-gradient(90deg, #E11D48 0%, #E11D48 35%, #0EA5E9 35%, #0EA5E9 100%)" }} />

        {/* Logo */}
        <div className="p-5 border-b border-[#1E293B]">
          <Link href="/" className="flex items-center gap-2.5 no-underline">
              <div className="w-9 h-9 rounded flex items-center justify-center overflow-hidden border border-[#1E293B] bg-black">
                <img src="/manus-storage/logo_2d6e0f20.png" alt="Gorilla Gear Nutrition logo" className="h-full w-full object-contain" />
              </div>
              <div>
                <span className="font-black text-white text-sm tracking-widest uppercase">Gorilla Gear</span>
                <span className="font-black text-sm tracking-widest uppercase ml-1" style={{ color: "#0EA5E9" }}>Nutrition</span>
              </div>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => {
            const active = isActive(item.href, item.exact);
            return (
              <Link key={item.href} href={item.href} className="no-underline" onClick={() => setSidebarOpen(false)}>
                <div
                  className={`flex items-center gap-3 px-3 py-2.5 rounded text-sm transition-all ${
                    active
                      ? "font-bold"
                      : "text-[#64748B] hover:text-white hover:bg-white/5"
                  }`}
                  style={active ? {
                    background: `${item.color}12`,
                    color: item.color,
                    borderLeft: `2px solid ${item.color}`,
                  } : {}}
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                  {item.href === "/admin/users" && pendingUsers > 0 && (
                    <span className="ml-auto px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-[#E11D48] text-white">
                      {pendingUsers}
                    </span>
                  )}
                  {item.href === "/admin/orders" && pendingQuotes > 0 && (
                    <span className="ml-auto px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-[#E11D48] text-white">
                      {pendingQuotes}
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* User footer */}
        <div className="p-3 border-t border-[#1E293B] bg-[#0A0A0A]">
          <div className="flex items-center justify-between px-2 py-1.5">
            <div className="truncate">
              <p className="text-xs font-bold text-white truncate">{(user as any)?.name || "Admin"}</p>
              <p className="text-[10px] text-[#64748B] truncate">Administrator</p>
            </div>
            <button
              onClick={() => logout()}
              className="p-2 text-[#64748B] hover:text-[#E11D48] rounded transition-colors"
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main content area */}
      <div className="flex-1 flex flex-col lg:pl-[15rem]">
        {/* Mobile header */}
        <header className="sticky top-0 z-40 bg-[#0A0A0A]/90 backdrop-blur-md border-b border-[#1E293B] h-16 flex items-center justify-between px-4 lg:hidden">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 text-white rounded border border-[#1E293B] bg-[#111111]"
              aria-label="Toggle Menu"
            >
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <span className="font-black tracking-wider text-white text-sm uppercase">Admin Panel</span>
          </div>
          <Link href="/" className="text-xs font-bold uppercase tracking-widest text-[#0EA5E9] no-underline">
            View Store
          </Link>
        </header>

        {/* Backdrop for mobile sidebar */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/80 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <main className="flex-1 p-6 md:p-10 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
