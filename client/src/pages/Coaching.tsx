import React, { useState } from "react";
import { Link } from "wouter";
import { ArrowLeft, ArrowRight, CheckCircle2, ShieldCheck, Sparkles } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";

const initialForm = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  address: "",
  primaryGoal: "",
  experienceLevel: "intermediate" as "beginner" | "intermediate" | "advanced",
  availability: "",
};

export default function Coaching() {
  const [form, setForm] = useState(initialForm);
  const [submitted, setSubmitted] = useState(false);
  const submit = trpc.coaching.submit.useMutation({
    onSuccess: () => {
      setSubmitted(true);
      setForm(initialForm);
    },
  });

  const update = (key: keyof typeof form, value: string) => setForm((current) => ({ ...current, [key]: value }));

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    submit.mutate(form);
  };

  return (
    <div className="min-h-screen bg-[#070707] text-white">
      <Navbar />
      <main className="pt-[5.9rem]">
        <section className="border-b border-white/10 bg-[radial-gradient(circle_at_78%_14%,rgba(201,154,61,0.18),transparent_25%),#090909]">
          <div className="container grid gap-10 py-14 sm:py-20 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
            <div className="max-w-xl self-center">
              <Link href="/" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.16em] text-white/55 no-underline transition-colors hover:text-[#c99a3d]">
                <ArrowLeft className="h-3.5 w-3.5" /> Back to home
              </Link>
              <p className="mt-10 text-[10px] font-black uppercase tracking-[0.3em] text-[#c99a3d]">Elite coaching application</p>
              <h1 className="mt-4 text-5xl font-black uppercase leading-[0.84] tracking-[-0.065em] sm:text-7xl">Build a plan that earns results.</h1>
              <p className="mt-7 max-w-md text-base leading-7 text-white/65">Personalised coaching for athletes who want structure, accountability and serious progress. Tell us where you are and where you intend to go.</p>
              <div className="mt-10 space-y-5 border-l border-[#c99a3d]/70 pl-5">
                {[
                  ["01", "Tell us your goal", "Your training objective, experience and availability."],
                  ["02", "We review the fit", "A coach reviews your application and requirements."],
                  ["03", "Start with intent", "If suitable, we arrange your coaching consultation."],
                ].map(([number, title, copy]) => (
                  <div key={number} className="flex gap-4"><span className="text-[10px] font-black tracking-[0.2em] text-[#c99a3d]">{number}</span><div><p className="text-xs font-black uppercase tracking-[0.14em]">{title}</p><p className="mt-1 text-sm text-white/48">{copy}</p></div></div>
                ))}
              </div>
            </div>

            <div className="border border-white/10 bg-[#101010] p-5 shadow-2xl sm:p-8">
              {submitted ? (
                <div className="flex min-h-[520px] flex-col items-center justify-center px-4 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full border border-[#c99a3d]/50 bg-[#c99a3d]/10"><CheckCircle2 className="h-8 w-8 text-[#c99a3d]" /></div>
                  <p className="mt-7 text-[10px] font-black uppercase tracking-[0.25em] text-[#c99a3d]">Application received</p>
                  <h2 className="mt-3 text-3xl font-black uppercase tracking-[-0.05em]">We’ll review your goals.</h2>
                  <p className="mt-4 max-w-sm text-sm leading-6 text-white/58">Your coaching enquiry is now with the Gorilla Gear team. We will contact you using the details you provided.</p>
                  <Button onClick={() => setSubmitted(false)} variant="outline" className="mt-8 h-11 rounded-none border-white/20 bg-transparent text-[10px] font-black uppercase tracking-[0.15em] text-white hover:border-[#c99a3d] hover:bg-white/5">Submit another enquiry</Button>
                </div>
              ) : (
                <form onSubmit={onSubmit} className="space-y-5" noValidate>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[#c99a3d]">Coaching enquiry</p>
                    <h2 className="mt-2 text-3xl font-black uppercase tracking-[-0.05em]">Tell us your standard.</h2>
                    <p className="mt-2 text-sm text-white/48">All fields are required so we can assess the right route for you.</p>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="First name"><Input required value={form.firstName} onChange={(event) => update("firstName", event.target.value)} className="h-12 rounded-none border-white/15 bg-black/30 text-white placeholder:text-white/25" /></Field>
                    <Field label="Last name"><Input required value={form.lastName} onChange={(event) => update("lastName", event.target.value)} className="h-12 rounded-none border-white/15 bg-black/30 text-white placeholder:text-white/25" /></Field>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Email address"><Input required type="email" value={form.email} onChange={(event) => update("email", event.target.value)} className="h-12 rounded-none border-white/15 bg-black/30 text-white placeholder:text-white/25" /></Field>
                    <Field label="Cellphone number"><Input required type="tel" value={form.phone} onChange={(event) => update("phone", event.target.value)} className="h-12 rounded-none border-white/15 bg-black/30 text-white placeholder:text-white/25" /></Field>
                  </div>
                  <Field label="Physical address"><Textarea required value={form.address} onChange={(event) => update("address", event.target.value)} className="min-h-[76px] rounded-none border-white/15 bg-black/30 text-white placeholder:text-white/25" /></Field>
                  <Field label="Primary goal"><Input required placeholder="e.g. Strength, body composition, performance" value={form.primaryGoal} onChange={(event) => update("primaryGoal", event.target.value)} className="h-12 rounded-none border-white/15 bg-black/30 text-white placeholder:text-white/25" /></Field>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Training experience">
                      <select value={form.experienceLevel} onChange={(event) => update("experienceLevel", event.target.value)} className="h-12 w-full rounded-none border border-white/15 bg-black/30 px-3 text-sm text-white outline-none focus:border-[#c99a3d]">
                        <option value="beginner">Beginner</option><option value="intermediate">Intermediate</option><option value="advanced">Advanced</option>
                      </select>
                    </Field>
                    <Field label="Availability"><Input required placeholder="e.g. Weekday evenings" value={form.availability} onChange={(event) => update("availability", event.target.value)} className="h-12 rounded-none border-white/15 bg-black/30 text-white placeholder:text-white/25" /></Field>
                  </div>
                  {submit.error && <p role="alert" className="border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">{submit.error.message || "We could not submit your enquiry. Please try again."}</p>}
                  <Button disabled={submit.isPending} className="h-12 w-full rounded-none bg-[#c99a3d] text-[10px] font-black uppercase tracking-[0.16em] text-black hover:bg-[#e0b35a] disabled:opacity-60">
                    {submit.isPending ? "Submitting your enquiry…" : <>Submit coaching enquiry <ArrowRight className="ml-2 h-4 w-4" /></>}
                  </Button>
                  <p className="flex items-start gap-2 text-[11px] leading-5 text-white/40"><ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#c99a3d]" />Your details are used only to assess and respond to your coaching enquiry.</p>
                </form>
              )}
            </div>
          </div>
        </section>
        <section className="bg-[#0c0c0c] py-12">
          <div className="container flex flex-col items-center justify-between gap-5 text-center sm:flex-row sm:text-left"><div><p className="text-[10px] font-black uppercase tracking-[0.25em] text-[#c99a3d]">Private member support</p><p className="mt-2 text-sm text-white/55">Already a Gorilla Gear member? Your account remains separate from your coaching application.</p></div><Sparkles className="h-7 w-7 text-[#c99a3d]" /></div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="mb-2 block text-[10px] font-black uppercase tracking-[0.16em] text-white/65">{label}</span>{children}</label>;
}
