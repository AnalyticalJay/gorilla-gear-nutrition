import React from "react";
import { CheckCircle2, ClipboardCheck, CreditCard, PackageCheck, ShoppingBag, Truck } from "lucide-react";
import { format } from "date-fns";
import { buildOrderTimeline, getTrackingUrl, isOrderDispatched, type OrderTrackingInput } from "@shared/orderTracking";

const icons = {
  placed: ShoppingBag,
  reviewed: ClipboardCheck,
  paid: CreditCard,
  dispatched: Truck,
  delivered: PackageCheck,
};

export default function OrderTrackingTimeline({ order, compact = false }: { order: OrderTrackingInput; compact?: boolean }) {
  const steps = buildOrderTimeline(order);
  const isDispatched = isOrderDispatched(order);
  const trackingUrl = getTrackingUrl(order.trackingCarrier, order.trackingNumber, order.trackingUrl);

  return (
    <section className={`rounded-xl border border-[#1E293B] bg-[#111111] ${compact ? "p-4" : "p-5 sm:p-6"}`} aria-label="Order tracking timeline">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#0EA5E9]">Shipment progress</p>
          <h2 className="mt-2 text-xl font-black uppercase tracking-tight text-white">Track your order</h2>
          <p className="mt-1 text-xs leading-5 text-[#94A3B8]">Follow your order from placement through final delivery.</p>
        </div>
        {order.trackingNumber && (
          <div className="rounded-lg border border-[#0EA5E9]/25 bg-[#0EA5E9]/8 px-3 py-2 sm:text-right">
            <p className="text-[10px] font-black uppercase tracking-wider text-[#64748B]">Tracking number</p>
            <p className="mt-1 break-all font-mono text-sm font-bold text-[#7DD3FC]">{order.trackingNumber}</p>
            {order.trackingCarrier && <p className="mt-1 text-[10px] uppercase tracking-wider text-[#94A3B8]">{order.trackingCarrier}</p>}
            {!isDispatched && <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-[#FBBF24]">Dispatch pending</p>}
          </div>
        )}
      </div>

      <div className="mt-7">
        <ol className="relative space-y-0">
          {steps.map((step, index) => {
            const Icon = icons[step.key];
            const isLast = index === steps.length - 1;
            const stepColor = step.completed ? "#34D399" : step.active ? "#0EA5E9" : "#475569";
            return (
              <li key={step.key} className="relative flex gap-4 pb-6 last:pb-0">
                {!isLast && <span className="absolute left-[15px] top-8 h-[calc(100%-1.25rem)] w-px" style={{ backgroundColor: step.completed ? "#34D39966" : "#334155" }} aria-hidden="true" />}
                <span className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border" style={{ borderColor: `${stepColor}66`, backgroundColor: `${stepColor}18`, color: stepColor }}>
                  {step.completed ? <CheckCircle2 className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                </span>
                <div className="min-w-0 flex-1 pt-0.5">
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                    <p className={`text-sm font-black ${step.completed || step.active ? "text-white" : "text-[#64748B]"}`}>{step.label}</p>
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
