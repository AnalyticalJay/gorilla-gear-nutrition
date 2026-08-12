import React from "react";
import {
  Activity,
  CheckCircle2,
  ClipboardCheck,
  CreditCard,
  PackageCheck,
  RefreshCw,
  ShoppingBag,
  Truck,
} from "lucide-react";
import { format } from "date-fns";
import { buildOrderTimeline, getTrackingUrl, isOrderDispatched, type OrderTrackingInput } from "@shared/orderTracking";

const icons = {
  placed: ShoppingBag,
  reviewed: ClipboardCheck,
  paid: CreditCard,
  dispatched: Truck,
  delivered: PackageCheck,
};

type OrderTrackingTimelineProps = {
  order: OrderTrackingInput;
  compact?: boolean;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  lastUpdatedAt?: number;
};

export default function OrderTrackingTimeline({
  order,
  compact = false,
  onRefresh,
  isRefreshing = false,
  lastUpdatedAt,
}: OrderTrackingTimelineProps) {
  const steps = buildOrderTimeline(order);
  const isDispatched = isOrderDispatched(order);
  const trackingUrl = getTrackingUrl(order.trackingCarrier, order.trackingNumber, order.trackingUrl);
  const completedSteps = steps.filter((step) => step.completed).length;
  const progressPercent = Math.round((completedSteps / steps.length) * 100);
  const activeStep = steps.find((step) => step.active);
  const lastCompletedStep = [...steps].reverse().find((step) => step.completed);
  const displayedStep = activeStep ?? lastCompletedStep ?? steps[0];
  const isException = order.status === "quote_rejected" || order.status === "cancelled";
  const statusTitle = order.status === "quote_rejected"
    ? "Quote not approved"
    : order.status === "cancelled"
      ? "Order cancelled"
      : displayedStep.label;
  const statusDescription = isException
    ? order.status === "quote_rejected"
      ? "Your request stopped during quote review. Check the review notes for next steps."
      : "This order is no longer moving through the delivery workflow."
    : displayedStep.description;
  const progressColor = isException ? "#F97316" : "#0EA5E9";

  return (
    <section className={`rounded-xl border border-[#1E293B] bg-[#111111] ${compact ? "p-4" : "p-5 sm:p-6"}`} aria-label="Order tracking timeline">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#0EA5E9]">Shipment progress</p>
            {!isException && <span className="inline-flex items-center gap-1.5 rounded-full border border-[#34D399]/25 bg-[#34D399]/10 px-2 py-1 text-[9px] font-black uppercase tracking-[0.16em] text-[#6EE7B7]"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#34D399]" /> Live status</span>}
          </div>
          <h2 className="mt-2 text-xl font-black uppercase tracking-tight text-white">Track your order</h2>
          <p className="mt-1 text-xs leading-5 text-[#94A3B8]">Follow your order from placement through final delivery.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:justify-end">
          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              disabled={isRefreshing}
              aria-label="Refresh order status"
              className="inline-flex min-h-9 items-center gap-2 rounded-md border border-[#334155] px-3 text-[10px] font-black uppercase tracking-wider text-[#CBD5E1] transition hover:border-[#0EA5E9]/60 hover:text-white disabled:cursor-wait disabled:opacity-60"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
              <span>{isRefreshing ? "Refreshing" : "Refresh status"}</span>
            </button>
          )}
          {order.trackingNumber && (
            <div className="rounded-lg border border-[#0EA5E9]/25 bg-[#0EA5E9]/8 px-3 py-2 sm:text-right">
              <p className="text-[10px] font-black uppercase tracking-wider text-[#64748B]">Tracking number</p>
              <p className="mt-1 break-all font-mono text-sm font-bold text-[#7DD3FC]">{order.trackingNumber}</p>
              {order.trackingCarrier && <p className="mt-1 text-[10px] uppercase tracking-wider text-[#94A3B8]">{order.trackingCarrier}</p>}
              {!isDispatched && <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-[#FBBF24]">Dispatch pending</p>}
            </div>
          )}
        </div>
      </div>

      <div className="mt-5 rounded-xl border border-[#1E293B] bg-[#0B0B0B] p-4" aria-label="Order status summary">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border" style={{ borderColor: `${progressColor}66`, backgroundColor: `${progressColor}18`, color: progressColor }}>
              <Activity className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#64748B]">Current status</p>
              <p className="mt-1 truncate text-sm font-black text-white">{statusTitle}</p>
            </div>
          </div>
          <span className="shrink-0 text-[10px] font-black uppercase tracking-wider text-[#94A3B8]">{completedSteps}/{steps.length} complete</span>
        </div>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#1E293B]" role="progressbar" aria-label={`${statusTitle} order progress`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={progressPercent}>
          <span className="block h-full rounded-full transition-[width] duration-500" style={{ width: `${progressPercent}%`, backgroundColor: progressColor }} />
        </div>
        <div className="mt-2 flex items-center justify-between gap-2 text-[9px] font-black uppercase tracking-[0.12em] text-[#64748B]">
          <span>Placed</span>
          <span>{progressPercent}% complete</span>
          <span>Delivered</span>
        </div>
        <p className={`mt-3 text-xs leading-5 ${isException ? "text-[#FDBA74]" : "text-[#94A3B8]"}`}>{statusDescription}</p>
        {lastUpdatedAt && <p className="mt-2 text-[10px] uppercase tracking-wider text-[#475569]">Last checked {format(new Date(lastUpdatedAt), "d MMM yyyy, HH:mm")}</p>}
      </div>

      <div className="mt-7">
        <ol className="relative space-y-0">
          {steps.map((step, index) => {
            const Icon = icons[step.key];
            const isLast = index === steps.length - 1;
            const stepColor = step.completed ? "#34D399" : step.active ? "#0EA5E9" : "#475569";
            return (
              <li key={step.key} data-state={step.completed ? "complete" : step.active ? "current" : "upcoming"} className="relative flex gap-4 pb-6 last:pb-0" aria-current={step.active ? "step" : undefined}>
                {!isLast && <span className="absolute left-[15px] top-8 h-[calc(100%-1.25rem)] w-px" style={{ backgroundColor: step.completed ? "#34D39966" : "#334155" }} aria-hidden="true" />}
                <span className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border" style={{ borderColor: `${stepColor}66`, backgroundColor: `${stepColor}18`, color: stepColor }}>
                  {step.completed ? <CheckCircle2 className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                </span>
                <div className="min-w-0 flex-1 pt-0.5">
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className={`text-sm font-black ${step.completed || step.active ? "text-white" : "text-[#64748B]"}`}>{step.label}</p>
                      {step.active && <span className="rounded-full border border-[#0EA5E9]/30 bg-[#0EA5E9]/10 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-[#7DD3FC]">Current</span>}
                    </div>
                    {step.timestamp && <time className="shrink-0 text-[10px] uppercase tracking-wider text-[#64748B]" dateTime={new Date(step.timestamp).toISOString()}>{format(new Date(step.timestamp), "d MMM yyyy, HH:mm")}</time>}
                  </div>
                  <p className={`mt-1 text-xs leading-5 ${step.completed || step.active ? "text-[#94A3B8]" : "text-[#475569]"}`}>{step.description}</p>
                </div>
              </li>
            );
          })}
        </ol>
      </div>

      {order.trackingNotes && <div className="mt-6 rounded-lg border border-[#FBBF24]/20 bg-[#FBBF24]/5 p-3 text-xs leading-5 text-[#FDE68A]"><span className="font-black uppercase tracking-wider">Courier note: </span>{order.trackingNotes}</div>}

      {order.trackingNumber && isDispatched && trackingUrl && (
        <div className="mt-6 flex flex-col gap-3 border-t border-[#1E293B] pt-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs leading-5 text-[#94A3B8]">Use the courier link for the latest parcel scans and delivery events.</p>
          <a href={trackingUrl} target="_blank" rel="noreferrer" className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-[#0EA5E9] px-4 text-xs font-black uppercase tracking-wide text-white no-underline transition hover:bg-[#0284C7]">
            <Truck className="h-4 w-4" /> Track with courier
          </a>
        </div>
      )}
    </section>
  );
}
