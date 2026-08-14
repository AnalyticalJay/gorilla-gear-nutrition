import { format } from "date-fns";
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  Eye,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Search,
  ShieldCheck,
  UserCheck,
  UserRound,
  UserX,
  XCircle,
} from "lucide-react";
import React, { useMemo, useState } from "react";
import { Link } from "wouter";
import { toast } from "sonner";

import { trpc } from "@/lib/trpc";
import { countApplicants, filterApplicants, getApplicantInitials, type ApplicantSummary, type StatusFilter } from "@/lib/privateAccess";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type Applicant = ApplicantSummary;

const statusFilters: Array<{ value: StatusFilter; label: string }> = [
  { value: "all", label: "All applicants" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];

function StatusBadge({ status }: { status: Applicant["status"] }) {
  const config = {
    pending: { label: "Pending review", className: "border-amber-400/30 bg-amber-400/10 text-amber-300", icon: Clock3 },
    approved: { label: "Approved", className: "border-emerald-400/30 bg-emerald-400/10 text-emerald-300", icon: CheckCircle2 },
    rejected: { label: "Rejected", className: "border-rose-400/30 bg-rose-400/10 text-rose-300", icon: XCircle },
  }[status];
  const Icon = config.icon;

  return (
    <Badge variant="outline" className={`inline-flex items-center gap-1.5 whitespace-nowrap text-[10px] font-bold uppercase tracking-wide ${config.className}`}>
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  );
}

function ApplicantAvatar({ applicant }: { applicant: Applicant }) {
  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#0EA5E9]/30 bg-[#0EA5E9]/10 text-xs font-black text-[#7DD3FC]">
      {getApplicantInitials(applicant.fullName) || "GG"}
    </div>
  );
}

export default function AdminApprovalDashboard() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<StatusFilter>("pending");
  const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(null);
  const [reviewNotes, setReviewNotes] = useState("");
  const utils = trpc.useUtils();
  const applicantsQuery = trpc.admin.users.useQuery(undefined, { refetchInterval: 30000 });

  const approveMutation = trpc.admin.approveUser.useMutation({
    onSuccess: () => {
      toast.success("Applicant approved", { description: "Private catalogue access is now enabled." });
      setSelectedApplicant(null);
      setReviewNotes("");
      utils.admin.users.invalidate();
      utils.admin.stats.invalidate();
    },
    onError: (error) => toast.error("Approval failed", { description: error.message }),
  });

  const rejectMutation = trpc.admin.rejectUser.useMutation({
    onSuccess: () => {
      toast.success("Applicant rejected");
      setSelectedApplicant(null);
      setReviewNotes("");
      utils.admin.users.invalidate();
      utils.admin.stats.invalidate();
    },
    onError: (error) => toast.error("Rejection failed", { description: error.message }),
  });

  const roleMutation = trpc.admin.setUserRole.useMutation({
    onSuccess: ({ role }) => {
      toast.success(`Account role changed to ${role === "admin" ? "Admin" : "User"}`);
      setSelectedApplicant((current) => current ? { ...current, role } : current);
      utils.admin.users.invalidate();
    },
    onError: (error) => toast.error("Role change failed", { description: error.message }),
  });

  const applicants = (applicantsQuery.data ?? []) as Applicant[];
  const counts = useMemo(() => countApplicants(applicants), [applicants]);
  const filteredApplicants = useMemo(() => filterApplicants(applicants, filter, search), [applicants, filter, search]);

  const isReviewing = approveMutation.isPending || rejectMutation.isPending || roleMutation.isPending;

  const openApplicant = (applicant: Applicant) => {
    setSelectedApplicant(applicant);
    setReviewNotes("");
  };

  const reviewSelected = (decision: "approved" | "rejected") => {
    if (!selectedApplicant) return;
    const input = { userId: selectedApplicant.id, notes: reviewNotes.trim() || undefined };
    if (decision === "approved") approveMutation.mutate(input);
    else rejectMutation.mutate(input);
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="mb-3 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.24em] text-[#64748B]">
            <ShieldCheck className="h-4 w-4 text-[#0EA5E9]" />
            Private catalogue access
          </div>
          <h1 className="text-3xl font-black uppercase tracking-tight text-white sm:text-4xl">
            Applicant <span className="text-[#0EA5E9]">Review</span>
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#64748B]">
            Review customer applications before enabling member-only pricing, product access, and quote requests.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-[#1E293B] bg-[#111111] px-3 py-2 text-xs text-[#94A3B8]">
          <UserRound className="h-4 w-4 text-[#0EA5E9]" />
          {counts.pending} awaiting review
        </div>
      </header>

      <section aria-label="Applicant status summary" className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { label: "All applicants", value: counts.all, icon: UserRound, color: "#94A3B8" },
          { label: "Pending review", value: counts.pending, icon: Clock3, color: "#FBBF24" },
          { label: "Approved members", value: counts.approved, icon: UserCheck, color: "#34D399" },
          { label: "Rejected", value: counts.rejected, icon: UserX, color: "#FB7185" },
        ].map((card) => (
          <div key={card.label} className="rounded-xl border border-[#1E293B] bg-[#111111] p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wide text-[#64748B]">{card.label}</span>
              <card.icon className="h-4 w-4" style={{ color: card.color }} />
            </div>
            <p className="text-2xl font-black text-white">{applicantsQuery.isLoading ? "—" : card.value}</p>
          </div>
        ))}
      </section>

      <section className="rounded-xl border border-[#1E293B] bg-[#0D0D0D] p-4 sm:p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748B]" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search name, email, city..."
              className="h-11 border-[#1E293B] bg-[#111111] pl-9 text-white placeholder:text-[#475569]"
              aria-label="Search applicants"
            />
          </div>
          <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap" role="tablist" aria-label="Applicant status filter">
            {statusFilters.map((option) => {
              const active = filter === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setFilter(option.value)}
                    className={`min-h-10 min-w-0 rounded-lg border px-2 text-[10px] font-bold uppercase tracking-wide transition-colors sm:px-3 sm:text-xs ${
                    active
                      ? "border-[#0EA5E9]/50 bg-[#0EA5E9]/15 text-[#7DD3FC]"
                      : "border-[#1E293B] text-[#64748B] hover:border-[#334155] hover:text-white"
                  }`}
                >
                  {option.label} <span className="ml-1 opacity-60">{counts[option.value]}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-xl border border-[#1E293B] bg-[#111111]" aria-live="polite">
        {applicantsQuery.isLoading ? (
          <div className="space-y-3 p-5">
            {[...Array(4)].map((_, index) => <div key={index} className="h-16 animate-pulse rounded-lg bg-[#1E293B]/50" />)}
          </div>
        ) : applicantsQuery.isError ? (
          <div className="p-10 text-center">
            <XCircle className="mx-auto mb-3 h-9 w-9 text-[#FB7185]" />
            <p className="font-bold text-white">Unable to load applicants</p>
            <p className="mt-1 text-sm text-[#64748B]">Refresh the page or try again shortly.</p>
            <Button variant="outline" className="mt-5 border-[#1E293B] text-[#CBD5E1]" onClick={() => applicantsQuery.refetch()}>Retry</Button>
          </div>
        ) : filteredApplicants.length === 0 ? (
          <div className="p-12 text-center">
            <CheckCircle2 className="mx-auto mb-3 h-10 w-10 text-emerald-400/60" />
            <p className="font-bold text-white">No applicants match this view</p>
            <p className="mt-1 text-sm text-[#64748B]">Try another status filter or search term.</p>
          </div>
        ) : (
          <>
            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full min-w-[820px]">
                <thead>
                  <tr className="border-b border-[#1E293B] text-left text-[10px] font-black uppercase tracking-wider text-[#64748B]">
                    <th className="p-4">Applicant</th>
                    <th className="p-4">Location</th>
                    <th className="p-4">Applied</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Review</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredApplicants.map((applicant) => (
                    <tr key={applicant.id} className="border-b border-[#1E293B]/70 transition-colors last:border-0 hover:bg-white/[0.025]">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <ApplicantAvatar applicant={applicant} />
                          <div className="min-w-0">
                            <p className="truncate text-sm font-bold text-white">{applicant.fullName}</p>
                            <p className="truncate text-xs text-[#64748B]">{applicant.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-sm text-[#94A3B8]">{applicant.city || "Not provided"}</td>
                      <td className="p-4 text-xs text-[#64748B]">{format(new Date(applicant.createdAt), "d MMM yyyy")}</td>
                      <td className="p-4"><StatusBadge status={applicant.status} /></td>
                      <td className="p-4 text-right">
                        <Button size="sm" variant="outline" className="border-[#1E293B] text-[#CBD5E1] hover:border-[#0EA5E9]/50 hover:text-white" onClick={() => openApplicant(applicant)}>
                          <Eye className="mr-2 h-3.5 w-3.5" /> View application
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="divide-y divide-[#1E293B] lg:hidden">
              {filteredApplicants.map((applicant) => (
                <article key={applicant.id} className="space-y-4 p-4">
                  <div className="flex items-start gap-3">
                    <ApplicantAvatar applicant={applicant} />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <p className="font-bold text-white">{applicant.fullName}</p>
                          <p className="mt-0.5 break-all text-xs text-[#64748B]">{applicant.email}</p>
                        </div>
                        <StatusBadge status={applicant.status} />
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-xs text-[#94A3B8]">
                    <span className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5 text-[#0EA5E9]" />{applicant.city || "Not provided"}</span>
                    <span className="flex items-center gap-2"><CalendarDays className="h-3.5 w-3.5 text-[#0EA5E9]" />{format(new Date(applicant.createdAt), "d MMM yyyy")}</span>
                  </div>
                  <Button className="min-h-11 w-full border-[#1E293B] text-[#CBD5E1]" variant="outline" onClick={() => openApplicant(applicant)}>
                    <Eye className="mr-2 h-4 w-4" /> Review application
                  </Button>
                </article>
              ))}
            </div>
          </>
        )}
      </section>

      <Dialog open={Boolean(selectedApplicant)} onOpenChange={(open) => !open && setSelectedApplicant(null)}>
        <DialogContent className="border-[#1E293B] bg-[#111111] text-white sm:max-w-xl">
          {selectedApplicant && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3 pr-8 text-left text-xl font-black uppercase tracking-tight">
                  <ApplicantAvatar applicant={selectedApplicant} />
                  <span>Application review</span>
                </DialogTitle>
                <DialogDescription className="text-left text-[#64748B]">
                  Review the applicant details before granting private catalogue access.
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-3 rounded-lg border border-[#1E293B] bg-[#0D0D0D] p-4 sm:grid-cols-2">
                <div className="flex items-start gap-3"><Mail className="mt-0.5 h-4 w-4 shrink-0 text-[#0EA5E9]" /><div><p className="text-[10px] font-bold uppercase tracking-wide text-[#64748B]">Email</p><p className="mt-1 break-all text-sm text-white">{selectedApplicant.email}</p></div></div>
                <div className="flex items-start gap-3"><Phone className="mt-0.5 h-4 w-4 shrink-0 text-[#0EA5E9]" /><div><p className="text-[10px] font-bold uppercase tracking-wide text-[#64748B]">Phone</p><p className="mt-1 text-sm text-white">{selectedApplicant.phone || "Not provided"}</p></div></div>
                <div className="flex items-start gap-3"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#0EA5E9]" /><div><p className="text-[10px] font-bold uppercase tracking-wide text-[#64748B]">City</p><p className="mt-1 text-sm text-white">{selectedApplicant.city || "Not provided"}</p></div></div>
                <div className="flex items-start gap-3"><CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-[#0EA5E9]" /><div><p className="text-[10px] font-bold uppercase tracking-wide text-[#64748B]">Applied</p><p className="mt-1 text-sm text-white">{format(new Date(selectedApplicant.createdAt), "d MMM yyyy, HH:mm")}</p></div></div>
              </div>

              <div className="space-y-2">
                <label htmlFor="review-notes" className="text-xs font-bold uppercase tracking-wide text-[#94A3B8]">Internal review note <span className="font-normal normal-case text-[#64748B]">(optional)</span></label>
                <Textarea
                  id="review-notes"
                  value={reviewNotes}
                  onChange={(event) => setReviewNotes(event.target.value)}
                  placeholder="Add context for the approval record..."
                  maxLength={2000}
                  className="min-h-24 resize-y border-[#1E293B] bg-[#0D0D0D] text-white placeholder:text-[#475569]"
                  disabled={isReviewing}
                />
                <p className="text-right text-[10px] text-[#64748B]">{reviewNotes.length}/2000</p>
              </div>

              {selectedApplicant.status === "approved" && (
                <div className="space-y-2 rounded-lg border border-[#0EA5E9]/20 bg-[#0EA5E9]/5 p-4">
                  <label htmlFor="account-role" className="text-xs font-bold uppercase tracking-wide text-[#BAE6FD]">Account role</label>
                  <select
                    id="account-role"
                    value={selectedApplicant.role}
                    disabled={roleMutation.isPending}
                    onChange={(event) => roleMutation.mutate({ userId: selectedApplicant.id, role: event.target.value as "user" | "admin" })}
                    className="min-h-11 w-full rounded-md border border-[#1E293B] bg-[#0D0D0D] px-3 text-sm font-bold text-white outline-none focus:border-[#0EA5E9]"
                  >
                    <option value="user">User — customer catalogue access</option>
                    <option value="admin">Admin — dashboard and catalogue access</option>
                  </select>
                  <p className="text-xs leading-relaxed text-[#7DD3FC]">Role changes apply on the account’s next authenticated request. The system prevents removing the last admin or demoting yourself.</p>
                </div>
              )}

              {selectedApplicant.status === "pending" ? (
                <DialogFooter className="gap-2 sm:gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={isReviewing}
                    onClick={() => reviewSelected("rejected")}
                    className="min-h-11 border-rose-400/30 text-rose-300 hover:bg-rose-400/10 hover:text-rose-200"
                  >
                    {rejectMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserX className="mr-2 h-4 w-4" />}
                    Reject access
                  </Button>
                  <Button
                    type="button"
                    disabled={isReviewing}
                    onClick={() => reviewSelected("approved")}
                    className="min-h-11 bg-emerald-500 font-bold text-black hover:bg-emerald-400"
                  >
                    {approveMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserCheck className="mr-2 h-4 w-4" />}
                    Approve access
                  </Button>
                </DialogFooter>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 rounded-lg border border-[#1E293B] bg-[#0D0D0D] p-3 text-sm text-[#94A3B8]">
                    <StatusBadge status={selectedApplicant.status} />
                    This application has already been reviewed.
                  </div>
                  {selectedApplicant.status === "approved" && (
                    <Link href={`/admin/users/${selectedApplicant.id}/preview`} className="block no-underline">
                      <Button type="button" variant="outline" className="min-h-11 w-full border-[#0EA5E9]/30 text-[#7DD3FC] hover:border-[#0EA5E9]/60 hover:bg-[#0EA5E9]/10">
                        <ShieldCheck className="mr-2 h-4 w-4" /> Open read-only access check
                      </Button>
                    </Link>
                  )}
                </div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
