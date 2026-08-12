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
        className={`fixed inset-y-0 left-0 z-50 w-[min(82vw,15rem)] bg-[#090909] border-r border-[#1E293B] flex flex-col overscroll-contain transition-transform duration-300 ${
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
                  <item.icon className="h-4 w-4 flex-shrink-0" />
                  <span className="flex-1 font-semibold uppercase tracking-wide text-xs">{item.label}</span>
                  {item.href === "/admin/users" && pendingUsers > 0 && (
                    <span aria-label={`${pendingUsers} pending application${pendingUsers === 1 ? "" : "s"}`} className="min-w-5 rounded-full bg-[#E11D48] px-1.5 py-0.5 text-center text-[10px] font-black leading-none text-white">
                      {pendingUsers > 99 ? "99+" : pendingUsers}
                    </span>
                  )}
                  {item.href === "/admin/orders" && pendingQuotes > 0 && (
                    <span aria-label={`${pendingQuotes} pending quote${pendingQuotes === 1 ? "" : "s"}`} className="min-w-5 rounded-full bg-[#E11D48] px-1.5 py-0.5 text-center text-[10px] font-black leading-none text-white">
                      {pendingQuotes > 99 ? "99+" : pendingQuotes}
                    </span>
                  )}
                  {active && <ChevronRight className="h-3 w-3" />}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* User */}
        <div className="p-4 border-t border-[#1E293B]">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0"
              style={{ background: "linear-gradient(135deg, #0EA5E9, #0284C7)" }}>
              {(user as any)?.fullName?.charAt(0)?.toUpperCase() ?? "A"}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-white truncate">{(user as any)?.fullName}</p>
              <p className="text-[10px] text-[#64748B] truncate">{(user as any)?.email}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded text-xs font-semibold uppercase tracking-wide text-[#64748B] hover:text-[#E11D48] hover:bg-[#E11D48]/5 transition-colors"
          >
            <LogOut className="h-3.5 w-3.5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div aria-label="Close admin navigation" className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex-1 lg:ml-60 flex flex-col min-h-screen">
        {/* Mobile header */}
        <header className="lg:hidden flex items-center justify-between p-4 border-b border-[#1E293B] bg-[#090909]">
          <button aria-label="Open admin navigation" onClick={() => setSidebarOpen(true)} className="flex h-11 w-11 items-center justify-center rounded hover:bg-white/5 text-[#94A3B8]">
            <Menu className="h-5 w-5" />
          </button>
            <span className="font-black text-sm uppercase tracking-widest">
            <span className="text-white">Gorilla Gear </span>
            <span style={{ color: "#0EA5E9" }}>Nutrition</span>
          </span>
          <div className="flex items-center gap-2">
            {pendingUsers > 0 && <span aria-label={`${pendingUsers} pending application${pendingUsers === 1 ? "" : "s"}`} className="rounded-full bg-[#E11D48] px-2 py-1 text-[10px] font-black text-white">{pendingUsers > 99 ? "99+" : pendingUsers}</span>}
            {pendingQuotes > 0 && <span aria-label={`${pendingQuotes} pending quote${pendingQuotes === 1 ? "" : "s"}`} className="rounded-full bg-[#E11D48] px-2 py-1 text-[10px] font-black text-white">{pendingQuotes > 99 ? "99+" : pendingQuotes}</span>}
            <div className="w-8" />
          </div>
        </header>

        <main className="flex-1 min-w-0 overflow-x-hidden p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
