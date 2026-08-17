import React from "react";
import { trpc } from "@/lib/trpc";
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  CalendarDays,
  CircleDollarSign,
  Clock,
  ImageOff,
  Package,
  RefreshCw,
  ShoppingBag,
  TrendingUp,
  UserPlus,
  Users,
} from "lucide-react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Button } from "@/components/ui/button";

const numberFormat = new Intl.NumberFormat("en-ZA");
const currencyFormat = new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR", minimumFractionDigits: 2 });

const colors = {
  gold: "#a8751c",
  lightGold: "#f0c65e",
  ink: "#1f1f1f",
  charcoal: "#454545",
  muted: "#6b665e",
  border: "#e5dfd4",
  success: "#1f7a45",
  danger: "#b42318",
};

const statusColors: Record<string, string> = {
  pending: colors.gold,
  approved: colors.success,
  rejected: colors.danger,
  quote_pending: colors.gold,
  quote_approved: colors.gold,
  quote_rejected: colors.danger,
  awaiting_payment: colors.gold,
  paid: colors.success,
  processing: colors.charcoal,
  shipped: colors.gold,
  completed: colors.success,
  cancelled: colors.danger,
};

function formatDate(value: string | Date) {
  return new Date(value).toLocaleDateString("en-ZA", { day: "2-digit", month: "short", year: "numeric" });
}

function formatStatus(value: string) {
  return value.replaceAll("_", " ");
}

function MetricCard({ label, value, detail, icon: Icon, accent }: { label: string; value: string; detail: string; icon: React.ElementType; accent: string }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-xl border border-[#e5dfd4] bg-white p-5 shadow-[0_14px_34px_rgba(69,69,69,0.06)]"
    >
      <div className="absolute inset-y-0 left-0 w-1" style={{ backgroundColor: accent }} />
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#6b665e]">{label}</p>
          <p className="mt-3 truncate text-3xl font-black tracking-[-0.04em] text-[#1f1f1f]">{value}</p>
          <p className="mt-2 text-xs text-[#6b665e]">{detail}</p>
        </div>
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg" style={{ backgroundColor: `${accent}16`, color: accent }}>
          <Icon className="h-5 w-5" />
        </span>
      </div>
    </motion.article>
  );
}

function ProgressRow({ label, value, total, color }: { label: string; value: number; total: number; color: string }) {
  const percentage = total > 0 ? Math.min((value / total) * 100, 100) : 0;
  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3 text-xs">
        <span className="truncate capitalize text-[#454545]">{label}</span>
        <span className="shrink-0 font-bold text-[#1f1f1f]">{numberFormat.format(value)}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-[#eee9df]">
        <div className="h-full rounded-full transition-all" style={{ width: `${percentage}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}

function Panel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <article className={`min-w-0 rounded-xl border border-[#e5dfd4] bg-white p-4 shadow-[0_14px_34px_rgba(69,69,69,0.06)] sm:p-6 ${className}`}>{children}</article>;
}

export default function AdminDashboard() {
  const analyticsQuery = trpc.admin.analytics.useQuery(undefined, { refetchInterval: 60000 });
  const analytics = analyticsQuery.data;
  const pipelineData = analytics ? [
    { name: "Pending quote", value: analytics.quotes.pending, fill: colors.gold },
    { name: "Approved quote", value: analytics.quotes.approved, fill: colors.charcoal },
    { name: "Awaiting payment", value: analytics.quotes.awaitingPayment, fill: colors.lightGold },
    { name: "Paid", value: analytics.orders.paid, fill: colors.success },
    { name: "Processing", value: analytics.orders.processing, fill: colors.charcoal },
    { name: "Completed", value: analytics.orders.completed, fill: colors.success },
  ] : [];

  const isLoading = analyticsQuery.isLoading;
  const hasAttention = (analytics?.users.pending ?? 0) > 0 || (analytics?.quotes.pending ?? 0) > 0;
  const revenue = currencyFormat.format(Number(analytics?.orders.revenue ?? 0));
  const coverage = analytics?.products.imageCoveragePercent ?? 0;

  if (analyticsQuery.isError) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center rounded-2xl border border-[#b42318]/20 bg-white p-8 text-center shadow-[0_14px_34px_rgba(69,69,69,0.06)]">
        <div>
          <AlertTriangle className="mx-auto h-10 w-10 text-[#b42318]" />
          <h1 className="mt-4 text-xl font-black uppercase text-[#1f1f1f]">Analytics unavailable</h1>
          <p className="mt-2 text-sm text-[#6b665e]">The dashboard could not load the current overview.</p>
          <Button onClick={() => analyticsQuery.refetch()} className="mt-5 bg-[#a8751c] text-[#1f1f1f] hover:bg-[#c89536]">Try again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      <header className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div className="min-w-0">
          <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#a8751c]">Operations overview</p>
          <h1 className="mt-2 text-3xl font-black uppercase tracking-[-0.05em] text-[#1f1f1f] sm:text-4xl">Gorilla Gear <span className="text-[#a8751c]">Control centre</span></h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[#6b665e]">A live view of access approvals, catalogue health, quote activity, and order performance.</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <span className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.14em] text-[#6b665e]"><CalendarDays className="h-4 w-4" />{analytics?.generatedAt ? `Updated ${formatDate(analytics.generatedAt)}` : "Loading snapshot"}</span>
          <Button variant="outline" onClick={() => analyticsQuery.refetch()} className="h-10 border-[#d5c7b0] bg-white text-xs font-black uppercase tracking-[0.12em] text-[#454545] hover:bg-[#f6f0e4] hover:text-[#1f1f1f]"><RefreshCw className={`mr-2 h-4 w-4 ${analyticsQuery.isFetching ? "animate-spin" : ""}`} />Refresh</Button>
          <Link href="/admin/orders" className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-[#a8751c] px-4 text-xs font-black uppercase tracking-[0.12em] text-[#1f1f1f] no-underline transition hover:bg-[#c89536]">Review queue <ArrowRight className="h-4 w-4" /></Link>
        </div>
      </header>

      {hasAttention && (
        <section className="flex flex-col gap-4 rounded-xl border border-[#a8751c]/30 bg-[#f6f0e4] p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5" aria-label="Items needing attention">
          <div className="flex items-start gap-3"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#a8751c]/15 text-[#a8751c]"><AlertTriangle className="h-5 w-5" /></span><div><p className="text-sm font-black uppercase tracking-wide text-[#1f1f1f]">Action required</p><p className="mt-1 text-xs leading-5 text-[#6b665e]">{(analytics?.users.pending ?? 0) > 0 ? `${analytics?.users.pending} access application${analytics?.users.pending === 1 ? "" : "s"} pending` : ""}{(analytics?.users.pending ?? 0) > 0 && (analytics?.quotes.pending ?? 0) > 0 ? " · " : ""}{(analytics?.quotes.pending ?? 0) > 0 ? `${analytics?.quotes.pending} quote request${analytics?.quotes.pending === 1 ? "" : "s"} pending` : ""}</p></div></div>
          <div className="flex flex-col gap-2 sm:flex-row">{(analytics?.users.pending ?? 0) > 0 && <Link href="/admin/users" className="inline-flex min-h-10 items-center justify-center rounded-md border border-[#a8751c]/45 px-4 text-xs font-black uppercase tracking-wide text-[#7c5a20] no-underline hover:bg-white/50">Review applications</Link>}{(analytics?.quotes.pending ?? 0) > 0 && <Link href="/admin/orders" className="inline-flex min-h-10 items-center justify-center rounded-md bg-[#a8751c] px-4 text-xs font-black uppercase tracking-wide text-[#1f1f1f] no-underline hover:bg-[#c89536]">Review quotes</Link>}</div>
        </section>
      )}

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Key metrics">
        <MetricCard label="Total users" value={isLoading ? "—" : numberFormat.format(analytics?.users.total ?? 0)} detail={`${numberFormat.format(analytics?.users.newLast30Days ?? 0)} joined in 30 days`} icon={Users} accent={colors.gold} />
        <MetricCard label="Pending approvals" value={isLoading ? "—" : numberFormat.format(analytics?.users.pending ?? 0)} detail={`${numberFormat.format(analytics?.users.approved ?? 0)} approved members`} icon={Clock} accent={colors.lightGold} />
        <MetricCard label="Quote requests" value={isLoading ? "—" : numberFormat.format(analytics?.quotes.total ?? 0)} detail={`${numberFormat.format(analytics?.quotes.pending ?? 0)} awaiting review`} icon={BarChart3} accent={colors.charcoal} />
        <MetricCard label="Paid revenue" value={isLoading ? "—" : revenue} detail={`${numberFormat.format(analytics?.orders.paid ?? 0)} paid orders`} icon={CircleDollarSign} accent={colors.success} />
      </section>

      <section className="grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(280px,0.65fr)]">
        <Panel><div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between"><div><p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#a8751c]">Order pipeline</p><h2 className="mt-2 text-xl font-black uppercase tracking-[-0.04em] text-[#1f1f1f]">Where work is moving</h2></div><span className="text-xs text-[#6b665e]">Quote and fulfilment stages</span></div><div className="mt-6 h-[250px] min-w-0">{isLoading ? <div className="h-full animate-pulse rounded-lg bg-[#f6f0e4]" /> : <ResponsiveContainer width="100%" height="100%"><BarChart data={pipelineData} margin={{ top: 8, right: 8, left: -18, bottom: 12 }}><CartesianGrid stroke="#e5dfd4" vertical={false} /><XAxis dataKey="name" angle={-18} textAnchor="end" height={55} tick={{ fill: colors.muted, fontSize: 10 }} axisLine={false} tickLine={false} /><YAxis allowDecimals={false} tick={{ fill: colors.muted, fontSize: 10 }} axisLine={false} tickLine={false} /><Tooltip contentStyle={{ background: "#ffffff", border: "1px solid #e5dfd4", borderRadius: 8, color: colors.ink }} cursor={{ fill: "rgba(168,117,28,0.08)" }} /><Bar dataKey="value" radius={[5, 5, 0, 0]} /></BarChart></ResponsiveContainer>}</div></Panel>

        <Panel><div className="flex items-start justify-between gap-3"><div><p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#a8751c]">Catalogue health</p><h2 className="mt-2 text-xl font-black uppercase tracking-[-0.04em] text-[#1f1f1f]">Ready to sell</h2></div><Package className="h-5 w-5 text-[#a8751c]" /></div><div className="mt-6 flex items-end justify-between gap-4"><div><p className="text-4xl font-black tracking-[-0.06em] text-[#1f1f1f]">{isLoading ? "—" : `${coverage}%`}</p><p className="mt-1 text-xs text-[#6b665e]">Image coverage of active products</p></div><div className="relative flex h-16 w-16 items-center justify-center rounded-full border-4 border-[#eee9df]" style={{ background: `conic-gradient(${colors.success} ${coverage}%, #eee9df 0)` }}><div className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-xs font-black text-[#1f1f1f]">{isLoading ? "—" : `${Math.round(coverage)}%`}</div></div></div><div className="mt-7 space-y-4"><ProgressRow label="Products with images" value={analytics?.products.withImages ?? 0} total={analytics?.products.active ?? 0} color={colors.success} /><ProgressRow label="Missing images" value={analytics?.products.missingImages ?? 0} total={analytics?.products.active ?? 0} color={colors.danger} /></div><div className="mt-6 grid grid-cols-2 gap-3 border-t border-[#e5dfd4] pt-5"><div><p className="text-[10px] uppercase tracking-wider text-[#6b665e]">Active products</p><p className="mt-1 text-lg font-black text-[#1f1f1f]">{numberFormat.format(analytics?.products.active ?? 0)}</p></div><div><p className="text-[10px] uppercase tracking-wider text-[#6b665e]">Categories</p><p className="mt-1 text-lg font-black text-[#1f1f1f]">{numberFormat.format(analytics?.products.categories ?? 0)}</p></div></div>{(analytics?.products.missingImages ?? 0) > 0 && <Link href="/admin/bulk-images" className="mt-5 inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.12em] text-[#a8751c] no-underline hover:text-[#7c5a20]">Manage image backlog <ArrowRight className="h-4 w-4" /></Link>}</Panel>
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <Panel><div className="flex items-start justify-between gap-3"><div><p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#a8751c]">Access funnel</p><h2 className="mt-2 text-xl font-black uppercase tracking-[-0.04em] text-[#1f1f1f]">Member approvals</h2></div><UserPlus className="h-5 w-5 text-[#a8751c]" /></div><div className="mt-6 space-y-5"><ProgressRow label="Pending review" value={analytics?.users.pending ?? 0} total={analytics?.users.total ?? 0} color={colors.gold} /><ProgressRow label="Approved" value={analytics?.users.approved ?? 0} total={analytics?.users.total ?? 0} color={colors.success} /><ProgressRow label="Rejected" value={analytics?.users.rejected ?? 0} total={analytics?.users.total ?? 0} color={colors.danger} /></div><div className="mt-7 flex flex-col gap-3 border-t border-[#e5dfd4] pt-5 sm:flex-row sm:items-center sm:justify-between"><span className="text-xs text-[#6b665e]">New members in the last 30 days</span><span className="text-lg font-black text-[#1f1f1f]">{numberFormat.format(analytics?.users.newLast30Days ?? 0)}</span></div></Panel>
        <Panel><div className="flex items-start justify-between gap-3"><div><p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#a8751c]">Commercial snapshot</p><h2 className="mt-2 text-xl font-black uppercase tracking-[-0.04em] text-[#1f1f1f]">Order health</h2></div><ShoppingBag className="h-5 w-5 text-[#a8751c]" /></div><div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">{[["Total", analytics?.orders.total ?? 0], ["Paid", analytics?.orders.paid ?? 0], ["Processing", analytics?.orders.processing ?? 0], ["Completed", analytics?.orders.completed ?? 0]].map(([label, value]) => <div key={String(label)} className="rounded-lg border border-[#e5dfd4] bg-[#fcfbf8] p-3"><p className="text-[10px] uppercase tracking-wider text-[#6b665e]">{label}</p><p className="mt-2 text-2xl font-black text-[#1f1f1f]">{numberFormat.format(Number(value))}</p></div>)}</div><div className="mt-6 grid gap-3 border-t border-[#e5dfd4] pt-5 sm:grid-cols-2"><div><p className="text-[10px] uppercase tracking-wider text-[#6b665e]">Average paid order</p><p className="mt-1 text-lg font-black text-[#1f7a45]">{currencyFormat.format(Number(analytics?.orders.averagePaidOrderValue ?? 0))}</p></div><div><p className="text-[10px] uppercase tracking-wider text-[#6b665e]">Awaiting payment</p><p className="mt-1 text-lg font-black text-[#a8751c]">{numberFormat.format(analytics?.quotes.awaitingPayment ?? 0)}</p></div></div></Panel>
      </section>

      <section className="grid gap-5 xl:grid-cols-2">
        <Panel><div className="flex items-start justify-between gap-3"><div><p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#6b665e]">Latest applicants</p><h2 className="mt-2 text-xl font-black uppercase tracking-[-0.04em] text-[#1f1f1f]">Recent access activity</h2></div><Link href="/admin/users" className="text-xs font-black uppercase tracking-wide text-[#a8751c] no-underline">View all</Link></div><div className="mt-5 divide-y divide-[#e5dfd4]">{analytics?.recentUsers?.length ? analytics.recentUsers.map((person) => <div key={person.id} className="flex items-center justify-between gap-3 py-3"><div className="flex min-w-0 items-center gap-3"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#a8751c]/12 text-xs font-black text-[#a8751c]">{person.fullName.slice(0, 1).toUpperCase()}</span><div className="min-w-0"><p className="truncate text-sm font-bold text-[#1f1f1f]">{person.fullName}</p><p className="text-xs text-[#6b665e]">{formatDate(person.createdAt)}</p></div></div><span className="shrink-0 rounded-full px-2 py-1 text-[10px] font-black uppercase tracking-wide" style={{ backgroundColor: `${statusColors[person.status] ?? colors.muted}18`, color: statusColors[person.status] ?? colors.muted }}>{formatStatus(person.status)}</span></div>) : <div className="flex flex-col items-center justify-center py-10 text-center"><Users className="h-8 w-8 text-[#6b665e]" /><p className="mt-3 text-sm text-[#6b665e]">No applicants yet.</p></div>}</div></Panel>
        <Panel><div className="flex items-start justify-between gap-3"><div><p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#6b665e]">Latest orders</p><h2 className="mt-2 text-xl font-black uppercase tracking-[-0.04em] text-[#1f1f1f]">Recent commercial activity</h2></div><Link href="/admin/orders" className="text-xs font-black uppercase tracking-wide text-[#a8751c] no-underline">View all</Link></div><div className="mt-5 divide-y divide-[#e5dfd4]">{analytics?.recentOrders?.length ? analytics.recentOrders.map((order) => <div key={order.id} className="flex items-center justify-between gap-3 py-3"><div className="flex min-w-0 items-center gap-3"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#a8751c]/12 text-[#a8751c]"><TrendingUp className="h-4 w-4" /></span><div className="min-w-0"><p className="truncate text-sm font-bold text-[#1f1f1f]">#{order.id} · {order.userFullName}</p><p className="text-xs text-[#6b665e]">{formatDate(order.createdAt)} · {currencyFormat.format(Number(order.totalAmount))}</p></div></div><span className="shrink-0 rounded-full px-2 py-1 text-[10px] font-black uppercase tracking-wide" style={{ backgroundColor: `${statusColors[order.status] ?? colors.muted}18`, color: statusColors[order.status] ?? colors.muted }}>{formatStatus(order.status)}</span></div>) : <div className="flex flex-col items-center justify-center py-10 text-center"><ShoppingBag className="h-8 w-8 text-[#6b665e]" /><p className="mt-3 text-sm text-[#6b665e]">No orders yet.</p></div>}</div></Panel>
      </section>

      <section className="flex flex-col gap-4 rounded-xl border border-[#e5dfd4] bg-white p-5 shadow-[0_14px_34px_rgba(69,69,69,0.06)] sm:flex-row sm:items-center sm:justify-between sm:p-6"><div className="flex items-start gap-3"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#a8751c]/12 text-[#a8751c]"><ImageOff className="h-5 w-5" /></div><div><p className="text-sm font-black uppercase tracking-wide text-[#1f1f1f]">Keep the catalogue presentation strong</p><p className="mt-1 text-xs leading-5 text-[#6b665e]">{numberFormat.format(analytics?.products.missingImages ?? 0)} active products still need image coverage.</p></div></div><Link href="/admin/bulk-images" className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-[#a8751c]/45 px-4 text-xs font-black uppercase tracking-wide text-[#7c5a20] no-underline hover:bg-[#f6f0e4]">Open image manager <ArrowRight className="h-4 w-4" /></Link></section>
    </div>
  );
}
