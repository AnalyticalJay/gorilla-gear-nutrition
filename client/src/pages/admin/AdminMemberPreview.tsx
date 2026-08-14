import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Link, useParams } from "wouter";
import { AlertTriangle, ArrowLeft, CheckCircle2, Eye, LockKeyhole, ShieldCheck, XCircle } from "lucide-react";

export default function AdminMemberPreview() {
  const { userId } = useParams<{ userId: string }>();
  const { user } = useAuth();
  const memberId = Number(userId);
  const previewQuery = trpc.admin.memberPreview.useQuery(
    { userId: memberId },
    { enabled: Number.isInteger(memberId) && memberId > 0 },
  );

  if (previewQuery.isLoading) {
    return <div className="space-y-4"><div className="h-8 w-72 animate-pulse rounded bg-[#1E293B]" /><div className="h-40 animate-pulse rounded-xl bg-[#111111]" /></div>;
  }

  if (previewQuery.isError || !previewQuery.data) {
    return (
      <section className="rounded-xl border border-rose-400/20 bg-rose-400/5 p-6">
        <div className="flex items-start gap-3"><XCircle className="mt-0.5 h-5 w-5 text-rose-300" /><div><h1 className="font-black text-white">Unable to load member preview</h1><p className="mt-1 text-sm text-[#94A3B8]">{previewQuery.error?.message ?? "Check the member ID and try again."}</p></div></div>
        <Link href="/admin/users" className="mt-5 inline-flex no-underline"><Button variant="outline" className="border-[#1E293B] text-[#CBD5E1]"><ArrowLeft className="mr-2 h-4 w-4" /> Back to members</Button></Link>
      </section>
    );
  }

  const preview = previewQuery.data;
  const member = preview.member;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link href="/admin/users" className="mb-4 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-[#64748B] no-underline hover:text-white"><ArrowLeft className="h-3.5 w-3.5" /> Back to members</Link>
          <div className="mb-3 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.24em] text-[#64748B]"><Eye className="h-4 w-4 text-[#0EA5E9]" /> Read-only test access</div>
          <h1 className="text-3xl font-black uppercase tracking-tight text-white sm:text-4xl">Member <span className="text-[#0EA5E9]">Preview</span></h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#64748B]">Audit whether this member should be able to sign in and access the private catalogue. This tool never signs you in as the customer and never exposes their password.</p>
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-[#0EA5E9]/20 bg-[#0EA5E9]/5 px-3 py-2 text-xs text-[#7DD3FC]"><LockKeyhole className="h-4 w-4" /> Admin session retained</div>
      </div>

      <section className="rounded-xl border border-[#1E293B] bg-[#111111] p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div><p className="text-xs font-bold uppercase tracking-wide text-[#64748B]">Member account</p><h2 className="mt-1 text-2xl font-black text-white">{member.fullName}</h2><p className="mt-1 text-sm text-[#94A3B8]">{member.email}</p></div>
          <span className={`inline-flex w-fit items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-bold uppercase tracking-wide ${preview.accessGranted ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300" : "border-amber-400/30 bg-amber-400/10 text-amber-300"}`}>
            {preview.accessGranted ? <CheckCircle2 className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
            {preview.accessGranted ? "Access expected" : "Access blocked"}
          </span>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg border border-[#1E293B] bg-[#0D0D0D] p-4"><p className="text-[10px] font-bold uppercase tracking-wide text-[#64748B]">Approval status</p><p className="mt-2 font-bold capitalize text-white">{member.status}</p></div>
          <div className="rounded-lg border border-[#1E293B] bg-[#0D0D0D] p-4"><p className="text-[10px] font-bold uppercase tracking-wide text-[#64748B]">Account active</p><p className="mt-2 font-bold text-white">{member.isActive ? "Yes" : "No"}</p></div>
          <div className="rounded-lg border border-[#1E293B] bg-[#0D0D0D] p-4"><p className="text-[10px] font-bold uppercase tracking-wide text-[#64748B]">Catalogue gate</p><p className="mt-2 font-bold text-white">{preview.accessGranted ? "Should allow access" : "Should block access"}</p></div>
        </div>
        <div className={`mt-5 rounded-lg border p-4 text-sm ${preview.accessGranted ? "border-emerald-400/20 bg-emerald-400/5 text-emerald-200" : "border-amber-400/20 bg-amber-400/5 text-amber-200"}`}><div className="flex items-start gap-3">{preview.accessGranted ? <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0" /> : <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />}<p>{preview.accessMessage}</p></div></div>
      </section>

      <section className="rounded-xl border border-[#1E293B] bg-[#111111] p-5 sm:p-6">
        <h2 className="flex items-center gap-2 text-lg font-black uppercase tracking-tight text-white"><ShieldCheck className="h-5 w-5 text-[#0EA5E9]" /> Production test checklist</h2>
        <ol className="mt-4 space-y-3 text-sm leading-relaxed text-[#CBD5E1]">
          <li><span className="mr-2 font-black text-[#0EA5E9]">01</span> Confirm the member is approved and active above.</li>
          <li><span className="mr-2 font-black text-[#0EA5E9]">02</span> Ask the customer to sign in with their own email and password at the production domain.</li>
          <li><span className="mr-2 font-black text-[#0EA5E9]">03</span> Confirm the header changes to Account and the private catalogue loads without “Sign In Required.”</li>
          <li><span className="mr-2 font-black text-[#0EA5E9]">04</span> If access still fails, capture the time, email address, and browser console/network error for diagnosis.</li>
        </ol>
        <p className="mt-5 border-t border-[#1E293B] pt-4 text-xs text-[#64748B]">Preview opened by admin #{user?.id ?? "current"}. This is a read-only diagnostic; no customer session, cart, order, or payment action is created.</p>
      </section>
    </div>
  );
}
