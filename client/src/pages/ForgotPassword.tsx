import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link } from "wouter";
import { ArrowLeft, CheckCircle2, Info, Loader2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";

const schema = z.object({ email: z.string().email("Enter a valid email address") });
type FormData = z.infer<typeof schema>;

export default function ForgotPassword() {
  const [submitted, setSubmitted] = React.useState(false);
  const forgotPassword = trpc.auth.forgotPassword.useMutation({ onSuccess: () => setSubmitted(true) });
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) });

  return (
    <div className="min-h-screen bg-[#101010] flex items-center justify-center px-5 py-10">
      <div className="w-full max-w-md">
        <Link href="/login" className="mb-8 inline-flex items-center gap-2 text-sm text-[#9b9388] no-underline transition-colors hover:text-white">
          <ArrowLeft className="h-4 w-4" />
          Back to Sign In
        </Link>
        <div className="mb-6 h-[3px] w-16" style={{ background: "linear-gradient(90deg, #a8751c 0%, #a8751c 50%, #a8751c 50%, #a8751c 100%)" }} />
        <div className="rounded-2xl border border-[#454545] bg-[#111111] p-6 shadow-2xl sm:p-8">
          <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl border border-[#a8751c]/30 bg-[#a8751c]/10 text-[#e7c979]">
            <Mail className="h-6 w-6" />
          </div>
          <h1 className="text-3xl font-black uppercase tracking-tight text-white">Forgot password?</h1>
          <p className="mt-2 text-sm leading-relaxed text-[#c9c2b6]">Enter your account email and we’ll send a secure reset link if the account is eligible.</p>

          {submitted ? (
            <div className="mt-7 space-y-5" role="status" aria-live="polite">
              <div className="flex items-start gap-3 rounded-lg border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-200">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                <span>If an active account matches that email, a reset link has been sent. Check your inbox and spam folder.</span>
              </div>
              <Link href="/login" className="block no-underline">
                <Button type="button" className="h-11 w-full bg-[#454545] font-bold uppercase tracking-widest text-white hover:bg-[#5c5852]">Return to Sign In</Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit((data) => forgotPassword.mutate(data))} className="mt-7 space-y-5">
              <div>
                <Label htmlFor="reset-email" className="text-sm font-bold uppercase tracking-wide text-[#c9c2b6]">Email Address</Label>
                <Input id="reset-email" type="email" autoComplete="email" placeholder="you@example.com" {...register("email")} className="mt-1.5 h-11 border-[#454545] bg-[#101010] text-white placeholder:text-[#6b665e] focus:border-[#a8751c]/50" />
                {errors.email && <p className="mt-1 text-xs text-[#FB7185]">{errors.email.message}</p>}
              </div>
              {forgotPassword.error && (
                <div className="flex items-start gap-3 rounded-lg border border-rose-400/30 bg-rose-400/10 px-4 py-3 text-sm text-rose-200" role="alert">
                  <Info className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>We could not process that request. Please try again shortly.</span>
                </div>
              )}
              <Button type="submit" disabled={forgotPassword.isPending} aria-busy={forgotPassword.isPending} className="h-11 w-full font-bold uppercase tracking-widest text-white" style={{ background: "linear-gradient(135deg, #a8751c, #7c5a20)" }}>
                {forgotPassword.isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending Link…</> : "Email Reset Link"}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
