import React, { useMemo, useState } from "react";
import { CheckCircle2, ClipboardList, RefreshCw, Search, UserRound } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const statuses = ["new", "reviewing", "consultation_scheduled", "accepted", "closed"] as const;
const statusLabel: Record<(typeof statuses)[number], string> = {
  new: "New", reviewing: "Reviewing", consultation_scheduled: "Consultation scheduled", accepted: "Accepted", closed: "Closed",
};

export default function AdminCoachingEnquiries() {
  const utils = trpc.useUtils();
  const query = trpc.admin.coachingEnquiries.useQuery(undefined, { refetchInterval: 30_000 });
  const [statusFilter, setStatusFilter] = useState<"all" | (typeof statuses)[number]>("all");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const selected = query.data?.find((enquiry) => enquiry.id === selectedId) ?? null;
  const [notes, setNotes] = useState("");
  const [nextStatus, setNextStatus] = useState<(typeof statuses)[number]>("new");

  const review = trpc.admin.reviewCoachingEnquiry.useMutation({
    onSuccess: async () => { await utils.admin.coachingEnquiries.invalidate(); },
  });

  const enquiries = useMemo(() => (query.data ?? []).filter((enquiry) => {
    const matchesStatus = statusFilter === "all" || enquiry.status === statusFilter;
    const value = `${enquiry.firstName} ${enquiry.lastName} ${enquiry.email} ${enquiry.primaryGoal}`.toLowerCase();
    return matchesStatus && value.includes(search.toLowerCase());
  }), [query.data, search, statusFilter]);

  const counts = useMemo(() => ({ total: query.data?.length ?? 0, new: query.data?.filter((enquiry) => enquiry.status === "new").length ?? 0, active: query.data?.filter((enquiry) => ["reviewing", "consultation_scheduled"].includes(enquiry.status)).length ?? 0 }), [query.data]);

  const select = (enquiry: any) => { setSelectedId(enquiry.id); setNotes(enquiry.adminNotes ?? ""); setNextStatus(enquiry.status); };
  const saveReview = () => selected && review.mutate({ enquiryId: selected.id, status: nextStatus, adminNotes: notes });

  return <div className="space-y-7">
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#c99a3d]">Private coaching pipeline</p><h1 className="mt-2 text-3xl font-black uppercase tracking-tight text-white sm:text-4xl">Coaching enquiries</h1><p className="mt-2 text-sm text-[#94A3B8]">Review applications, prepare consultations and track coaching intake.</p></div><Button onClick={() => query.refetch()} variant="outline" className="border-white/15 bg-[#111] text-xs font-bold uppercase tracking-wider text-white hover:border-[#c99a3d]"><RefreshCw className="mr-2 h-4 w-4" />Refresh</Button></div>
    <div className="grid gap-4 sm:grid-cols-3">{[{ icon: ClipboardList, label: "Total enquiries", value: counts.total }, { icon: UserRound, label: "New to review", value: counts.new }, { icon: CheckCircle2, label: "Active pipeline", value: counts.active }].map(({ icon: Icon, label, value }) => <div key={label} className="border border-white/10 bg-[#111] p-5"><Icon className="h-5 w-5 text-[#c99a3d]" /><p className="mt-5 text-3xl font-black text-white">{value}</p><p className="mt-1 text-[10px] font-black uppercase tracking-[0.16em] text-[#94A3B8]">{label}</p></div>)}</div>
    <div className="flex flex-col gap-3 border border-white/10 bg-[#111] p-4 sm:flex-row"><div className="relative flex-1"><Search className="absolute left-3 top-3.5 h-4 w-4 text-[#64748B]" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search name, email or goal" className="h-11 w-full border border-white/10 bg-black/25 pl-9 pr-3 text-sm text-white outline-none placeholder:text-[#64748B] focus:border-[#c99a3d]" /></div><select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as any)} className="h-11 border border-white/10 bg-black/25 px-3 text-sm text-white outline-none focus:border-[#c99a3d]"><option value="all">All statuses</option>{statuses.map((status) => <option value={status} key={status}>{statusLabel[status]}</option>)}</select></div>
    <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
      <div className="overflow-hidden border border-white/10 bg-[#111]">{query.isLoading ? <p className="p-8 text-sm text-[#94A3B8]">Loading coaching enquiries…</p> : enquiries.length === 0 ? <p className="p-8 text-sm text-[#94A3B8]">No coaching enquiries match this view.</p> : <div className="divide-y divide-white/10">{enquiries.map((enquiry) => <button key={enquiry.id} onClick={() => select(enquiry)} className={`grid w-full gap-3 p-5 text-left transition hover:bg-white/[0.03] sm:grid-cols-[1.2fr_1fr_auto] ${selectedId === enquiry.id ? "bg-[#c99a3d]/10" : ""}`}><div><p className="font-bold text-white">{enquiry.firstName} {enquiry.lastName}</p><p className="mt-1 text-xs text-[#94A3B8]">{enquiry.email} · {enquiry.phone}</p></div><div><p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#c99a3d]">{enquiry.primaryGoal}</p><p className="mt-1 text-xs text-[#94A3B8]">{enquiry.experienceLevel} · {enquiry.availability}</p></div><span className="h-fit border border-white/10 px-2 py-1 text-[9px] font-black uppercase tracking-[0.13em] text-white/70">{statusLabel[enquiry.status as keyof typeof statusLabel]}</span></button>)}</div>}</div>
      <div className="border border-white/10 bg-[#111] p-5">{selected ? <div className="space-y-5"><div><p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#c99a3d]">Application review</p><h2 className="mt-2 text-2xl font-black text-white">{selected.firstName} {selected.lastName}</h2><p className="mt-1 text-sm text-[#94A3B8]">{selected.email} · {selected.phone}</p></div><div className="space-y-3 border-y border-white/10 py-4 text-sm"><p><span className="text-[#64748B]">Address:</span> <span className="text-white/80">{selected.address}</span></p><p><span className="text-[#64748B]">Goal:</span> <span className="text-white/80">{selected.primaryGoal}</span></p><p><span className="text-[#64748B]">Experience:</span> <span className="capitalize text-white/80">{selected.experienceLevel}</span></p><p><span className="text-[#64748B]">Availability:</span> <span className="text-white/80">{selected.availability}</span></p></div><label className="block"><span className="mb-2 block text-[10px] font-black uppercase tracking-[0.16em] text-white/65">Pipeline status</span><select value={nextStatus} onChange={(event) => setNextStatus(event.target.value as any)} className="h-11 w-full border border-white/10 bg-black/25 px-3 text-sm text-white outline-none focus:border-[#c99a3d]">{statuses.map((status) => <option value={status} key={status}>{statusLabel[status]}</option>)}</select></label><label className="block"><span className="mb-2 block text-[10px] font-black uppercase tracking-[0.16em] text-white/65">Internal review notes</span><Textarea value={notes} onChange={(event) => setNotes(event.target.value)} className="min-h-28 border-white/10 bg-black/25 text-white" placeholder="Consultation notes, next action or fit assessment…" /></label>{review.error && <p className="text-sm text-red-300">{review.error.message}</p>}<Button disabled={review.isPending} onClick={saveReview} className="h-11 w-full rounded-none bg-[#c99a3d] text-[10px] font-black uppercase tracking-[0.15em] text-black hover:bg-[#e0b35a]">{review.isPending ? "Saving…" : "Save review"}</Button></div> : <div className="flex min-h-80 items-center justify-center text-center text-sm text-[#64748B]">Select an enquiry to review its intake details and update the coaching pipeline.</div>}</div>
    </div>
  </div>;
}
