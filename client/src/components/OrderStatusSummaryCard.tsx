import React from "react";
import { Activity, ArrowUpRight, CheckCircle2, Clock3, Package, XCircle } from "lucide-react";
import { Link } from "wouter";
import { format } from "date-fns";
import { buildOrderTimeline, type OrderTrackingInput } from "@shared/orderTracking";

export type CustomerOrderSummary = OrderTrackingInput & {
  id: number;
  totalAmount: string;
};

type OrderStatusSummaryCardProps = {
  orders: CustomerOrderSummary[];
  isLoading?: boolean;
};

const statusLabels: Record<string, string> = {
  pending: "Pending review",
  quote_pending: "Quote under review",
  quote_approved: "Quote approved",
  quote_rejected: "Quote rejected",
  awaiting_payment: "Awaiting payment",
  paid: "Payment confirmed",
  processing: "Processing",
  shipped: "Shipped",
  completed: "Delivered",
  cancelled: "Cancelled",
};

const terminalStatuses = new Set(["completed", "cancelled", "quote_rejected"]);

function statusIcon(status: string) {
  if (status === "completed") return CheckCircle2;
  if (status === "cancelled" || status === "quote_rejected") return XCircle;
  if (status === "awaiting_payment" || status === "quote_pending" || status === "pending") return Clock3;
  return Activity;
}

export default function OrderStatusSummaryCard({ orders, isLoading = false }: OrderStatusSummaryCardProps) {
  if (isLoading) {
    return <div className="rounded-xl border border-[#1E293B] bg-[#111111] p-4 sm:p-6" aria-label="Loading order status"><div className="h-3 w-32 animate-pulse rounded bg-[#1E293B]" /><div className="mt-4 h-16 animate-pulse rounded-lg bg-[#0A0A0A]" /></div>;
  }

  if (orders.length === 0) {
    return (
      <section className="rounded-xl border border-[#1E293B] bg-[#111111] p-4 sm:p-6" aria-labelledby="order-status-summary-heading">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#0EA5E9]/25 bg-[#0EA5E9]/10 text-[#38BDF8]"><Package className="h-5 w-5" /></span>
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#0EA5E9]">Order status</p>
            <h2 id="order-status-summary-heading" className="mt-1 text-lg font-black text-white">No order activity yet</h2>
            <p className="mt-1 text-xs leading-5 text-[#94A3B8]">Your quote requests and delivery updates will appear here.</p>
          </div>
        </div>
        <Link href="/products" className="mt-5 inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-[#0EA5E9] px-4 text-xs font-black uppercase tracking-wide text-white no-underline transition hover:bg-[#0284C7]">Browse products <ArrowUpRight className="h-4 w-4" /></Link>
      </section>
    );
  }

  const latestOrder = [...orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).find((order) => !terminalStatuses.has(order.status)) ?? [...orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
  const steps = buildOrderTimeline(latestOrder);
  const completedSteps = steps.filter((step) => step.completed).length;
  const progressPercent = Math.round((completedSteps / steps.length) * 100);
  const activeStep = steps.find((step) => step.active);
  const lastCompletedStep = [...steps].reverse().find((step) => step.completed);
  const currentLabel = statusLabels[latestOrder.status] ?? (activeStep ?? lastCompletedStep)?.label ?? latestOrder.status;
  const Icon = statusIcon(latestOrder.status);
  const openOrderCount = orders.filter((order) => !terminalStatuses.has(order.status)).length;

  return (
    <section className="rounded-xl border border-[#1E293B] bg-[#111111] p-4 sm:p-6" aria-labelledby="order-status-summary-heading">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#0EA5E9]/25 bg-[#0EA5E9]/10 text-[#38BDF8]"><Icon className="h-5 w-5" /></span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#0EA5E9]">Order status</p>
              {openOrderCount > 0 && <span className="rounded-full border border-[#34D399]/25 bg-[#34D399]/10 px-2 py-1 text-[9px] font-black uppercase tracking-wider text-[#6EE7B7]">{openOrderCount} active</span>}
            </div>
            <h2 id="order-status-summary-heading" className="mt-1 text-lg font-black text-white">Quote #{latestOrder.id}</h2>
            <p className="mt-1 text-xs leading-5 text-[#94A3B8]">{currentLabel} · Updated from your order timeline.</p>
          </div>
        </div>
        <Link href={`/orders/${latestOrder.id}`} className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-md border border-[#334155] px-3 text-xs font-black uppercase tracking-wide text-[#CBD5E1] no-underline transition hover:border-[#0EA5E9]/60 hover:text-white">View tracking <ArrowUpRight className="h-4 w-4" /></Link>
      </div>

      <div className="mt-5 rounded-lg border border-[#1E293B] bg-[#0A0A0A] p-3 sm:p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2 text-xs text-[#CBD5E1]"><span className="font-bold text-white">{statusLabels[latestOrder.status] ?? latestOrder.status.replaceAll("_", " ")}</span><span className="text-[#475569]">·</span><span>{format(new Date(latestOrder.createdAt), "d MMM yyyy")}</span></div>
          <span className="font-black text-white">R{parseFloat(latestOrder.totalAmount).toFixed(2)}</span>
        </div>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#1E293B]" role="progressbar" aria-label={`Quote ${latestOrder.id} order progress`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={progressPercent}><span className="block h-full rounded-full bg-[#0EA5E9] transition-[width] duration-500" style={{ width: `${progressPercent}%` }} /></div>
        <div className="mt-2 flex items-center justify-between text-[9px] font-black uppercase tracking-[0.12em] text-[#64748B]"><span>Placed</span><span>{progressPercent}% complete</span><span>Delivered</span></div>
      </div>
    </section>
  );
}
