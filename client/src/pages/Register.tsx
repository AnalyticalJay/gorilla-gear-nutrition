import { ArrowLeft, LockKeyhole, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";

import { RegistrationForm, RegistrationSubmitted } from "@/components/RegistrationForm";

export default function Register() {
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f6f4ef] p-4">
        <RegistrationSubmitted />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#f6f4ef]">
      <aside className="relative hidden overflow-hidden bg-[#1c1c1c] lg:flex lg:w-1/2">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(45deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:28px_28px]" />
        <div className="pointer-events-none absolute -left-24 top-1/4 h-[420px] w-[420px] rounded-full bg-[#c99a3d]/12 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 right-0 h-[320px] w-[320px] rounded-full bg-black/40 blur-3xl" />
        <div className="absolute inset-y-0 right-0 w-px bg-[#c99a3d]/35" />

        <div className="relative z-10 flex flex-col justify-center p-16">
          <Link href="/" className="mb-16 flex items-center gap-2.5 no-underline">
            <div className="flex h-11 w-12 items-center justify-center overflow-hidden border border-white/15 bg-white">
              <img src="/manus-storage/ggn-logo-transparent_bf4fb645.png" alt="Gorilla Gear Nutrition logo" className="h-full w-full object-contain" />
            </div>
            <div>
              <span className="font-black text-base uppercase tracking-widest text-white">Gorilla Gear</span>
              <span className="ml-1.5 font-black text-base uppercase tracking-widest text-[#c99a3d]">Nutrition</span>
            </div>
          </Link>

          <div className="mb-5 flex items-center gap-3 text-[#c99a3d]"><LockKeyhole className="h-4 w-4" /><span className="text-[10px] font-black uppercase tracking-[0.28em]">Private catalogue access</span></div>
          <h2 className="mb-4 break-words text-4xl font-black uppercase leading-tight tracking-tight text-white sm:text-5xl">
            Join the <span className="text-[#c99a3d]">member standard.</span>
          </h2>
          <p className="mb-8 max-w-sm leading-relaxed text-white/65">
            Apply for access to South Africa&apos;s private performance nutrition catalogue. Every application is reviewed by the Gorilla Gear team.
          </p>
          <ul className="space-y-3">
            {[
              "Manual approval process",
              "Member-only catalogue pricing",
              "Discreet nationwide delivery",
              "18+ verified platform",
            ].map((item) => (
              <li key={item} className="flex items-center gap-3 text-sm text-white/68">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center border border-[#c99a3d]/50 text-[#c99a3d]"><ShieldCheck className="h-3 w-3" /></span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </aside>

      <main className="flex flex-1 items-center justify-center overflow-y-auto bg-[#f6f4ef] p-6 lg:p-12">
        <div className="w-full max-w-md py-8">
          <Link href="/" className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-[#6a6257] no-underline transition-colors hover:text-[#a8751c]">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>

          <div className="mb-6 h-[3px] w-16 bg-[#c99a3d]" />
          <h1 className="mb-2 text-3xl font-black uppercase tracking-tight text-[#1c1c1c]">Apply for Access</h1>
          <p className="mb-8 text-sm text-[#6a6257]">
            Already have an account? <Link href="/login" className="font-bold text-[#a8751c] no-underline hover:underline">Sign in here</Link>
          </p>

          <RegistrationForm onSubmitted={() => setSubmitted(true)} />
        </div>
      </main>
    </div>
  );
}
