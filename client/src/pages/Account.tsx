import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Package,
  Clock,
  CheckCircle,
  XCircle,
  ShoppingBag,
  ChevronRight,
  LogOut,
} from "lucide-react";
import { Link, useParams, useLocation } from "wouter";
import { motion } from "framer-motion";
import { format } from "date-fns";

function StatusBadge({ status }: { status: string }) {
  if (status === "approved") return (
    <Badge className="text-[10px] font-bold uppercase tracking-widest border"
      style={{ background: "#16A34A20", color: "#4ADE80", borderColor: "#16A34A40" }}>
      Approved
    </Badge>
  );
  if (status === "rejected") return (
    <Badge className="text-[10px] font-bold uppercase tracking-widest border"
      style={{ background: "#E11D4820", color: "#F87171", borderColor: "#E11D4840" }}>
      Rejected
    </Badge>
  );
  return (
    <Badge className="text-[10px] font-bold uppercase tracking-widest border"
      style={{ background: "#F59E0B20", color: "#FCD34D", borderColor: "#F59E0B40" }}>
      Pending Approval
    </Badge>
  );
}

function OrderStatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; color: string; border: string; label: string }> = {
    pending:          { bg: "#F59E0B20", color: "#FCD34D", border: "#F59E0B40", label: "Pending Review" },
    quote_pending:    { bg: "#F59E0B20", color: "#FCD34D", border: "#F59E0B40", label: "Quote Under Review" },
    quote_approved:   { bg: "#0EA5E920", color: "#38BDF8", border: "#0EA5E940", label: "Quote Approved" },
    quote_rejected:   { bg: "#E11D4820", color: "#F87171", border: "#E11D4840", label: "Quote Rejected" },
    awaiting_payment: { bg: "#F9731620", color: "#FDBA74", border: "#F9731640", label: "Awaiting Payment" },
    paid:             { bg: "#16A34A20", color: "#4ADE80", border: "#16A34A40", label: "Paid" },
    processing: { bg: "#8B5CF620", color: "#C4B5FD", border: "#8B5CF640", label: "Processing" },
    shipped:    { bg: "#06B6D420", color: "#67E8F9", border: "#06B6D440", label: "Shipped" },
    delivered:  { bg: "#16A34A20", color: "#4ADE80", border: "#16A34A40", label: "Delivered" },
    cancelled:  { bg: "#E11D4820", color: "#F87171", border: "#E11D4840", label: "Cancelled" },
  };
  const s = map[status] ?? { bg: "#1E293B", color: "#94A3B8", border: "#1E293B", label: status };
  return (
    <Badge className="text-[10px] font-bold uppercase tracking-widest border"
      style={{ background: s.bg, color: s.color, borderColor: s.border }}>
      {s.label}
    </Badge>
  );
}

export default function Account() {
  const { tab } = useParams<{ tab?: string }>();
  const { user, isAuthenticated, logout } = useAuth();
  const [, navigate] = useLocation();

  const ordersQuery = trpc.orders.myOrders.useQuery(undefined, {
    enabled: isAuthenticated && (user as any)?.status === "approved",
  });
  const orders = ordersQuery.data ?? [];

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0A0A0A]">
        <Navbar />
        <div className="pt-24 container text-center py-24">
          <User className="h-16 w-16 mx-auto mb-4 text-[#334155]" />
          <h2 className="text-2xl font-black uppercase tracking-tight text-white mb-4">Sign In Required</h2>
          <Link href="/login" className="no-underline">
            <Button className="text-white font-bold uppercase tracking-widest"
              style={{ background: "linear-gradient(135deg, #0EA5E9, #0284C7)" }}>
              Sign In
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const activeTab = tab ?? "profile";
  const u = user as any;

  const navItems = [
    { id: "profile", label: "Profile", icon: User },
    { id: "orders", label: "Orders", icon: ShoppingBag },
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <Navbar />
      <div className="pt-20">
        <div className="container px-4 py-6 sm:py-8">

          {/* Header */}
          <div className="mb-8">
            <div className="h-[3px] w-16 mb-4" style={{ background: "linear-gradient(90deg, #E11D48 0%, #E11D48 50%, #0EA5E9 50%, #0EA5E9 100%)" }} />
            <h1 className="text-3xl font-black uppercase tracking-tight text-white">
              My <span style={{ color: "#0EA5E9" }}>Account</span>
            </h1>
          </div>

          <div className="grid gap-6 lg:grid-cols-4 lg:gap-8">
            {/* Sidebar */}
            <div className="h-fit rounded-lg border border-[#1E293B] bg-[#111111] p-4">
              <div className="flex items-center gap-3 mb-6 p-3 rounded border border-[#1E293B] bg-[#0A0A0A]">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                  style={{ background: "linear-gradient(135deg, #0EA5E9, #0284C7)" }}>
                  {u?.fullName?.charAt(0)?.toUpperCase() ?? "U"}
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-sm text-white truncate">{u?.fullName}</p>
                  <p className="text-xs text-[#64748B] truncate">{u?.email}</p>
                </div>
              </div>

              <nav className="space-y-0.5">
                {navItems.map((item) => {
                  const active = activeTab === item.id;
                  return (
                    <Link key={item.id} href={`/account/${item.id}`} className="no-underline">
                      <button
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded text-sm font-bold uppercase tracking-wide transition-all ${
                          active ? "" : "text-[#64748B] hover:text-white hover:bg-white/5"
                        }`}
                        style={active ? {
                          background: "#0EA5E912",
                          color: "#0EA5E9",
                          borderLeft: "2px solid #0EA5E9",
                        } : {}}
                      >
                        <item.icon className="h-4 w-4" />
                        <span className="flex-1 text-left text-xs">{item.label}</span>
                        {active && <ChevronRight className="h-3 w-3" />}
                      </button>
                    </Link>
                  );
                })}
              </nav>

              <div className="mt-4 pt-4 border-t border-[#1E293B]">
                <button
                  onClick={logout}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded text-xs font-bold uppercase tracking-wide text-[#64748B] hover:text-[#E11D48] hover:bg-[#E11D48]/5 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="min-w-0 lg:col-span-3">
              {activeTab === "profile" && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
                  {/* Status card */}
                  <div className="rounded-lg border border-[#1E293B] bg-[#111111] p-4 sm:p-6">
                    <h2 className="font-black text-sm uppercase tracking-widest text-[#94A3B8] mb-5">Account Status</h2>
                    <div className="flex flex-col items-start gap-3 rounded border border-[#1E293B] bg-[#0A0A0A] p-4 sm:flex-row sm:items-center sm:gap-4">
                      <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{
                          background: u?.status === "approved"
                            ? "linear-gradient(135deg, #16A34A, #15803D)"
                            : u?.status === "rejected"
                            ? "linear-gradient(135deg, #E11D48, #BE123C)"
                            : "linear-gradient(135deg, #F59E0B, #D97706)"
                        }}>
                        {u?.status === "approved" ? (
                          <CheckCircle className="h-6 w-6 text-white" />
                        ) : u?.status === "rejected" ? (
                          <XCircle className="h-6 w-6 text-white" />
                        ) : (
                          <Clock className="h-6 w-6 text-white" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1.5">
                          <StatusBadge status={u?.status ?? "pending"} />
                        </div>
                        <p className="text-sm text-[#64748B]">
                          {u?.status === "approved"
                            ? "Your account is approved. You have full access to the catalog."
                            : u?.status === "rejected"
                            ? "Your application was not approved. Contact support for more information."
                            : "Your application is under review. Typically approved within 24 hours."}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Profile details */}
                  <div className="rounded-lg border border-[#1E293B] bg-[#111111] p-4 sm:p-6">
                    <h2 className="font-black text-sm uppercase tracking-widest text-[#94A3B8] mb-5">Profile Details</h2>
                    <div className="grid sm:grid-cols-2 gap-3">
                      {[
                        { label: "Full Name", value: u?.fullName },
                        { label: "Email", value: u?.email },
                        { label: "Phone", value: u?.phone ?? "—" },
                        { label: "City", value: u?.city ?? "—" },
                        { label: "Member Since", value: u?.createdAt ? format(new Date(u.createdAt), "d MMM yyyy") : "—" },
                        { label: "Role", value: u?.role === "admin" ? "Administrator" : "Member" },
                      ].map((field) => (
                        <div key={field.label} className="p-3 rounded border border-[#1E293B] bg-[#0A0A0A]">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-[#64748B] mb-1">{field.label}</p>
                          <p className="break-words text-sm font-semibold text-white">{field.value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === "orders" && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  <div className="rounded-lg border border-[#1E293B] bg-[#111111] p-4 sm:p-6">
                    <h2 className="font-black text-sm uppercase tracking-widest text-[#94A3B8] mb-5">Quote & Payment History</h2>
                    {ordersQuery.isLoading ? (
                      <div className="space-y-3">
                        {[...Array(3)].map((_, i) => (
                          <div key={i} className="h-16 bg-[#1E293B] rounded animate-pulse" />
                        ))}
                      </div>
                    ) : orders.length === 0 ? (
                      <div className="text-center py-12">
                        <Package className="h-12 w-12 mx-auto mb-3 text-[#334155]" />
                        <p className="text-[#64748B] mb-4">No quote requests yet</p>
                        <Link href="/products" className="no-underline">
                          <Button size="sm" className="text-white font-bold uppercase tracking-wide"
                            style={{ background: "linear-gradient(135deg, #0EA5E9, #0284C7)" }}>
                            Browse Products
                          </Button>
                        </Link>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {orders.map((order) => (
                          <Link key={order.id} href={`/orders/${order.id}`} className="no-underline block">
                            <div className="flex items-center gap-3 rounded border border-[#1E293B] bg-[#0A0A0A] p-3 transition-colors hover:border-[#0EA5E9]/30 cursor-pointer sm:gap-4 sm:p-4">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-bold text-sm text-white">Quote #{order.id}</span>
                                  <OrderStatusBadge status={order.status} />
                                </div>
                                <p className="text-xs text-[#64748B]">
                                  {format(new Date(order.createdAt), "d MMM yyyy")}
                                  {order.paymentMethod ? ` · ${order.paymentMethod.toUpperCase()}` : ""}
                                </p>
                              </div>
                              <div className="shrink-0 text-right">
                                <p className="font-black text-white">R{parseFloat(order.totalAmount).toFixed(2)}</p>
                              </div>
                              <ChevronRight className="h-4 w-4 text-[#334155]" />
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
