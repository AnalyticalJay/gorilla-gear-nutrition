import React from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  Dumbbell,
  LockKeyhole,
  PackageCheck,
  ShieldCheck,
  Truck,
  Users,
} from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const artwork = {
  hero: "/manus-storage/ggn-hero-branded-apparel-model_38e5ef90.png",
  supplements: "/manus-storage/ggn-collection-supplements-v2_e5318894.jpg",
  clothing: "/manus-storage/ggn-clothing-mannequin_b7e2bdb6.png",
  coaching: "/manus-storage/ggn-collection-coaching-v2_87dd91b3.jpg",
};

const collections = [
  {
    title: "Supplements",
    eyebrow: "Performance nutrition",
    description: "Purpose-built fuel for disciplined progress.",
    action: "Explore member range",
    href: "#membership",
    image: artwork.supplements,
    imageClass: "object-center",
  },
  {
    title: "Clothing",
    eyebrow: "Performance apparel",
    description: "Train hard. Live ready. Show up with intent.",
    action: "Explore member range",
    href: "#membership",
    image: artwork.clothing,
    imageClass: "object-[center_16%]",
  },
  {
    title: "Coaching",
    eyebrow: "Private coaching",
    description: "A plan, a standard and real accountability.",
    action: "Start application",
    href: "/coaching",
    image: artwork.coaching,
    imageClass: "object-center",
  },
];

const pillars = [
  { icon: BadgeCheck, title: "Premium range", copy: "Quality you can trust." },
  { icon: Dumbbell, title: "Performance driven", copy: "Built to support progress." },
  { icon: Users, title: "Expert coaching", copy: "Guidance that transforms." },
  { icon: LockKeyhole, title: "Community", copy: "Like-minded. Goal driven." },
];

const membershipBenefits = [
  { icon: BadgeCheck, title: "Admin-approved", copy: "Membership reviewed with intent." },
  { icon: ShieldCheck, title: "Secure account", copy: "Quotes, orders and tracking in one place." },
  { icon: Users, title: "Member support", copy: "Coaching, guidance and clear next steps." },
];

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const isApproved = (user as any)?.status === "approved";

  return (
    <div className="min-h-screen bg-[#070707] pb-[calc(5.35rem+env(safe-area-inset-bottom))] text-white selection:bg-[#c99a3d] selection:text-black lg:pb-0">
      <Navbar />

      <main>
        <section className="relative isolate overflow-hidden border-b border-white/10 bg-[#070707] pt-[5.9rem]">
          <img src={artwork.hero} alt="Gorilla Gear Nutrition branded apparel model in a gym" className="absolute inset-0 h-full w-full object-cover object-[59%_center] sm:object-[62%_center]" />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,#070707_0%,#070707_36%,rgba(7,7,7,0.9)_62%,rgba(7,7,7,0.48)_100%)] sm:bg-[linear-gradient(90deg,#070707_0%,#070707_30%,rgba(7,7,7,0.86)_45%,rgba(7,7,7,0.28)_71%,rgba(7,7,7,0.58)_100%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_74%_20%,rgba(201,154,61,0.18),transparent_27%),linear-gradient(0deg,rgba(7,7,7,0.62)_0%,transparent_42%)]" />
          <div className="container relative flex min-h-[calc(100svh-5.9rem)] items-center py-10 sm:py-16 lg:min-h-[720px] lg:py-20">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.52 }}
              className="relative z-10 w-full max-w-xl text-center sm:text-left"
            >
              <p className="mb-4 text-[9px] font-bold uppercase tracking-[0.24em] text-[#c99a3d] sm:mb-5 sm:text-xs sm:tracking-[0.3em]">Premium supplements. Elite coaching. Real results.</p>
              <h1 className="text-[clamp(2.7rem,10.5vw,6.65rem)] font-black uppercase leading-[0.82] tracking-[-0.07em] text-white sm:text-[clamp(3rem,10.5vw,6.65rem)]">
                Discipline
                <span className="block">fuels</span>
                <span className="block text-[#c99a3d]">greatness</span>
              </h1>
              <div className="mx-auto mt-5 h-px w-10 bg-[#c99a3d] sm:mx-0 sm:mt-6 sm:w-12" />
              <p className="mx-auto mt-5 max-w-md text-sm leading-6 text-white/78 sm:mx-0 sm:mt-6 sm:text-base sm:leading-7">
                Premium supplements, performance apparel and elite coaching. Built for those who demand more.
              </p>
              <div className="mt-6 grid gap-2.5 sm:mt-8 sm:grid-cols-3 sm:gap-3">
                <a href="#collections" className="no-underline">
                  <Button className="h-12 w-full rounded-none bg-[#c99a3d] px-4 text-[10px] font-black uppercase tracking-[0.12em] text-black hover:bg-[#e0b35a]">
                    Shop supplements
                  </Button>
                </a>
                <a href="#collections" className="no-underline">
                  <Button variant="outline" className="h-12 w-full rounded-none border-white/35 bg-transparent px-4 text-[10px] font-black uppercase tracking-[0.12em] text-white hover:border-[#c99a3d] hover:bg-white/5 hover:text-white">
                    Shop clothing
                  </Button>
                </a>
                <Link href="/coaching" className="no-underline">
                  <Button variant="outline" className="h-12 w-full rounded-none border-white/35 bg-transparent px-4 text-[10px] font-black uppercase tracking-[0.12em] text-white hover:border-[#c99a3d] hover:bg-white/5 hover:text-white">
                    Coaching
                  </Button>
                </Link>
              </div>
              <div className="mt-4 flex justify-center sm:mt-5 sm:block">
                {isApproved ? (
                  <Link href="/products" className="group inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.16em] text-[#c99a3d] no-underline">
                    Enter member catalogue <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                  </Link>
                ) : !isAuthenticated ? (
                  <Link href="/register" className="group inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.16em] text-white/65 no-underline transition-colors hover:text-[#c99a3d]">
                    Apply for member access <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                  </Link>
                ) : null}
              </div>
              <div className="mt-6 grid max-w-[38rem] grid-cols-3 gap-0 border-y border-white/15 py-3.5 sm:mt-7 sm:py-4">
                {membershipBenefits.map(({ icon: Icon, title, copy }, index) => (
                  <div key={title} className={`flex min-w-0 flex-col items-center px-2 text-center first:pl-0 last:pr-0 sm:block sm:text-left ${index > 0 ? "border-l border-white/15 sm:pl-4" : ""} ${index < membershipBenefits.length - 1 ? "sm:pr-4" : ""}`}>
                    <Icon className="mb-1 h-3.5 w-3.5 text-[#c99a3d] sm:mb-0.5 sm:h-4 sm:w-4" strokeWidth={1.5} />
                    <div><p className="text-[8px] font-black uppercase leading-3 tracking-[0.1em] text-white sm:text-[9px] sm:tracking-[0.14em]">{title}</p><p className="mt-1 text-[10px] leading-3.5 text-white/60 sm:text-[11px] sm:leading-4">{copy}</p></div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
          <div className="absolute bottom-5 right-5 hidden items-center gap-6 border-t border-white/25 pt-3 text-[10px] font-bold uppercase tracking-[0.18em] text-white/75 sm:flex lg:right-10 lg:bottom-8"><span>Built to perform</span><span className="text-[#c99a3d]">GGN / 01</span></div>
        </section>

        <section className="border-b border-white/10 bg-[#0d0d0d] py-6 sm:py-7">
          <div className="container grid grid-cols-2 gap-x-5 gap-y-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-0">
            {pillars.map(({ icon: Icon, title, copy }, index) => (
              <div key={title} className={`flex flex-col items-center gap-2 text-center sm:flex-row sm:gap-4 sm:text-left ${index > 0 ? "lg:border-l lg:border-white/10 lg:pl-8" : ""} ${index < pillars.length - 1 ? "lg:pr-8" : ""}`}>
                <Icon className="h-8 w-8 shrink-0 text-[#c99a3d]" strokeWidth={1.4} />
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.16em] text-white">{title}</p>
                  <p className="mt-1 text-xs text-white/53">{copy}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section id="collections" className="scroll-mt-24 bg-[#080808] py-16 sm:py-20 lg:py-24">
          <div className="container">
            <div className="mb-8 text-center sm:mb-12">
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#c99a3d]">The Gorilla Gear edit</p>
              <h2 className="mt-3 text-3xl font-black uppercase leading-none tracking-[-0.055em] text-white sm:text-5xl">Shop our collections</h2>
              <div className="mx-auto mt-4 h-px w-10 bg-[#c99a3d]" />
            </div>
            <div className="grid gap-4 md:grid-cols-3 md:gap-5">
              {collections.map((collection, index) => (
                <a key={collection.title} href={collection.href} className="group relative block min-h-[390px] overflow-hidden border border-white/10 bg-[#111111] no-underline transition-all duration-300 hover:-translate-y-1 hover:border-[#c99a3d]/60 sm:min-h-[540px]">
                  <img src={collection.image} alt={collection.title} className={`absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105 ${collection.imageClass}`} />
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.15)_0%,rgba(0,0,0,0.28)_33%,rgba(0,0,0,0.94)_100%)]" />
                  <div className="absolute left-5 right-5 top-5 flex items-center justify-between"><span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#c99a3d]">Collection 0{index + 1}</span><span className="h-px w-8 bg-white/35" /></div>
                  <div className="absolute inset-x-0 bottom-0 p-5 text-center sm:p-7 sm:text-left">
                    <p className="text-[10px] font-black uppercase tracking-[0.19em] text-[#c99a3d]">{collection.eyebrow}</p>
                    <h3 className="mt-3 text-2xl font-black uppercase leading-none tracking-[-0.055em] text-white sm:text-3xl">{collection.title}</h3>
                    <p className="mt-2 max-w-xs text-sm leading-5 text-white/64 sm:mt-3 sm:leading-6">{collection.description}</p>
                    <span className="mt-5 inline-flex items-center gap-2 border-b border-[#c99a3d] pb-2 text-[10px] font-black uppercase tracking-[0.18em] text-white transition-colors group-hover:text-[#c99a3d] sm:mt-6">
                      {collection.action} <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>

        <section id="coaching" className="scroll-mt-24 border-y border-white/10 bg-[#0e0e0e] py-12 sm:py-20">
          <div className="container grid items-stretch gap-4 lg:grid-cols-[1.15fr_0.85fr] lg:gap-5">
            <div className="relative min-h-[300px] overflow-hidden border border-white/10 bg-[#151515] sm:min-h-[420px]">
              <img src={artwork.coaching} alt="Elite strength coaching in a premium training environment" className="absolute inset-0 h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/72 via-black/22 to-transparent" />
              <div className="absolute bottom-6 left-5 right-5 mx-auto max-w-xs text-center sm:bottom-10 sm:left-10 sm:right-auto sm:mx-0 sm:text-left">
                <p className="text-[10px] font-bold uppercase tracking-[0.26em] text-[#c99a3d]">Coaching built for progress</p>
                <h2 className="mt-3 text-3xl font-black uppercase leading-[0.9] tracking-[-0.05em] text-white sm:text-5xl">Built in the gym. Backed by discipline.</h2>
                <Link href="/coaching" className="mt-6 inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-[#c99a3d] no-underline">Start coaching application <ArrowUpRight className="h-4 w-4" /></Link>
              </div>
            </div>
            <div id="membership" className="scroll-mt-24 flex flex-col items-center justify-center bg-[#c99a3d] p-6 text-center text-black sm:items-start sm:p-12 sm:text-left">
              <Users className="h-11 w-11" strokeWidth={1.4} />
              <p className="mt-8 text-[10px] font-black uppercase tracking-[0.24em] text-black/62">Private member access</p>
              <h2 className="mt-3 text-4xl font-black uppercase leading-[0.88] tracking-[-0.055em]">Become a member</h2>
              <p className="mt-5 max-w-sm text-sm leading-6 text-black/72">Apply for membership to be part of our community and unlock exclusive insights, education and access to the private member catalogue.</p>
              {isApproved ? (
                <Link href="/products" className="mt-8 inline-flex no-underline"><Button className="h-12 rounded-none bg-black px-6 text-[10px] font-black uppercase tracking-[0.16em] text-white hover:bg-black/80">Open member catalogue <ArrowUpRight className="ml-2 h-4 w-4" /></Button></Link>
              ) : (
                <Link href="/register" className="mt-8 inline-flex no-underline"><Button className="h-12 rounded-none bg-black px-6 text-[10px] font-black uppercase tracking-[0.16em] text-white hover:bg-black/80">Apply now <ArrowUpRight className="ml-2 h-4 w-4" /></Button></Link>
              )}
            </div>
          </div>
        </section>

        <section className="bg-[#080808] py-7 sm:py-8">
          <div className="container grid grid-cols-2 gap-x-4 gap-y-6 text-center sm:grid-cols-2 sm:text-left lg:grid-cols-4">
            {[
              { icon: Truck, label: "Fast shipping", copy: "Nationwide delivery" },
              { icon: ShieldCheck, label: "Secure payments", copy: "Protected checkout" },
              { icon: PackageCheck, label: "Quality guarantee", copy: "Curated performance range" },
              { icon: LockKeyhole, label: "Member support", copy: "Here when you need us" },
            ].map(({ icon: Icon, label, copy }) => (
              <div key={label} className="flex flex-col items-center gap-2 sm:flex-row sm:gap-3">
                <Icon className="h-5 w-5 text-[#c99a3d]" strokeWidth={1.5} />
                <div><p className="text-[10px] font-black uppercase tracking-[0.16em] text-white">{label}</p><p className="mt-1 text-xs text-white/48">{copy}</p></div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
