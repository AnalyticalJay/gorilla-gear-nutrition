import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";

import { RegistrationForm, RegistrationSubmitted } from "@/components/RegistrationForm";

export default function Register() {
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0A0A0A] p-4">
        <RegistrationSubmitted />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#0A0A0A]">
      <aside className="relative hidden overflow-hidden bg-[#080808] lg:flex lg:w-1/2">
        <div className="hex-pattern absolute inset-0 opacity-80" />
        <div className="pointer-events-none absolute left-1/4 top-1/3 h-[400px] w-[400px] rounded-full bg-[#0EA5E9]/10 blur-3xl" />
        <div className="pointer-events-none absolute bottom-1/4 right-0 h-[300px] w-[300px] rounded-full bg-[#E11D48]/10 blur-3xl" />

        <div className="relative z-10 flex flex-col justify-center p-16">
          <Link href="/" className="mb-16 flex items-center gap-2.5 no-underline">
            <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded border border-[#1E293B] bg-black">
              <img src="/manus-storage/logo_2d6e0f20.png" alt="Gorilla Gear Nutrition logo" className="h-full w-full object-contain" />
            </div>
            <div>
              <span className="font-black text-base uppercase tracking-widest text-white">Gorilla Gear</span>
              <span className="ml-1.5 font-black text-base uppercase tracking-widest text-[#E24A32]">Nutrition</span>
            </div>
          </Link>

          <p className="mb-4 text-[10px] font-black uppercase tracking-[0.28em] text-[#0EA5E9]">Private catalogue access</p>
          <h2 className="mb-4 break-words text-4xl font-black uppercase leading-tight tracking-tight text-white sm:text-5xl">
            Join the <span className="text-[#0EA5E9]">inner circle.</span>
          </h2>
          <p className="mb-8 max-w-xs leading-relaxed text-[#64748B]">
            Apply for access to South Africa&apos;s private performance nutrition catalogue. Every application is reviewed by the Gorilla Gear team.
          </p>
          <ul className="space-y-3">
            {[
              "Manual approval process",
              "Member-only catalogue pricing",
              "Discreet nationwide delivery",
              "18+ verified platform",
            ].map((item) => (
              <li key={item} className="flex items-center gap-3 text-sm text-[#64748B]">
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#0EA5E9]" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </aside>

      <main className="flex flex-1 items-center justify-center overflow-y-auto bg-[#0A0A0A] p-6 lg:p-12">
        <div className="w-full max-w-md py-8">
          <Link href="/" className="mb-8 inline-flex items-center gap-2 text-sm text-[#64748B] no-underline transition-colors hover:text-white">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>

          <div className="mb-6 h-[3px] w-16 bg-gradient-to-r from-[#E11D48] via-[#E11D48] via-50% to-[#0EA5E9] to-50%" />
          <h1 className="mb-2 text-3xl font-black uppercase tracking-tight text-white">Apply for Access</h1>
          <p className="mb-8 text-sm text-[#64748B]">
            Already have an account? <Link href="/login" className="font-bold text-[#0EA5E9] no-underline hover:underline">Login here</Link>
          </p>

          <RegistrationForm onSubmitted={() => setSubmitted(true)} />
        </div>
      </main>
    </div>
  );
}
