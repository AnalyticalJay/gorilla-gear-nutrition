import React from "react";
import { Activity, ArrowUpRight, CheckCircle2, Clock3, Package, XCircle } from "lucide-react";
import { Link } from "wouter";
import { format } from "date-fns";
import { buildOrderTimeline, type OrderTrackingInput } from "@shared/orderTracking";

export type CustomerOrderSummary = OrderTrackingInput & { id: number; totalAmount: string };
type OrderStatusSummaryCardProps = { orders: CustomerOrderSummary[]; isLoading?: boolean };

const statusLabels: Record<string, string> = { pending: "Pending review", quote_pending: "Quote under review", quote_approved: "Quote approved", quote_rejected: "Quote rejected", awaiting_payment: "Awaiting payment", paid: "Payment confirmed", processing: "Processing", shipped: "Shipped", completed: "Delivered", cancelled: "Cancelled" };
const terminalStatuses = new Set(["completed", "cancelled", "quote_rejected"]);

function statusIcon(status: string) {
  if (status === "completed") return CheckCircle2;
  if (status === "cancelled" || status === "quote_rejected") return XCircle;
  if (["awaiting_payment", "quote_pending", "pending"].includes(status)) return Clock3;
  return Activity;
}

export default function OrderStatusSummaryCard({ orders, isLoading = false }: OrderStatusSummaryCardProps) {
  if (isLoading) return <div className="rounded-xl border border-[#e5dfd4] bg-white p-4 shadow-[0_12px_30px_rgba(69,69,69,0.05)] sm:p-6" aria-label="Loading order status"><div className="h-3 w-32 animate-pulse rounded bg-[#eee9df]" /><div className="mt-4 h-16 animate-pulse rounded-lg bg-[#fcfbf8]" /></div>;
  if (orders.length === 0) return <section className="rounded-xl border border-[#e5dfd4] bg-white p-4 text-center shadow-[0_12px_30px_rgba(69,69,69,0.05)] sm:p-6 sm:text-left" aria-labelledby="order-status-summary-heading"><div className="flex flex-col items-center gap-3 sm:flex-row sm:items-start"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#a8751c]/25 bg-[#a8751c]/10 text-[#a8751c]"><Package className="h-5 w-5" /></span><div className="min-w-0"><p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#a8751c]">Order status</p><h2 id="order-status-summary-heading" className="mt-1 text-lg font-black text-[#1f1f1f]">No order activity yet</h2><p className="mt-1 text-xs leading-5 text-[#6b665e]">Your quote requests and delivery updates will appear here.</p></div></div><Link href="/products" className="mt-5 inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-[#a8751c] px-4 text-xs font-black uppercase tracking-wide text-[#1f1f1f] no-underline transition hover:bg-[#c89536]">Browse products <ArrowUpRight className="h-4 w-4" /></Link></section>;

  const sortedOrders = [...orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const latestOrder = sortedOrders.find((order) => !terminalStatuses.has(order.status)) ?? sortedOrders[0];
  const steps = buildOrderTimeline(latestOrder);
  const completedSteps = steps.filter((step) => step.completed).length;
  const progressPercent = Math.round((completedSteps / steps.length) * 100);
  const activeStep = steps.find((step) => step.active);
  const lastCompletedStep = [...steps].reverse().find((step) => step.completed);
  const currentLabel = statusLabels[latestOrder.status] ?? (activeStep ?? lastCompletedStep)?.label ?? latestOrder.status;
  const Icon = statusIcon(latestOrder.status);
  const openOrderCount = orders.filter((order) => !terminalStatuses.has(order.status)).length;

  return <section className="rounded-xl border border-[#e5dfd4] bg-white p-4 text-center shadow-[0_12px_30px_rgba(69,69,69,0.05)] sm:p-6 sm:text-left" aria-labelledby="order-status-summary-heading"><div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start sm:justify-between"><div className="flex min-w-0 flex-col items-center gap-3 sm:flex-row sm:items-start"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#a8751c]/25 bg-[#a8751c]/10 text-[#a8751c]"><Icon className="h-5 w-5" /></span><div className="min-w-0"><div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start"><p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#a8751c]">Order status</p>{openOrderCount > 0 && <span className="rounded-full border border-[#1f7a45]/25 bg-[#1f7a45]/10 px-2 py-1 text-[9px] font-black uppercase tracking-wider text-[#1f7a45]">{openOrderCount} active</span>}</div><h2 id="order-status-summary-heading" className="mt-1 text-lg font-black text-[#1f1f1f]">Quote #{latestOrder.id}</h2><p className="mt-1 text-xs leading-5 text-[#6b665e]">{currentLabel} · Updated from your order timeline.</p></div></div><Link href={`/orders/${latestOrder.id}`} className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-md border border-[#d5c7b0] px-3 text-xs font-black uppercase tracking-wide text-[#454545] no-underline transition hover:border-[#a8751c] hover:bg-[#f6f0e4] hover:text-[#1f1f1f]">View tracking <ArrowUpRight className="h-4 w-4" /></Link></div><div className="mt-5 rounded-lg border border-[#e5dfd4] bg-[#fcfbf8] p-3 sm:p-4"><div className="flex flex-col items-center justify-center gap-1 text-center sm:flex-row sm:flex-wrap sm:justify-between sm:gap-2 sm:text-left"><div className="flex flex-wrap items-center justify-center gap-2 text-xs text-[#454545] sm:justify-start"><span className="font-bold text-[#1f1f1f]">{statusLabels[latestOrder.status] ?? latestOrder.status.replaceAll("_", " ")}</span><span className="text-[#bdb5a8]">·</span><span>{format(new Date(latestOrder.createdAt), "d MMM yyyy")}</span></div><span className="font-black text-[#1f1f1f]">R{parseFloat(latestOrder.totalAmount).toFixed(2)}</span></div><div className="mt-4 h-2 overflow-hidden rounded-full bg-[#eee9df]" role="progressbar" aria-label={`Quote ${latestOrder.id} order progress`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={progressPercent}><span className="block h-full rounded-full bg-[#a8751c] transition-[width] duration-500" style={{ width: `${progressPercent}%` }} /></div><div className="mt-2 flex items-center justify-between text-[9px] font-black uppercase tracking-[0.12em] text-[#6b665e]"><span>Placed</span><span>{progressPercent}% complete</span><span>Delivered</span></div></div></section>;
}
