import React from "react";
import { trpc } from "@/lib/trpc";
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  CalendarDays,
  CheckCircle,
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
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Button } from "@/components/ui/button";

const numberFormat = new Intl.NumberFormat("en-ZA");
const currencyFormat = new Intl.NumberFormat("en-ZA", {
  style: "currency",
  currency: "ZAR",
  minimumFractionDigits: 2,
});

const statusColors: Record<string, string> = {
  pending: "#FBBF24",
  approved: "#34D399",
  rejected: "#FB7185",
  quote_pending: "#FBBF24",
  quote_approved: "#60A5FA",
  quote_rejected: "#FB7185",
  awaiting_payment: "#A78BFA",
  paid: "#34D399",
  processing: "#60A5FA",
  shipped: "#22D3EE",
  completed: "#34D399",
  cancelled: "#FB7185",
};

function formatDate(value: string | Date) {
  return new Date(value).toLocaleDateString("en-ZA", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatStatus(value: string) {
  return value.replaceAll("_", " ");
}

function MetricCard({
  label,
  value,
  detail,
  icon: Icon,
  accent,
}: {
  label: string;
  value: string;
  detail: string;
  icon: React.ElementType;
  accent: string;
}) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-xl border border-white/10 bg-[#111111] p-5 shadow-[0_16px_40px_rgba(0,0,0,0.18)]"
    >
      <div className="absolute inset-y-0 left-0 w-1" style={{ backgroundColor: accent }} />
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#64748B]">{label}</p>
          <p className="mt-3 truncate text-3xl font-black tracking-[-0.04em] text-white">{value}</p>
          <p className="mt-2 text-xs text-[#94A3B8]">{detail}</p>
        </div>
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg" style={{ backgroundColor: `${accent}18`, color: accent }}>
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
        <span className="truncate capitalize text-[#CBD5E1]">{label}</span>
        <span className="shrink-0 font-bold text-white">{numberFormat.format(value)}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-white/8">
        <div className="h-full rounded-full transition-all" style={{ width: `${percentage}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const analyticsQuery = trpc.admin.analytics.useQuery(undefined, { refetchInterval: 60000 });
  const analytics = analyticsQuery.data;

  const pipelineData = analytics
    ? [
        { name: "Pending quote", value: analytics.quotes.pending, fill: "#FBBF24" },
        { name: "Approved quote", value: analytics.quotes.approved, fill: "#60A5FA" },
        { name: "Awaiting payment", value: analytics.quotes.awaitingPayment, fill: "#A78BFA" },
        { name: "Paid", value: analytics.orders.paid, fill: "#34D399" },
        { name: "Processing", value: analytics.orders.processing, fill: "#22D3EE" },
        { name: "Completed", value: analytics.orders.completed, fill: "#34D399" },
      ]
    : [];

  const isLoading = analyticsQuery.isLoading;
  const hasAttention = (analytics?.users.pending ?? 0) > 0 || (analytics?.quotes.pending ?? 0) > 0;
  const revenue = currencyFormat.format(Number(analytics?.orders.revenue ?? 0));
  const coverage = analytics?.products.imageCoveragePercent ?? 0;

  if (analyticsQuery.isError) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center rounded-2xl border border-[#FB7185]/25 bg-[#FB7185]/5 p-8 text-center">
        <div>
          <AlertTriangle className="mx-auto h-10 w-10 text-[#FB7185]" />
          <h1 className="mt-4 text-xl font-black uppercase text-white">Analytics unavailable</h1>
          <p className="mt-2 text-sm text-[#94A3B8]">The dashboard could not load the current overview.</p>
          <Button onClick={() => analyticsQuery.refetch()} className="mt-5 bg-[#0EA5E9] text-white hover:bg-[#0284C7]">Try again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      <header className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div className="min-w-0">
          <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#0EA5E9]">Operations overview</p>
          <h1 className="mt-2 text-3xl font-black uppercase tracking-[-0.05em] text-white sm:text-4xl">
            Gorilla Gear <span className="text-[#0EA5E9]">Control centre</span>
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[#94A3B8]">A live view of access approvals, catalogue health, quote activity, and order performance.</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <span className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.14em] text-[#64748B]">
            <CalendarDays className="h-4 w-4" />
            {analytics?.generatedAt ? `Updated ${formatDate(analytics.generatedAt)}` : "Loading snapshot"}
          </span>
          <Button
            variant="outline"
            onClick={() => analyticsQuery.refetch()}
            className="h-10 border-white/15 bg-white/5 text-xs font-black uppercase tracking-[0.12em] text-white hover:bg-white/10"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${analyticsQuery.isFetching ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Link href="/admin/orders" className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-[#E11D48] px-4 text-xs font-black uppercase tracking-[0.12em] text-white no-underline transition hover:bg-[#BE123C]">
            Review queue <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </header>

      {hasAttention && (
        <section className="flex flex-col gap-4 rounded-xl border border-[#E11D48]/35 bg-[#E11D48]/8 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5" aria-label="Items needing attention">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#E11D48]/15 text-[#FDA4AF]"><AlertTriangle className="h-5 w-5" /></span>
            <div>
              <p className="text-sm font-black uppercase tracking-wide text-white">Action required</p>
              <p className="mt-1 text-xs leading-5 text-[#FDA4AF]">
                {(analytics?.users.pending ?? 0) > 0 ? `${analytics?.users.pending} access application${analytics?.users.pending === 1 ? "" : "s"} pending` : ""}
                {(analytics?.users.pending ?? 0) > 0 && (analytics?.quotes.pending ?? 0) > 0 ? " · " : ""}
                {(analytics?.quotes.pending ?? 0) > 0 ? `${analytics?.quotes.pending} quote request${analytics?.quotes.pending === 1 ? "" : "s"} pending` : ""}
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            {(analytics?.users.pending ?? 0) > 0 && <Link href="/admin/users" className="inline-flex min-h-10 items-center justify-center rounded-md border border-[#E11D48]/40 px-4 text-xs font-black uppercase tracking-wide text-[#FDA4AF] no-underline hover:bg-[#E11D48]/10">Review applications</Link>}
            {(analytics?.quotes.pending ?? 0) > 0 && <Link href="/admin/orders" className="inline-flex min-h-10 items-center justify-center rounded-md bg-[#E11D48] px-4 text-xs font-black uppercase tracking-wide text-white no-underline hover:bg-[#BE123C]">Review quotes</Link>}
          </div>
        </section>
      )}

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Key metrics">
        <MetricCard label="Total users" value={isLoading ? "—" : numberFormat.format(analytics?.users.total ?? 0)} detail={`${numberFormat.format(analytics?.users.newLast30Days ?? 0)} joined in 30 days`} icon={Users} accent="#0EA5E9" />
        <MetricCard label="Pending approvals" value={isLoading ? "—" : numberFormat.format(analytics?.users.pending ?? 0)} detail={`${numberFormat.format(analytics?.users.approved ?? 0)} approved members`} icon={Clock} accent="#FBBF24" />
        <MetricCard label="Quote requests" value={isLoading ? "—" : numberFormat.format(analytics?.quotes.total ?? 0)} detail={`${numberFormat.format(analytics?.quotes.pending ?? 0)} awaiting review`} icon={BarChart3} accent="#E11D48" />
        <MetricCard label="Paid revenue" value={isLoading ? "—" : revenue} detail={`${numberFormat.format(analytics?.orders.paid ?? 0)} paid orders`} icon={CircleDollarSign} accent="#34D399" />
      </section>

      <section className="grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(280px,0.65fr)]">
        <article className="min-w-0 rounded-xl border border-white/10 bg-[#111111] p-4 shadow-[0_16px_40px_rgba(0,0,0,0.16)] sm:p-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#0EA5E9]">Order pipeline</p>
              <h2 className="mt-2 text-xl font-black uppercase tracking-[-0.04em] text-white">Where work is moving</h2>
            </div>
            <span className="text-xs text-[#64748B]">Quote and fulfilment stages</span>
          </div>
          <div className="mt-6 h-[250px] min-w-0">
            {isLoading ? (
              <div className="h-full animate-pulse rounded-lg bg-white/5" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={pipelineData} margin={{ top: 8, right: 8, left: -18, bottom: 12 }}>
                  <CartesianGrid stroke="rgba(148,163,184,0.12)" vertical={false} />
                  <XAxis dataKey="name" angle={-18} textAnchor="end" height={55} tick={{ fill: "#94A3B8", fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis allowDecimals={false} tick={{ fill: "#64748B", fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: "#0F172A", border: "1px solid rgba(148,163,184,0.2)", borderRadius: 8, color: "#F8FAFC" }} cursor={{ fill: "rgba(14,165,233,0.06)" }} />
                  <Bar dataKey="value" radius={[5, 5, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </article>

        <article className="rounded-xl border border-white/10 bg-[#111111] p-4 shadow-[0_16px_40px_rgba(0,0,0,0.16)] sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#10B981]">Catalogue health</p>
              <h2 className="mt-2 text-xl font-black uppercase tracking-[-0.04em] text-white">Ready to sell</h2>
            </div>
            <Package className="h-5 w-5 text-[#10B981]" />
          </div>
          <div className="mt-6 flex items-end justify-between gap-4">
            <div>
              <p className="text-4xl font-black tracking-[-0.06em] text-white">{isLoading ? "—" : `${coverage}%`}</p>
              <p className="mt-1 text-xs text-[#94A3B8]">Image coverage of active products</p>
            </div>
            <div className="relative flex h-16 w-16 items-center justify-center rounded-full border-4 border-[#1E293B]" style={{ background: `conic-gradient(#10B981 ${coverage}%, #1E293B 0)` }}>
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#111111] text-xs font-black text-white">{isLoading ? "—" : `${Math.round(coverage)}%`}</div>
            </div>
          </div>
          <div className="mt-7 space-y-4">
            <ProgressRow label="Products with images" value={analytics?.products.withImages ?? 0} total={analytics?.products.active ?? 0} color="#10B981" />
            <ProgressRow label="Missing images" value={analytics?.products.missingImages ?? 0} total={analytics?.products.active ?? 0} color="#E11D48" />
          </div>
          <div className="mt-6 grid grid-cols-2 gap-3 border-t border-white/10 pt-5">
            <div><p className="text-[10px] uppercase tracking-wider text-[#64748B]">Active products</p><p className="mt-1 text-lg font-black text-white">{numberFormat.format(analytics?.products.active ?? 0)}</p></div>
            <div><p className="text-[10px] uppercase tracking-wider text-[#64748B]">Categories</p><p className="mt-1 text-lg font-black text-white">{numberFormat.format(analytics?.products.categories ?? 0)}</p></div>
          </div>
          {(analytics?.products.missingImages ?? 0) > 0 && <Link href="/admin/bulk-images" className="mt-5 inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.12em] text-[#E11D48] no-underline hover:text-[#FB7185]">Manage image backlog <ArrowRight className="h-4 w-4" /></Link>}
        </article>
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <article className="rounded-xl border border-white/10 bg-[#111111] p-4 shadow-[0_16px_40px_rgba(0,0,0,0.16)] sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div><p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#FBBF24]">Access funnel</p><h2 className="mt-2 text-xl font-black uppercase tracking-[-0.04em] text-white">Member approvals</h2></div>
            <UserPlus className="h-5 w-5 text-[#FBBF24]" />
          </div>
          <div className="mt-6 space-y-5">
            <ProgressRow label="Pending review" value={analytics?.users.pending ?? 0} total={analytics?.users.total ?? 0} color="#FBBF24" />
            <ProgressRow label="Approved" value={analytics?.users.approved ?? 0} total={analytics?.users.total ?? 0} color="#34D399" />
            <ProgressRow label="Rejected" value={analytics?.users.rejected ?? 0} total={analytics?.users.total ?? 0} color="#FB7185" />
          </div>
          <div className="mt-7 flex flex-col gap-3 border-t border-white/10 pt-5 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-xs text-[#94A3B8]">New members in the last 30 days</span>
            <span className="text-lg font-black text-white">{numberFormat.format(analytics?.users.newLast30Days ?? 0)}</span>
          </div>
        </article>

        <article className="rounded-xl border border-white/10 bg-[#111111] p-4 shadow-[0_16px_40px_rgba(0,0,0,0.16)] sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div><p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#60A5FA]">Commercial snapshot</p><h2 className="mt-2 text-xl font-black uppercase tracking-[-0.04em] text-white">Order health</h2></div>
            <ShoppingBag className="h-5 w-5 text-[#60A5FA]" />
          </div>
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              ["Total", analytics?.orders.total ?? 0],
              ["Paid", analytics?.orders.paid ?? 0],
              ["Processing", analytics?.orders.processing ?? 0],
              ["Completed", analytics?.orders.completed ?? 0],
            ].map(([label, value]) => <div key={String(label)} className="rounded-lg border border-white/8 bg-white/[0.03] p-3"><p className="text-[10px] uppercase tracking-wider text-[#64748B]">{label}</p><p className="mt-2 text-2xl font-black text-white">{numberFormat.format(Number(value))}</p></div>)}
          </div>
          <div className="mt-6 grid gap-3 border-t border-white/10 pt-5 sm:grid-cols-2">
            <div><p className="text-[10px] uppercase tracking-wider text-[#64748B]">Average paid order</p><p className="mt-1 text-lg font-black text-[#34D399]">{currencyFormat.format(Number(analytics?.orders.averagePaidOrderValue ?? 0))}</p></div>
            <div><p className="text-[10px] uppercase tracking-wider text-[#64748B]">Awaiting payment</p><p className="mt-1 text-lg font-black text-[#A78BFA]">{numberFormat.format(analytics?.quotes.awaitingPayment ?? 0)}</p></div>
          </div>
        </article>
      </section>

      <section className="grid gap-5 xl:grid-cols-2">
        <article className="rounded-xl border border-white/10 bg-[#111111] p-4 shadow-[0_16px_40px_rgba(0,0,0,0.16)] sm:p-6">
          <div className="flex items-start justify-between gap-3"><div><p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#94A3B8]">Latest applicants</p><h2 className="mt-2 text-xl font-black uppercase tracking-[-0.04em] text-white">Recent access activity</h2></div><Link href="/admin/users" className="text-xs font-black uppercase tracking-wide text-[#0EA5E9] no-underline">View all</Link></div>
          <div className="mt-5 divide-y divide-white/8">
            {analytics?.recentUsers?.length ? analytics.recentUsers.map((person) => <div key={person.id} className="flex items-center justify-between gap-3 py-3"><div className="flex min-w-0 items-center gap-3"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#0EA5E9]/12 text-xs font-black text-[#7DD3FC]">{person.fullName.slice(0, 1).toUpperCase()}</span><div className="min-w-0"><p className="truncate text-sm font-bold text-white">{person.fullName}</p><p className="text-xs text-[#64748B]">{formatDate(person.createdAt)}</p></div></div><span className="shrink-0 rounded-full px-2 py-1 text-[10px] font-black uppercase tracking-wide" style={{ backgroundColor: `${statusColors[person.status] ?? "#94A3B8"}18`, color: statusColors[person.status] ?? "#94A3B8" }}>{formatStatus(person.status)}</span></div>) : <div className="flex flex-col items-center justify-center py-10 text-center"><Users className="h-8 w-8 text-[#64748B]" /><p className="mt-3 text-sm text-[#94A3B8]">No applicants yet.</p></div>}
          </div>
        </article>

        <article className="rounded-xl border border-white/10 bg-[#111111] p-4 shadow-[0_16px_40px_rgba(0,0,0,0.16)] sm:p-6">
          <div className="flex items-start justify-between gap-3"><div><p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#94A3B8]">Latest orders</p><h2 className="mt-2 text-xl font-black uppercase tracking-[-0.04em] text-white">Recent commercial activity</h2></div><Link href="/admin/orders" className="text-xs font-black uppercase tracking-wide text-[#0EA5E9] no-underline">View all</Link></div>
          <div className="mt-5 divide-y divide-white/8">
            {analytics?.recentOrders?.length ? analytics.recentOrders.map((order) => <div key={order.id} className="flex items-center justify-between gap-3 py-3"><div className="flex min-w-0 items-center gap-3"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#E11D48]/12 text-[#FDA4AF]"><TrendingUp className="h-4 w-4" /></span><div className="min-w-0"><p className="truncate text-sm font-bold text-white">#{order.id} · {order.userFullName}</p><p className="text-xs text-[#64748B]">{formatDate(order.createdAt)} · {currencyFormat.format(Number(order.totalAmount))}</p></div></div><span className="shrink-0 rounded-full px-2 py-1 text-[10px] font-black uppercase tracking-wide" style={{ backgroundColor: `${statusColors[order.status] ?? "#94A3B8"}18`, color: statusColors[order.status] ?? "#94A3B8" }}>{formatStatus(order.status)}</span></div>) : <div className="flex flex-col items-center justify-center py-10 text-center"><ShoppingBag className="h-8 w-8 text-[#64748B]" /><p className="mt-3 text-sm text-[#94A3B8]">No orders yet.</p></div>}
          </div>
        </article>
      </section>

      <section className="flex flex-col gap-4 rounded-xl border border-white/10 bg-gradient-to-r from-[#111111] to-[#0F172A] p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div className="flex items-start gap-3"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#0EA5E9]/12 text-[#7DD3FC]"><ImageOff className="h-5 w-5" /></div><div><p className="text-sm font-black uppercase tracking-wide text-white">Keep the catalogue presentation strong</p><p className="mt-1 text-xs leading-5 text-[#94A3B8]">{numberFormat.format(analytics?.products.missingImages ?? 0)} active products still need image coverage.</p></div></div><Link href="/admin/bulk-images" className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-[#0EA5E9]/40 px-4 text-xs font-black uppercase tracking-wide text-[#7DD3FC] no-underline hover:bg-[#0EA5E9]/10">Open image manager <ArrowRight className="h-4 w-4" /></Link>
      </section>
    </div>
  );
}
