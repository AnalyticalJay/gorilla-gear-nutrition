import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import OrderStatusSummaryCard from "@/components/OrderStatusSummaryCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, ChevronRight, Clock, LogOut, Package, ShoppingBag, User, XCircle } from "lucide-react";
import { Link, useParams, useLocation } from "wouter";
import { motion } from "framer-motion";
import { format } from "date-fns";

const statusStyles = {
  approved: { background: "#1f7a4514", color: "#1f7a45", borderColor: "#1f7a4538" },
  rejected: { background: "#b4231810", color: "#b42318", borderColor: "#b4231830" },
  pending: { background: "#a8751c12", color: "#7c5a20", borderColor: "#a8751c38" },
};

function StatusBadge({ status }: { status: string }) {
  const state = status === "approved" ? statusStyles.approved : status === "rejected" ? statusStyles.rejected : statusStyles.pending;
  const label = status === "approved" ? "Approved" : status === "rejected" ? "Rejected" : "Pending Approval";
  return <Badge className="border text-[10px] font-bold uppercase tracking-widest" style={state}>{label}</Badge>;
}

function OrderStatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; color: string; border: string; label: string }> = {
    pending: { bg: "#a8751c12", color: "#7c5a20", border: "#a8751c38", label: "Pending Review" },
    quote_pending: { bg: "#a8751c12", color: "#7c5a20", border: "#a8751c38", label: "Quote Under Review" },
    quote_approved: { bg: "#a8751c12", color: "#7c5a20", border: "#a8751c38", label: "Quote Approved" },
    quote_rejected: { bg: "#b4231810", color: "#b42318", border: "#b4231830", label: "Quote Rejected" },
    awaiting_payment: { bg: "#a8751c12", color: "#7c5a20", border: "#a8751c38", label: "Awaiting Payment" },
    paid: { bg: "#1f7a4514", color: "#1f7a45", border: "#1f7a4538", label: "Paid" },
    processing: { bg: "#45454510", color: "#454545", border: "#45454528", label: "Processing" },
    shipped: { bg: "#a8751c12", color: "#7c5a20", border: "#a8751c38", label: "Shipped" },
    delivered: { bg: "#1f7a4514", color: "#1f7a45", border: "#1f7a4538", label: "Delivered" },
    cancelled: { bg: "#b4231810", color: "#b42318", border: "#b4231830", label: "Cancelled" },
  };
  const current = map[status] ?? { bg: "#4545450e", color: "#454545", border: "#45454528", label: status };
  return <Badge className="border text-[10px] font-bold uppercase tracking-widest" style={{ background: current.bg, color: current.color, borderColor: current.border }}>{current.label}</Badge>;
}

export default function Account() {
  const { tab } = useParams<{ tab?: string }>();
  const { user, isAuthenticated, logout } = useAuth();
  const [, navigate] = useLocation();
  const ordersQuery = trpc.orders.myOrders.useQuery(undefined, { enabled: isAuthenticated && (user as { status?: string } | undefined)?.status === "approved" });
  const orders = ordersQuery.data ?? [];

  if (!isAuthenticated) {
    return <div className="min-h-screen bg-[#f7f5f1]"><Navbar /><div className="container py-24 pt-24 text-center"><User className="mx-auto mb-4 h-16 w-16 text-[#bdb5a8]" /><h2 className="mb-4 text-2xl font-black uppercase tracking-tight text-[#1f1f1f]">Sign In Required</h2><Link href="/login" className="no-underline"><Button className="bg-[#a8751c] font-bold uppercase tracking-widest text-[#1f1f1f] hover:bg-[#c89536]">Sign In</Button></Link></div><Footer /></div>;
  }

  const activeTab = tab ?? "profile";
  const u = user as { fullName?: string; email?: string; status?: string; phone?: string; city?: string; createdAt?: string | Date; role?: string };
  const navItems = [{ id: "profile", label: "Profile", icon: User }, { id: "orders", label: "Orders", icon: ShoppingBag }];

  return (
    <div className="min-h-screen bg-[#f7f5f1]">
      <Navbar />
      <div className="pb-24 pt-20 sm:pb-8"><div className="container px-4 py-6 sm:py-8">
        <div className="mb-8 text-center sm:text-left"><div className="mx-auto mb-4 h-[3px] w-16 bg-[linear-gradient(90deg,#a8751c_0%,#a8751c_55%,#f0c65e_55%,#f0c65e_100%)] sm:mx-0" /><h1 className="text-2xl font-black uppercase tracking-tight text-[#1f1f1f] sm:text-3xl">My <span className="text-[#a8751c]">Account</span></h1></div>
        <div className="grid gap-6 lg:grid-cols-4 lg:gap-8">
          <aside className="h-fit rounded-lg border border-[#e5dfd4] bg-white p-4 shadow-[0_12px_30px_rgba(69,69,69,0.05)]">
            <div className="mb-6 flex flex-col items-center gap-2 rounded border border-[#e5dfd4] bg-[#fcfbf8] p-3 text-center sm:flex-row sm:gap-3 sm:text-left"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#a8751c] text-sm font-bold text-[#1f1f1f]">{u?.fullName?.charAt(0)?.toUpperCase() ?? "U"}</div><div className="min-w-0"><p className="truncate text-sm font-bold text-[#1f1f1f]">{u?.fullName}</p><p className="truncate text-xs text-[#6b665e]">{u?.email}</p></div></div>
            <nav className="grid grid-cols-2 gap-2 space-y-0.5 sm:block sm:space-y-0.5">{navItems.map((item) => { const active = activeTab === item.id; return <Link key={item.id} href={`/account/${item.id}`} className="no-underline"><button className={`flex min-h-11 w-full items-center justify-center gap-2 rounded px-3 py-2.5 text-sm font-bold uppercase tracking-wide transition-all sm:justify-start sm:gap-3 ${active ? "border-l-2 border-[#a8751c] bg-[#f6f0e4] text-[#7c5a20]" : "border-l-2 border-transparent text-[#6b665e] hover:bg-[#fcfbf8] hover:text-[#1f1f1f]"}`}><item.icon className="h-4 w-4" /><span className="text-xs sm:flex-1 sm:text-left">{item.label}</span>{active && <ChevronRight className="hidden h-3 w-3 sm:block" />}</button></Link>; })}</nav>
            <div className="mt-4 border-t border-[#e5dfd4] pt-4"><button onClick={logout} className="flex w-full items-center justify-center gap-3 rounded px-3 py-2.5 text-xs font-bold uppercase tracking-wide text-[#6b665e] transition-colors hover:bg-[#b4231808] hover:text-[#b42318] sm:justify-start"><LogOut className="h-4 w-4" />Sign Out</button></div>
          </aside>
          <div className="min-w-0 space-y-6 lg:col-span-3">
            <OrderStatusSummaryCard orders={orders} isLoading={ordersQuery.isLoading} />
            {activeTab === "profile" && <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
              <section className="rounded-lg border border-[#e5dfd4] bg-white p-4 text-center shadow-[0_12px_30px_rgba(69,69,69,0.05)] sm:p-6 sm:text-left"><h2 className="mb-5 text-sm font-black uppercase tracking-widest text-[#6b665e]">Account Status</h2><div className="flex flex-col items-center gap-3 rounded border border-[#e5dfd4] bg-[#fcfbf8] p-4 sm:flex-row sm:items-center sm:gap-4"><div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full" style={{ background: u?.status === "approved" ? "#1f7a45" : u?.status === "rejected" ? "#b42318" : "#a8751c" }}>{u?.status === "approved" ? <CheckCircle className="h-6 w-6 text-white" /> : u?.status === "rejected" ? <XCircle className="h-6 w-6 text-white" /> : <Clock className="h-6 w-6 text-white" />}</div><div><div className="mb-1.5 flex justify-center gap-2 sm:justify-start"><StatusBadge status={u?.status ?? "pending"} /></div><p className="text-sm text-[#6b665e]">{u?.status === "approved" ? "Your account is approved. You have full access to the catalog." : u?.status === "rejected" ? "Your application was not approved. Contact support for more information." : "Your application is under review. Typically approved within 24 hours."}</p></div></div></section>
              <section className="rounded-lg border border-[#e5dfd4] bg-white p-4 text-center shadow-[0_12px_30px_rgba(69,69,69,0.05)] sm:p-6 sm:text-left"><h2 className="mb-5 text-sm font-black uppercase tracking-widest text-[#6b665e]">Profile Details</h2><div className="grid gap-3 sm:grid-cols-2">{[{ label: "Full Name", value: u?.fullName }, { label: "Email", value: u?.email }, { label: "Phone", value: u?.phone ?? "—" }, { label: "City", value: u?.city ?? "—" }, { label: "Member Since", value: u?.createdAt ? format(new Date(u.createdAt), "d MMM yyyy") : "—" }, { label: "Role", value: u?.role === "admin" ? "Administrator" : "Member" }].map((field) => <div key={field.label} className="rounded border border-[#e5dfd4] bg-[#fcfbf8] p-3 text-center sm:text-left"><p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-[#6b665e]">{field.label}</p><p className="break-words text-sm font-semibold text-[#1f1f1f]">{field.value}</p></div>)}</div></section>
            </motion.div>}
            {activeTab === "orders" && <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}><section className="rounded-lg border border-[#e5dfd4] bg-white p-4 shadow-[0_12px_30px_rgba(69,69,69,0.05)] sm:p-6"><h2 className="mb-5 text-sm font-black uppercase tracking-widest text-[#6b665e]">Quote &amp; Payment History</h2>{ordersQuery.isLoading ? <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-16 animate-pulse rounded bg-[#eee9df]" />)}</div> : orders.length === 0 ? <div className="py-12 text-center"><Package className="mx-auto mb-3 h-12 w-12 text-[#bdb5a8]" /><p className="mb-4 text-[#6b665e]">No quote requests yet</p><Link href="/products" className="no-underline"><Button size="sm" className="bg-[#a8751c] font-bold uppercase tracking-wide text-[#1f1f1f] hover:bg-[#c89536]">Browse Products</Button></Link></div> : <div className="space-y-3">{orders.map((order) => <Link key={order.id} href={`/orders/${order.id}`} className="block no-underline"><div className="flex flex-wrap items-center gap-3 rounded border border-[#e5dfd4] bg-[#fcfbf8] p-3 transition-colors hover:border-[#a8751c]/45 sm:flex-nowrap sm:gap-4 sm:p-4"><div className="min-w-0 flex-1"><div className="mb-1 flex flex-wrap items-center gap-2"><span className="text-sm font-bold text-[#1f1f1f]">Quote #{order.id}</span><OrderStatusBadge status={order.status} /></div><p className="text-xs text-[#6b665e]">{format(new Date(order.createdAt), "d MMM yyyy")}{order.paymentMethod ? ` · ${order.paymentMethod.toUpperCase()}` : ""}</p></div><div className="ml-auto shrink-0 text-right"><p className="font-black text-[#1f1f1f]">R{parseFloat(order.totalAmount).toFixed(2)}</p></div><ChevronRight className="h-4 w-4 text-[#a8751c]" /></div></Link>)}</div>}</section></motion.div>}
          </div>
        </div>
      </div></div>
      <Footer />
    </div>
  );
}
