import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useLocation } from "wouter";
import { ArrowLeft, CheckCircle2, Eye, EyeOff, KeyRound, Loader2, Lock, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";

const schema = z.object({
  newPassword: z.string().min(32, "Use at least 32 characters for your new password"),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type FormData = z.infer<typeof schema>;

export default function ResetPassword() {
  const [, navigate] = useLocation();
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [showSuccess, setShowSuccess] = React.useState(false);
  const token = React.useMemo(() => new URLSearchParams(window.location.search).get("token") ?? "", []);
  const resetPassword = trpc.auth.resetPassword.useMutation({ onSuccess: () => setShowSuccess(true) });
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) });

  const submit = (data: FormData) => {
    if (!token) return;
    resetPassword.mutate({ token, newPassword: data.newPassword });
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center px-5 py-10">
      <div className="w-full max-w-md">
        <Link href="/login" className="mb-8 inline-flex items-center gap-2 text-sm text-[#64748B] no-underline transition-colors hover:text-white">
          <ArrowLeft className="h-4 w-4" />
          Back to Sign In
        </Link>
        <div className="mb-6 h-[3px] w-16" style={{ background: "linear-gradient(90deg, #E11D48 0%, #E11D48 50%, #0EA5E9 50%, #0EA5E9 100%)" }} />
        <div className="rounded-2xl border border-[#1E293B] bg-[#111111] p-6 shadow-2xl sm:p-8">
          <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl border border-[#0EA5E9]/30 bg-[#0EA5E9]/10 text-[#7DD3FC]">
            <KeyRound className="h-6 w-6" />
          </div>
          <h1 className="text-3xl font-black uppercase tracking-tight text-white">Set a new password</h1>
          <p className="mt-2 text-sm leading-relaxed text-[#94A3B8]">Choose a strong password with at least 32 characters. This reset link can only be used once.</p>

          {showSuccess ? (
            <div className="mt-7 space-y-5" role="status" aria-live="polite">
              <div className="flex items-start gap-3 rounded-lg border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-200">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                <span>Your password has been updated. You can now sign in with the new password.</span>
              </div>
              <Button type="button" onClick={() => navigate("/login")} className="h-11 w-full font-bold uppercase tracking-widest text-white" style={{ background: "linear-gradient(135deg, #0EA5E9, #0284C7)" }}>Continue to Sign In</Button>
            </div>
          ) : !token ? (
            <div className="mt-7 space-y-5" role="alert">
              <div className="flex items-start gap-3 rounded-lg border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm text-amber-200">
                <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
                <span>This reset link is missing or invalid. Request a new link to continue.</span>
              </div>
              <Link href="/forgot-password" className="block no-underline"><Button type="button" className="h-11 w-full bg-[#1E293B] font-bold uppercase tracking-widest text-white hover:bg-[#334155]">Request New Link</Button></Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit(submit)} className="mt-7 space-y-5">
              <div>
                <Label htmlFor="new-password" className="text-sm font-bold uppercase tracking-wide text-[#94A3B8]">New Password</Label>
                <div className="relative mt-1.5">
                  <Input id="new-password" type={showPassword ? "text" : "password"} autoComplete="new-password" placeholder="At least 32 characters" {...register("newPassword")} className="h-11 border-[#1E293B] bg-[#0A0A0A] pr-10 text-white placeholder:text-[#475569] focus:border-[#0EA5E9]/50" />
                  <button type="button" aria-label={showPassword ? "Hide new password" : "Show new password"} onClick={() => setShowPassword((value) => !value)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-white">{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
                </div>
                {errors.newPassword && <p className="mt-1 text-xs text-[#FB7185]">{errors.newPassword.message}</p>}
              </div>
              <div>
                <Label htmlFor="confirm-password" className="text-sm font-bold uppercase tracking-wide text-[#94A3B8]">Confirm New Password</Label>
                <Input id="confirm-password" type={showConfirmPassword ? "text" : "password"} autoComplete="new-password" placeholder="Repeat your new password" {...register("confirmPassword")} className="mt-1.5 h-11 border-[#1E293B] bg-[#0A0A0A] text-white placeholder:text-[#475569] focus:border-[#0EA5E9]/50" />
                <div className="mt-2 text-right"><button type="button" onClick={() => setShowConfirmPassword((value) => !value)} className="text-xs font-bold text-[#7DD3FC] hover:text-white">{showConfirmPassword ? "Hide confirmation" : "Show confirmation"}</button></div>
                {errors.confirmPassword && <p className="mt-1 text-xs text-[#FB7185]">{errors.confirmPassword.message}</p>}
              </div>
              {resetPassword.error && <div className="flex items-start gap-3 rounded-lg border border-rose-400/30 bg-rose-400/10 px-4 py-3 text-sm text-rose-200" role="alert"><Lock className="mt-0.5 h-4 w-4 shrink-0" /><span>{resetPassword.error.message}</span></div>}
              <Button type="submit" disabled={resetPassword.isPending} aria-busy={resetPassword.isPending} className="h-11 w-full font-bold uppercase tracking-widest text-white" style={{ background: "linear-gradient(135deg, #0EA5E9, #0284C7)" }}>
                {resetPassword.isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Updating Password…</> : "Update Password"}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
