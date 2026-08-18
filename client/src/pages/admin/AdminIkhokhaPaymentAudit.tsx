import React, { useMemo, useState } from "react";
import { Link } from "wouter";
import { AlertTriangle, CheckCircle2, Clock3, CreditCard, ExternalLink, Link2, RefreshCw, XCircle } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";

type AttemptStatus = "link_created" | "pending" | "paid" | "failed" | "link_failed";

type PaymentAttempt = {
  id: number;
  orderId: number;
  externalReference: string;
  paylinkId: string | null;
  amountCents: number;
  status: AttemptStatus;
  gatewayStatus: string | null;
  failureReason: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
  completedAt: Date | string | null;
  orderStatus: string;
  paymentStatus: string;
  customerName: string;
  customerEmail: string;
};

const statusMeta: Record<AttemptStatus, { label: string; className: string; icon: typeof Clock3 }> = {
  link_created: { label: "Link created", className: "border-[#a8751c]/35 bg-[#f6f0e4] text-[#7c5a20]", icon: Link2 },
  pending: { label: "Awaiting payment", className: "border-[#a8751c]/35 bg-[#f6f0e4] text-[#7c5a20]", icon: Clock3 },
  paid: { label: "Paid", className: "border-[#1f7a45]/25 bg-[#1f7a45]/10 text-[#1f7a45]", icon: CheckCircle2 },
  failed: { label: "Failed", className: "border-[#b42318]/25 bg-[#b42318]/5 text-[#b42318]", icon: XCircle },
  link_failed: { label: "Link generation failed", className: "border-[#b42318]/25 bg-[#b42318]/5 text-[#b42318]", icon: AlertTriangle },
};

function formatDate(value: Date | string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

function formatMoney(cents: number) {
  return new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR" }).format(cents / 100);
}

export default function AdminIkhokhaPaymentAudit() {
  const [status, setStatus] = useState<"all" | AttemptStatus>("all");
  const [search, setSearch] = useState("");
  const query = trpc.admin.ikhokhaPaymentAudit.useQuery(undefined, { refetchInterval: 30_000 });
  const attempts = (query.data ?? []) as PaymentAttempt[];

  const filteredAttempts = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return attempts.filter((attempt) => {
      if (status !== "all" && attempt.status !== status) return false;
      if (!needle) return true;
      return [attempt.externalReference, attempt.paylinkId, attempt.customerName, attempt.customerEmail, attempt.gatewayStatus, attempt.failureReason, `#${attempt.orderId}`]
        .some((value) => value?.toLowerCase().includes(needle));
    });
  }, [attempts, search, status]);

  const summary = useMemo(() => ({
    total: attempts.length,
    awaiting: attempts.filter((attempt) => ["link_created", "pending"].includes(attempt.status)).length,
    paid: attempts.filter((attempt) => attempt.status === "paid").length,
    exceptions: attempts.filter((attempt) => ["failed", "link_failed"].includes(attempt.status)).length,
  }), [attempts]);

  return (
    <div className="space-y-6 text-[#1f1f1f]">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.22em] text-[#a8751c]"><CreditCard className="h-4 w-4" /> Payments / iKhokha</div>
          <h1 className="text-3xl font-black uppercase tracking-tight md:text-4xl">Payment-attempt audit</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#6b665e]">Review secure iKhokha hosted-link generation and callback outcomes. Customer payment links are not exposed from this screen.</p>
        </div>
        <Button type="button" variant="outline" onClick={() => query.refetch()} disabled={query.isFetching} className="min-h-11 border-[#d5c7b0] bg-white text-[#454545] hover:border-[#a8751c] hover:bg-[#f6f0e4] hover:text-[#1f1f1f]"><RefreshCw className={`mr-2 h-4 w-4 ${query.isFetching ? "animate-spin" : ""}`} />Refresh attempts</Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "All attempts", value: summary.total, color: "#454545", icon: CreditCard },
          { label: "Awaiting payment", value: summary.awaiting, color: "#a8751c", icon: Clock3 },
          { label: "Paid", value: summary.paid, color: "#1f7a45", icon: CheckCircle2 },
          { label: "Exceptions", value: summary.exceptions, color: "#b42318", icon: AlertTriangle },
        ].map((item) => {
          const Icon = item.icon;
          return <div key={item.label} className="rounded-xl border border-[#e5dfd4] bg-white p-4 shadow-[0_10px_25px_rgba(69,69,69,0.05)]"><div className="flex items-center justify-between"><span className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#6b665e]">{item.label}</span><Icon className="h-4 w-4" style={{ color: item.color }} /></div><p className="mt-3 text-3xl font-black" style={{ color: item.color }}>{item.value}</p></div>;
        })}
      </div>

      <div className="rounded-xl border border-[#e5dfd4] bg-white p-4 shadow-[0_10px_25px_rgba(69,69,69,0.05)] md:p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3"><label className="text-xs font-bold uppercase tracking-widest text-[#6b665e]" htmlFor="ikhokha-status-filter">Status</label><select id="ikhokha-status-filter" aria-label="Filter payment attempts" value={status} onChange={(event) => setStatus(event.target.value as "all" | AttemptStatus)} className="min-h-11 rounded-lg border border-[#d5c7b0] bg-white px-3 text-sm text-[#1f1f1f] outline-none focus:border-[#a8751c]"><option value="all">All statuses</option>{Object.entries(statusMeta).map(([value, meta]) => <option key={value} value={value}>{meta.label}</option>)}</select></div>
          <input value={search} onChange={(event) => setSearch(event.target.value)} aria-label="Search payment attempts" placeholder="Search customer, order or reference" className="min-h-11 w-full rounded-lg border border-[#d5c7b0] bg-white px-3 text-sm text-[#1f1f1f] placeholder:text-[#9a948a] outline-none focus:border-[#a8751c] lg:max-w-sm" />
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-[#e5dfd4] bg-white shadow-[0_10px_25px_rgba(69,69,69,0.05)]">
        <div className="hidden grid-cols-[1.1fr_1.2fr_0.95fr_0.95fr_0.9fr] gap-4 border-b border-[#e5dfd4] px-5 py-3 text-[10px] font-bold uppercase tracking-[0.18em] text-[#6b665e] lg:grid"><span>Order / customer</span><span>iKhokha reference</span><span>Amount / status</span><span>Gateway detail</span><span>Created</span></div>
        {query.isLoading ? <div className="p-8 text-center text-sm text-[#6b665e]">Loading payment attempts…</div> : filteredAttempts.length === 0 ? <div className="p-10 text-center"><CreditCard className="mx-auto mb-3 h-8 w-8 text-[#d5c7b0]" /><p className="text-sm font-bold text-[#454545]">No payment attempts found</p><p className="mt-1 text-xs text-[#6b665e]">A record appears when an approved quote requests an iKhokha payment link.</p></div> : <div className="divide-y divide-[#e5dfd4]">{filteredAttempts.map((attempt) => {
          const meta = statusMeta[attempt.status]; const Icon = meta.icon;
          return <div key={attempt.id} className="grid gap-3 px-4 py-4 lg:grid-cols-[1.1fr_1.2fr_0.95fr_0.95fr_0.9fr] lg:items-center lg:gap-4 lg:px-5"><div><Link href={`/admin/orders/${attempt.orderId}`} className="inline-flex items-center gap-1 text-sm font-black text-[#1f1f1f] no-underline hover:text-[#a8751c]">Order #{attempt.orderId}<ExternalLink className="h-3.5 w-3.5" /></Link><p className="mt-1 text-xs font-medium text-[#454545]">{attempt.customerName}</p><p className="text-xs text-[#6b665e]">{attempt.customerEmail}</p></div><div className="min-w-0"><p className="font-mono text-xs font-bold text-[#454545] break-all">{attempt.externalReference}</p><p className="mt-1 text-[11px] text-[#6b665e]">Pay link ID: {attempt.paylinkId ? `${attempt.paylinkId.slice(0, 18)}…` : "Not created"}</p></div><div><p className="text-sm font-black text-[#1f1f1f]">{formatMoney(attempt.amountCents)}</p><span className={`mt-1 inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[10px] font-bold uppercase tracking-wide ${meta.className}`}><Icon className="h-3 w-3" />{meta.label}</span></div><div className="text-xs text-[#6b665e]"><p className="font-bold text-[#454545]">{attempt.gatewayStatus ?? "Awaiting gateway update"}</p>{attempt.failureReason && <p className="mt-1 leading-5 text-[#b42318]">{attempt.failureReason}</p>}<p className="mt-1">Order: {attempt.orderStatus.replaceAll("_", " ")} · Payment: {attempt.paymentStatus.replaceAll("_", " ")}</p></div><time className="text-xs text-[#6b665e]" dateTime={new Date(attempt.createdAt).toISOString()}>{formatDate(attempt.createdAt)}{attempt.completedAt && <span className="mt-1 block text-[11px] text-[#1f7a45]">Finalised {formatDate(attempt.completedAt)}</span>}</time></div>;
        })}</div>}
      </div>

      <div className="rounded-xl border border-[#a8751c]/25 bg-[#f6f0e4] p-4 text-xs leading-5 text-[#6b665e]"><strong className="text-[#7c5a20]">Audit scope:</strong> this view records internal iKhokha payment references, payment-link IDs, gateway status, and local order status. It deliberately does not show a customer’s hosted payment URL or payment credentials.</div>
    </div>
  );
}
