import React from "react";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  ChevronDown,
  Dumbbell,
  LockKeyhole,
  PackageCheck,
  ShieldCheck,
  Truck,
  Users,
} from "lucide-react";
import { Link } from "wouter";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const artwork = {
  hero: "/api/media/ggn-hero-branded-apparel-model-optimized_386b1ec5.webp",
  supplements: "/api/media/ggn-supplements-nutritech-lifestyle_56a682c5.jpg",
  clothing: "/api/media/ggn-clothing-mannequin-optimized_303323aa.webp",
  coaching: "/api/media/ggn-collection-coaching-v2_87dd91b3.jpg",
  privateCatalogue: "/api/media/ggn-private-catalogue-full-range_6449fda7.jpg",
};

const collections = [
  {
    title: "Supplements",
    eyebrow: "Performance nutrition",
    description: "Purpose-built fuel for disciplined progress.",
    action: "Explore member range",
    href: "/supplements",
    image: artwork.supplements,
    imageClass: "object-[40%_center]",
  },
  {
    title: "Clothing",
    eyebrow: "Performance apparel",
    description: "Train hard. Live ready. Show up with intent.",
    action: "Explore member range",
    href: "/apparel",
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

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const isApproved = (user as any)?.status === "approved";
  const pillarsRef = useRef<HTMLElement>(null);
  const [pillarsInView, setPillarsInView] = useState(false);
  useEffect(() => {
    const target = pillarsRef.current;
    if (!target || typeof IntersectionObserver === "undefined") {
      setPillarsInView(true);
      return;
    }

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setPillarsInView(true);
        observer.disconnect();
      }
    }, { rootMargin: "0px 0px -12% 0px" });
    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-[#070707] text-white selection:bg-[#c99a3d] selection:text-black">
      <Navbar />

      <main>
        <section className="relative isolate overflow-hidden border-b border-white/10 bg-[#070707] pt-[5.9rem]">
          <img src={artwork.hero} alt="Gorilla Gear Nutrition branded apparel model in a gym" fetchPriority="high" decoding="async" className="absolute inset-0 h-full w-full object-cover object-[59%_center] sm:object-[62%_center]" />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,#070707_0%,#070707_36%,rgba(7,7,7,0.9)_62%,rgba(7,7,7,0.48)_100%)] sm:bg-[linear-gradient(90deg,#070707_0%,#070707_30%,rgba(7,7,7,0.86)_45%,rgba(7,7,7,0.28)_71%,rgba(7,7,7,0.58)_100%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_74%_20%,rgba(201,154,61,0.18),transparent_27%),linear-gradient(0deg,rgba(7,7,7,0.62)_0%,transparent_42%)]" />
          <div className="container relative flex min-h-[calc(100svh-5.9rem)] items-center py-10 sm:py-16 lg:min-h-[720px] lg:py-20">
            <div className="home-hero-content relative z-10 w-full max-w-xl text-center sm:text-left">
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
                <Link href="/supplements" className="no-underline">
                  <Button className="h-12 w-full rounded-none bg-[#c99a3d] px-4 text-[10px] font-black uppercase tracking-[0.12em] text-black hover:bg-[#e0b35a]">
                    Shop supplements
                  </Button>
                </Link>
                <Link href="/apparel" className="no-underline">
                  <Button variant="outline" className="h-12 w-full rounded-none border-white/35 bg-transparent px-4 text-[10px] font-black uppercase tracking-[0.12em] text-white hover:border-[#c99a3d] hover:bg-white/5 hover:text-white">
                    Shop clothing
                  </Button>
                </Link>
                <Link href="/coaching" className="no-underline">
                  <Button variant="outline" className="h-12 w-full rounded-none border-white/35 bg-transparent px-4 text-[10px] font-black uppercase tracking-[0.12em] text-white hover:border-[#c99a3d] hover:bg-white/5 hover:text-white">
                    Coaching
                  </Button>
                </Link>
              </div>
              <div className="mt-4 flex justify-center sm:mt-5 sm:items-center sm:justify-start sm:gap-7">
                {isApproved ? (
                  <Link href="/products" className="group inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.16em] text-[#c99a3d] no-underline">
                    Enter member catalogue <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                  </Link>
                ) : !isAuthenticated ? (
                  <Link href="/register" className="group inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.16em] text-white/65 no-underline transition-colors hover:text-[#c99a3d]">
                    Apply for member access <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                  </Link>
                ) : null}
                <a
                  href="#collections"
                  className="group hidden items-center gap-2 text-[9px] font-black uppercase tracking-[0.2em] text-[#c99a3d] no-underline transition-colors hover:text-[#f0c65e] sm:inline-flex"
                >
                  Scroll to collections
                  <span className="h-px w-5 bg-[#c99a3d]/65 transition-all duration-200 group-hover:w-8 group-hover:bg-[#f0c65e]" />
                  <ChevronDown className="h-4 w-4 text-[#c99a3d] transition-transform duration-200 group-hover:translate-y-1 group-hover:text-[#f0c65e]" aria-hidden="true" />
                </a>
              </div>
              <a
                href="#collections"
                className="group mx-auto mt-6 flex w-fit flex-col items-center gap-1.5 text-[9px] font-black uppercase tracking-[0.2em] text-[#c99a3d] no-underline transition-colors hover:text-[#f0c65e] sm:hidden"
              >
                <span className="flex items-center gap-2">
                  Scroll to collections
                  <span className="h-px w-5 bg-[#c99a3d]/65 transition-all duration-200 group-hover:w-8 group-hover:bg-[#f0c65e]" />
                </span>
                <ChevronDown className="h-4 w-4 text-[#c99a3d] transition-transform duration-200 group-hover:translate-y-1 group-hover:text-[#f0c65e]" aria-hidden="true" />
              </a>
            </div>
          </div>
          <div className="absolute bottom-5 right-5 hidden items-center gap-6 border-t border-white/25 pt-3 text-[10px] font-bold uppercase tracking-[0.18em] text-white/75 sm:flex lg:right-10 lg:bottom-8"><span>Built to perform</span><span className="text-[#c99a3d]">GGN / 01</span></div>
        </section>

        <section
          ref={pillarsRef}
          className={`home-pillars border-b border-white/10 bg-[#0d0d0d] py-6 sm:py-7 ${pillarsInView ? "is-visible" : ""}`}
        >
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

        <section id="collections" className="home-deferred-section scroll-mt-24 bg-[#080808] py-16 sm:py-20 lg:py-24">
          <div className="container">
            <div className="mb-8 text-center sm:mb-12">
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#c99a3d]">The Gorilla Gear edit</p>
              <h2 className="mt-3 text-3xl font-black uppercase leading-none tracking-[-0.055em] text-white sm:text-5xl">Shop our collections</h2>
              <div className="mx-auto mt-4 h-px w-10 bg-[#c99a3d]" />
            </div>
            <div className="grid gap-4 md:grid-cols-3 md:gap-5">
              {collections.map((collection, index) => {
                const content = <>
                  <img src={collection.image} alt={collection.title} loading="lazy" decoding="async" className={`absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105 ${collection.imageClass}`} />
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
                </>;
                const className = "group relative block min-h-[390px] overflow-hidden border border-white/10 bg-[#111111] no-underline transition-all duration-300 hover:-translate-y-1 hover:border-[#c99a3d]/60 sm:min-h-[540px]";
                return collection.href.startsWith("/") ? <Link key={collection.title} href={collection.href} className={className}>{content}</Link> : <a key={collection.title} href={collection.href} className={className}>{content}</a>;
              })}
            </div>
          </div>
        </section>

        <section id="member-catalogue" className="home-deferred-section scroll-mt-24 border-y border-white/10 bg-[#090909] py-16 sm:py-20 lg:py-24">
          <div className="container">
            <div className="group relative isolate overflow-hidden border border-[#c99a3d]/35 bg-[#111111]">
              <img
                src={artwork.privateCatalogue}
                alt="Private member catalogue collection"
                loading="lazy"
                decoding="async"
                className="absolute inset-0 h-full w-full object-cover object-right opacity-75 transition-[filter,opacity] duration-500 ease-out transform-gpu md:-inset-4 md:h-[calc(100%+2rem)] md:w-[calc(100%+2rem)] md:max-w-none md:scale-[1.045] md:group-hover:brightness-110 md:group-hover:opacity-90"
              />
              <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(7,7,7,0.98)_0%,rgba(7,7,7,0.92)_42%,rgba(7,7,7,0.48)_100%)]" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_74%_35%,rgba(201,154,61,0.23),transparent_30%)] transition-opacity duration-700 group-hover:opacity-80" />
              <div className="relative grid min-h-[430px] items-center px-6 py-12 sm:min-h-[480px] sm:px-12 lg:grid-cols-[0.9fr_1.1fr] lg:px-16">
                <div className="max-w-xl text-center sm:text-left">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center border border-[#c99a3d]/60 bg-black/35 text-[#c99a3d] sm:mx-0">
                    <LockKeyhole className="h-6 w-6" strokeWidth={1.5} />
                  </div>
                  <p className="mt-7 text-[10px] font-black uppercase tracking-[0.26em] text-[#c99a3d]">Private member catalogue</p>
                  <h2 className="mt-3 text-4xl font-black uppercase leading-[0.88] tracking-[-0.055em] text-white sm:text-5xl">The full range is unlocked by approval.</h2>
                  <p className="mx-auto mt-5 max-w-lg text-sm leading-6 text-white/72 sm:mx-0 sm:text-base sm:leading-7">All enhanced product brands, categories and member catalogue details are reserved for approved Gorilla Gear members.</p>
                  {isApproved ? (
                    <Link href="/products" className="mt-8 inline-flex no-underline"><Button className="h-12 rounded-none bg-[#c99a3d] px-6 text-[10px] font-black uppercase tracking-[0.16em] text-black hover:bg-[#e0b35a]">Browse all brands & categories <ArrowUpRight className="ml-2 h-4 w-4" /></Button></Link>
                  ) : isAuthenticated ? (
                    <Link href="/account" className="mt-8 inline-flex no-underline"><Button variant="outline" className="h-12 rounded-none border-white/40 bg-transparent px-6 text-[10px] font-black uppercase tracking-[0.16em] text-white hover:border-[#c99a3d] hover:bg-white/5 hover:text-white">View approval status <ArrowUpRight className="ml-2 h-4 w-4" /></Button></Link>
                  ) : (
                    <Link href="/register" className="mt-8 inline-flex no-underline"><Button className="h-12 rounded-none bg-[#c99a3d] px-6 text-[10px] font-black uppercase tracking-[0.16em] text-black hover:bg-[#e0b35a]">Apply for member access <ArrowUpRight className="ml-2 h-4 w-4" /></Button></Link>
                  )}
                </div>
              </div>
              <div className="absolute bottom-5 right-5 hidden items-center gap-3 text-[9px] font-black uppercase tracking-[0.18em] text-white/55 sm:flex"><LockKeyhole className="h-3.5 w-3.5 text-[#c99a3d]" /> Member access only</div>
            </div>
          </div>
        </section>

        <section id="coaching" className="home-deferred-section scroll-mt-24 border-y border-white/10 bg-[#0e0e0e] py-12 sm:py-20">
          <div className="container grid items-stretch gap-4 lg:grid-cols-[1.15fr_0.85fr] lg:gap-5">
            <div className="relative min-h-[300px] overflow-hidden border border-white/10 bg-[#151515] sm:min-h-[420px]">
              <img src={artwork.coaching} alt="Elite strength coaching in a premium training environment" loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover" />
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

        <section className="home-deferred-section bg-[#080808] py-7 sm:py-8">
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
