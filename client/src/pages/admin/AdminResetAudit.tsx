import React, { useMemo, useState } from "react";
import { Link } from "wouter";
import { AlertTriangle, CheckCircle2, Clock3, KeyRound, MailCheck, MailX, RefreshCw, ShieldCheck, XCircle } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";

type EventType =
  | "request_received"
  | "token_issued"
  | "email_sent"
  | "email_failed"
  | "token_consumed"
  | "token_invalid"
  | "token_expired"
  | "account_not_eligible";

type AuditEvent = {
  id: number;
  userId: number | null;
  maskedEmail: string;
  eventType: EventType;
  tokenHashPrefix: string | null;
  detail: string | null;
  createdAt: Date | string;
};

const eventLabels: Record<EventType, string> = {
  request_received: "Request received",
  token_issued: "Token issued",
  email_sent: "Email sent",
  email_failed: "Email failed",
  token_consumed: "Password updated",
  token_invalid: "Invalid token",
  token_expired: "Token expired",
  account_not_eligible: "Account not eligible",
};

const eventStyles: Record<EventType, { color: string; icon: typeof KeyRound }> = {
  request_received: { color: "#94A3B8", icon: Clock3 },
  token_issued: { color: "#38BDF8", icon: KeyRound },
  email_sent: { color: "#34D399", icon: MailCheck },
  email_failed: { color: "#FB7185", icon: MailX },
  token_consumed: { color: "#22C55E", icon: CheckCircle2 },
  token_invalid: { color: "#F97316", icon: AlertTriangle },
  token_expired: { color: "#F59E0B", icon: XCircle },
  account_not_eligible: { color: "#A78BFA", icon: ShieldCheck },
};

const eventTypeOptions: Array<{ value: "all" | EventType; label: string }> = [
  { value: "all", label: "All events" },
  ...Object.entries(eventLabels).map(([value, label]) => ({ value: value as EventType, label })),
];

function formatDate(value: Date | string) {
  return new Date(value).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function AdminResetAudit() {
  const [eventType, setEventType] = useState<"all" | EventType>("all");
  const [search, setSearch] = useState("");
  const query = trpc.admin.passwordResetAudit.useQuery(
    eventType === "all" ? undefined : { eventType },
    { refetchInterval: 30_000 },
  );

  const events = (query.data ?? []) as AuditEvent[];
  const filteredEvents = useMemo(() => {
    const needle = search.trim().toLowerCase();
    if (!needle) return events;
    return events.filter((event) =>
      event.maskedEmail.toLowerCase().includes(needle) ||
      eventLabels[event.eventType].toLowerCase().includes(needle) ||
      (event.detail ?? "").toLowerCase().includes(needle),
    );
  }, [events, search]);

  const summary = useMemo(() => ({
    requests: events.filter((event) => event.eventType === "request_received").length,
    sent: events.filter((event) => event.eventType === "email_sent").length,
    completed: events.filter((event) => event.eventType === "token_consumed").length,
    exceptions: events.filter((event) => ["email_failed", "token_invalid", "token_expired"].includes(event.eventType)).length,
  }), [events]);

  return (
    <div className="space-y-6 text-white">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.22em] text-[#38BDF8]">
            <KeyRound className="h-4 w-4" /> Security / password recovery
          </div>
          <h1 className="text-3xl font-black uppercase tracking-tight md:text-4xl">Reset-token audit</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#94A3B8]">
            Monitor password-recovery requests and delivery outcomes without exposing raw reset tokens or full email addresses.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={() => query.refetch()}
          disabled={query.isFetching}
          className="min-h-11 border-[#334155] bg-[#111111] text-[#CBD5E1] hover:border-[#38BDF8]/60 hover:bg-[#0F172A] hover:text-white"
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${query.isFetching ? "animate-spin" : ""}`} />
          Refresh events
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Requests", value: summary.requests, color: "#94A3B8", icon: Clock3 },
          { label: "Emails sent", value: summary.sent, color: "#34D399", icon: MailCheck },
          { label: "Passwords updated", value: summary.completed, color: "#22C55E", icon: CheckCircle2 },
          { label: "Exceptions", value: summary.exceptions, color: "#FB7185", icon: AlertTriangle },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="rounded border border-[#1E293B] bg-[#111111] p-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#64748B]">{item.label}</span>
                <Icon className="h-4 w-4" style={{ color: item.color }} />
              </div>
              <p className="mt-3 text-3xl font-black" style={{ color: item.color }}>{item.value}</p>
            </div>
          );
        })}
      </div>

      <div className="rounded border border-[#1E293B] bg-[#111111] p-4 md:p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <label className="text-xs font-bold uppercase tracking-widest text-[#64748B]" htmlFor="reset-event-filter">Filter</label>
            <select
              id="reset-event-filter"
              aria-label="Filter reset events"
              value={eventType}
              onChange={(event) => setEventType(event.target.value as "all" | EventType)}
              className="min-h-11 rounded border border-[#334155] bg-[#0A0A0A] px-3 text-sm text-white outline-none focus:border-[#38BDF8]"
            >
              {eventTypeOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </div>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            aria-label="Search reset audit events"
            placeholder="Search masked email or event"
            className="min-h-11 w-full rounded border border-[#334155] bg-[#0A0A0A] px-3 text-sm text-white placeholder:text-[#64748B] outline-none focus:border-[#38BDF8] lg:max-w-xs"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded border border-[#1E293B] bg-[#111111]">
        <div className="hidden grid-cols-[1.2fr_1fr_1fr_1.5fr] gap-4 border-b border-[#1E293B] px-5 py-3 text-[10px] font-bold uppercase tracking-[0.18em] text-[#64748B] md:grid">
          <span>Account</span><span>Event</span><span>Time</span><span>Detail</span>
        </div>
        {query.isLoading ? (
          <div className="p-8 text-center text-sm text-[#94A3B8]">Loading reset audit events…</div>
        ) : filteredEvents.length === 0 ? (
          <div className="p-8 text-center">
            <KeyRound className="mx-auto mb-3 h-8 w-8 text-[#334155]" />
            <p className="text-sm font-bold text-[#CBD5E1]">No reset events found</p>
            <p className="mt-1 text-xs text-[#64748B]">Events will appear here when customers request password recovery.</p>
          </div>
        ) : (
          <div className="divide-y divide-[#1E293B]">
            {filteredEvents.map((event) => {
              const style = eventStyles[event.eventType];
              const Icon = style.icon;
              return (
                <div key={event.id} className="grid gap-3 px-4 py-4 md:grid-cols-[1.2fr_1fr_1fr_1.5fr] md:items-center md:gap-4 md:px-5">
                  <div>
                    <p className="text-sm font-bold text-white">{event.maskedEmail}</p>
                    <p className="mt-1 text-[11px] text-[#64748B]">{event.userId ? `Member #${event.userId}` : "Unmatched account"}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 shrink-0" style={{ color: style.color }} />
                    <span className="text-xs font-bold" style={{ color: style.color }}>{eventLabels[event.eventType]}</span>
                  </div>
                  <time className="text-xs text-[#94A3B8]" dateTime={new Date(event.createdAt).toISOString()}>{formatDate(event.createdAt)}</time>
                  <div className="text-xs text-[#94A3B8]">
                    <span className="md:hidden font-bold uppercase tracking-widest text-[#64748B]">Detail: </span>
                    {event.detail ?? "No additional detail"}
                    {event.tokenHashPrefix && <span className="ml-2 font-mono text-[10px] text-[#475569]">hash …{event.tokenHashPrefix.slice(-6)}</span>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="rounded border border-[#38BDF8]/20 bg-[#0F172A] p-4 text-xs leading-5 text-[#94A3B8]">
        <strong className="text-[#CBD5E1]">Privacy note:</strong> raw reset tokens are never stored in the audit table or returned to administrators. The audit view shows only masked account identifiers and a non-sensitive hash suffix for correlation.
      </div>

      <Link href="/admin" className="inline-flex text-xs font-bold uppercase tracking-widest text-[#38BDF8] no-underline hover:text-white">
        ← Back to dashboard
      </Link>
    </div>
  );
}
