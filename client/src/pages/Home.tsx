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
  hero: "/manus-storage/ggn-premium-hero_611e23a0.jpg",
  supplements: "/manus-storage/ggn-collection-supplements-v2_e5318894.jpg",
  clothing: "/manus-storage/ggn-collection-clothing-v2_1a6bf8d6.jpg",
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
  },
  {
    title: "Clothing",
    eyebrow: "Performance apparel",
    description: "Train hard. Live ready. Show up with intent.",
    action: "Explore member range",
    href: "#membership",
    image: artwork.clothing,
  },
  {
    title: "Coaching",
    eyebrow: "Private coaching",
    description: "A plan, a standard and real accountability.",
    action: "Start application",
    href: "/coaching",
    image: artwork.coaching,
  },
];

const pillars = [
  { icon: BadgeCheck, title: "Premium range", copy: "Quality you can trust." },
  { icon: Dumbbell, title: "Performance driven", copy: "Built to support progress." },
  { icon: Users, title: "Expert coaching", copy: "Guidance that transforms." },
  { icon: LockKeyhole, title: "Community", copy: "Like-minded. Goal driven." },
];

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const isApproved = (user as any)?.status === "approved";

  return (
    <div className="min-h-screen bg-[#070707] text-white selection:bg-[#c99a3d] selection:text-black">
      <Navbar />

      <main>
        <section className="relative isolate overflow-hidden border-b border-white/10 bg-[#070707] pt-[5.9rem]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_77%_23%,rgba(201,154,61,0.18),transparent_24%),radial-gradient(circle_at_18%_88%,rgba(255,255,255,0.06),transparent_28%)]" />
          <div className="container relative grid min-h-[calc(100svh-5.9rem)] items-center gap-8 py-12 sm:py-16 lg:grid-cols-[0.85fr_1.15fr] lg:gap-10 lg:py-20">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.52 }}
              className="relative z-10 max-w-xl"
            >
              <p className="mb-5 text-[10px] font-bold uppercase tracking-[0.3em] text-[#c99a3d] sm:text-xs">Premium supplements. Elite coaching. Real results.</p>
              <h1 className="text-[clamp(3.25rem,13vw,7.8rem)] font-black uppercase leading-[0.79] tracking-[-0.075em] text-white">
                Discipline
                <span className="block">fuels</span>
                <span className="block text-[#c99a3d]">greatness</span>
              </h1>
              <div className="mt-6 h-px w-12 bg-[#c99a3d]" />
              <p className="mt-6 max-w-md text-[15px] leading-6 text-white/72 sm:text-base sm:leading-7">
                Premium supplements, performance apparel and elite coaching. Built for those who demand more.
              </p>
              <div className="mt-8 grid gap-3 sm:grid-cols-3">
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
              <div className="mt-5">
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
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.66, delay: 0.08 }}
              className="relative min-h-[370px] overflow-hidden border border-white/10 bg-[#121212] sm:min-h-[510px] lg:min-h-[620px]"
            >
              <img src={artwork.hero} alt="Premium Gorilla Gear supplement and training gear collection" className="absolute inset-0 h-full w-full object-cover object-[70%_center]" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#070707]/85 via-[#070707]/15 to-transparent lg:hidden" />
              <div className="absolute bottom-5 left-5 right-5 flex items-center justify-between border-t border-white/20 pt-4 text-[10px] font-bold uppercase tracking-[0.18em] text-white/70">
                <span>Built to perform</span>
                <span className="text-[#c99a3d]">GGN / 01</span>
              </div>
            </motion.div>
          </div>
        </section>

        <section className="border-b border-white/10 bg-[#0d0d0d] py-7">
          <div className="container grid gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-0">
            {pillars.map(({ icon: Icon, title, copy }, index) => (
              <div key={title} className={`flex items-center gap-4 ${index > 0 ? "lg:border-l lg:border-white/10 lg:pl-8" : ""} ${index < pillars.length - 1 ? "lg:pr-8" : ""}`}>
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
            <div className="mb-9 text-center sm:mb-12">
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#c99a3d]">The Gorilla Gear edit</p>
              <h2 className="mt-3 text-4xl font-black uppercase leading-none tracking-[-0.055em] text-white sm:text-5xl">Shop our collections</h2>
              <div className="mx-auto mt-4 h-px w-10 bg-[#c99a3d]" />
            </div>
            <div className="grid gap-5 md:grid-cols-3">
              {collections.map((collection, index) => (
                <a key={collection.title} href={collection.href} className="group relative block min-h-[480px] overflow-hidden border border-white/10 bg-[#111111] no-underline transition-all duration-300 hover:-translate-y-1 hover:border-[#c99a3d]/60 sm:min-h-[540px]">
                  <img src={collection.image} alt={collection.title} className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.15)_0%,rgba(0,0,0,0.28)_33%,rgba(0,0,0,0.94)_100%)]" />
                  <div className="absolute left-5 right-5 top-5 flex items-center justify-between"><span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#c99a3d]">Collection 0{index + 1}</span><span className="h-px w-8 bg-white/35" /></div>
                  <div className="absolute inset-x-0 bottom-0 p-6 sm:p-7">
                    <p className="text-[10px] font-black uppercase tracking-[0.19em] text-[#c99a3d]">{collection.eyebrow}</p>
                    <h3 className="mt-3 text-3xl font-black uppercase leading-none tracking-[-0.055em] text-white">{collection.title}</h3>
                    <p className="mt-3 max-w-xs text-sm leading-6 text-white/64">{collection.description}</p>
                    <span className="mt-6 inline-flex items-center gap-2 border-b border-[#c99a3d] pb-2 text-[10px] font-black uppercase tracking-[0.18em] text-white transition-colors group-hover:text-[#c99a3d]">
                      {collection.action} <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>

        <section id="coaching" className="scroll-mt-24 border-y border-white/10 bg-[#0e0e0e] py-16 sm:py-20">
          <div className="container grid items-stretch gap-5 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="relative min-h-[340px] overflow-hidden border border-white/10 bg-[#151515] sm:min-h-[420px]">
              <img src={artwork.coaching} alt="Elite strength coaching in a premium training environment" className="absolute inset-0 h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/72 via-black/22 to-transparent" />
              <div className="absolute bottom-7 left-7 max-w-xs sm:bottom-10 sm:left-10">
                <p className="text-[10px] font-bold uppercase tracking-[0.26em] text-[#c99a3d]">Coaching built for progress</p>
                <h2 className="mt-3 text-3xl font-black uppercase leading-[0.9] tracking-[-0.05em] text-white sm:text-5xl">Built in the gym. Backed by discipline.</h2>
                <Link href="/coaching" className="mt-6 inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-[#c99a3d] no-underline">Start coaching application <ArrowUpRight className="h-4 w-4" /></Link>
              </div>
            </div>
            <div id="membership" className="scroll-mt-24 flex flex-col justify-center bg-[#c99a3d] p-8 text-black sm:p-12">
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

        <section className="bg-[#080808] py-8">
          <div className="container grid gap-5 text-center sm:grid-cols-2 lg:grid-cols-4 lg:text-left">
            {[
              { icon: Truck, label: "Fast shipping", copy: "Nationwide delivery" },
              { icon: ShieldCheck, label: "Secure payments", copy: "Protected checkout" },
              { icon: PackageCheck, label: "Quality guarantee", copy: "Curated performance range" },
              { icon: LockKeyhole, label: "Member support", copy: "Here when you need us" },
            ].map(({ icon: Icon, label, copy }) => (
              <div key={label} className="flex items-center justify-center gap-3 lg:justify-start">
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
