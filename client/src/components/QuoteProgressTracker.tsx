import { BadgeCheck, Check, CheckCircle2, ClipboardList, CreditCard, SearchCheck, XCircle } from "lucide-react";
import { getQuoteProgress } from "@shared/quoteProgress";

const icons = {
  submitted: ClipboardList,
  review: SearchCheck,
  approved: BadgeCheck,
  payment: CreditCard,
  paid: CheckCircle2,
} as const;

export default function QuoteProgressTracker({ status, paymentStatus }: { status: string; paymentStatus?: string }) {
  const steps = getQuoteProgress(status, paymentStatus);

  return (
    <section className="glass-card rounded-xl p-4 sm:p-6" aria-labelledby="quote-progress-heading">
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#0EA5E9]">Quote progress</p>
          <h2 id="quote-progress-heading" className="mt-1 text-lg font-black text-white">Track your request</h2>
        </div>
        {status === "quote_rejected" && (
          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-red-500/30 bg-red-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-red-300">
            <XCircle className="h-3.5 w-3.5" /> Not approved
          </span>
        )}
      </div>

      <ol className="grid gap-4 md:grid-cols-5 md:gap-0">
        {steps.map((step, index) => {
          const Icon = icons[step.key];
          const isLast = index === steps.length - 1;
          const isComplete = step.state === "complete";
          const isCurrent = step.state === "current";
          const isRejected = step.state === "rejected";

          return (
            <li key={step.key} className="relative flex min-w-0 items-start gap-3 md:block md:pr-4">
              {!isLast && (
                <span
                  aria-hidden="true"
                  className={`absolute left-[15px] top-8 h-[calc(100%+1rem)] w-px md:left-8 md:top-4 md:h-px md:w-[calc(100%-1.5rem)] ${isComplete ? "bg-[#0EA5E9]" : "bg-[#1E293B]"}`}
                />
              )}
              <span
                className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 ${
                  isRejected
                    ? "border-red-400 bg-red-500/15 text-red-300"
                    : isComplete
                      ? "border-[#0EA5E9] bg-[#0EA5E9] text-black"
                      : isCurrent
                        ? "border-[#E11D48] bg-[#E11D48]/15 text-[#FDA4AF] shadow-[0_0_0_4px_rgba(225,29,72,0.12)]"
                        : "border-[#334155] bg-[#0B0B0B] text-[#64748B]"
                }`}
              >
                {isComplete ? <Check className="h-4 w-4" strokeWidth={3} /> : isRejected ? <XCircle className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
              </span>
              <span className="min-w-0 pt-0.5 md:mt-3 md:block md:pr-2">
                <span className={`block text-xs font-black uppercase tracking-wide ${isRejected ? "text-red-300" : isComplete || isCurrent ? "text-white" : "text-[#64748B]"}`}>
                  {step.label}
                </span>
                <span className="mt-1 block max-w-[14rem] text-xs leading-relaxed text-[#64748B] md:max-w-none">{step.description}</span>
              </span>
            </li>
          );
        })}
      </ol>

      {status === "quote_rejected" && (
        <p className="mt-5 rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-2.5 text-xs leading-relaxed text-red-200">
          Your request stopped at admin review. Check the review notes below or contact the store if you need clarification.
        </p>
      )}
    </section>
  );
}
