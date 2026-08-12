import React from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import {
  ArrowUpRight,
  BadgeCheck,
  Check,
  ChevronRight,
  LockKeyhole,
  Package,
  ShieldCheck,
  Sparkles,
  Truck,
} from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import ProductCard from "@/components/ProductCard";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const brandAssets = {
  logo: "/manus-storage/gorilla-gear-hero-logo_22421c52.jpeg",
  categories: {
    peptides: "/manus-storage/peptides_012076bb.jpg",
    injectables: "/manus-storage/injectable-oils_6ddb2648.jpg",
    orals: "/manus-storage/orals_8eb932e8.jpg",
    anabolics: "/manus-storage/oral-anabolics_21b30f67.jpg",
  },
};

const categories = [
  { name: "Peptides", eyebrow: "Precision support", image: brandAssets.categories.peptides },
  { name: "Injectable oils", eyebrow: "Performance range", image: brandAssets.categories.injectables },
  { name: "Orals", eyebrow: "Focused formulas", image: brandAssets.categories.orals },
  { name: "Oral anabolics", eyebrow: "Member catalogue", image: brandAssets.categories.anabolics },
];

const processSteps = [
  { number: "01", title: "Apply", description: "Complete the membership application with your details." },
  { number: "02", title: "Verify", description: "Our team reviews each application before access is granted." },
  { number: "03", title: "Get approved", description: "Approved members unlock private pricing and ordering." },
  { number: "04", title: "Request a quote", description: "Build your selection and submit a quote request for review." },
];

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const isApproved = (user as any)?.status === "approved";
  const isPending = (user as any)?.status === "pending";

  const featuredQuery = trpc.products.listPage.useQuery({ featuredOnly: true, limit: 4, offset: 0 });
  const allProductsQuery = trpc.products.listPage.useQuery(
    { limit: 4, offset: 0 },
    { enabled: !!(featuredQuery.data && featuredQuery.data.items.length < 4) },
  );
  const displayProducts = featuredQuery.data && featuredQuery.data.items.length >= 1
    ? featuredQuery.data.items
    : allProductsQuery.data?.items ?? [];

  return (
    <div className="min-h-screen bg-[#f7f5f0] text-[#161616]">
      <Navbar />

      <main>
        <section className="relative overflow-hidden border-b border-black/10 bg-[#f7f5f0]">
          <div className="pointer-events-none absolute -right-28 top-20 h-72 w-72 rounded-full bg-[#d8f36f]/55 blur-3xl" />
          <div className="pointer-events-none absolute -left-20 bottom-0 h-64 w-64 rounded-full bg-[#e4a28f]/25 blur-3xl" />
          <div className="container relative pb-14 pt-24 sm:pb-20 sm:pt-20 lg:py-24">
            <div className="grid items-center gap-10 sm:gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20">
              <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="mb-5 inline-flex max-w-full items-center gap-2 rounded-full border border-black/15 bg-white/65 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.22em] text-black/65">
                  <span className="h-2 w-2 rounded-full bg-[#d7472f]" />
                  Premium performance nutrition
                </div>
                <h1 className="max-w-3xl text-[clamp(2.9rem,14vw,6.8rem)] sm:text-[clamp(3.2rem,8vw,6.8rem)] font-black uppercase leading-[0.86] tracking-[-0.075em] text-[#101010]">
                  Fuel your
                  <span className="block text-[#d7472f]">potential.</span>
                  <span className="mt-2 block text-[0.68em] tracking-[-0.055em]">Built to perform.</span>
                </h1>
                <p className="mt-6 max-w-xl text-[15px] leading-7 text-black/62 sm:mt-7 sm:text-lg">
                  Gorilla Gear Nutrition is a private South African catalogue for serious athletes and dedicated fitness enthusiasts. Apply for access to browse the range and request a tailored quote.
                </p>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  {!isAuthenticated ? (
                    <>
                      <Link href="/register" className="w-full no-underline sm:w-auto">
                        <Button size="lg" className="h-12 w-full rounded-sm bg-[#111111] px-7 text-xs font-extrabold uppercase tracking-[0.16em] text-white hover:bg-[#d7472f] sm:w-auto">
                          Apply for membership
                          <ArrowUpRight className="ml-2 h-4 w-4" />
                        </Button>
                      </Link>
                      <Link href="/products" className="w-full no-underline sm:w-auto">
                        <Button size="lg" variant="outline" className="h-12 w-full rounded-sm border-black/25 bg-transparent px-7 text-xs font-extrabold uppercase tracking-[0.16em] text-[#111111] hover:border-black hover:bg-white sm:w-auto">
                          Browse products
                        </Button>
                      </Link>
                    </>
                  ) : isPending ? (
                    <div className="inline-flex items-center gap-3 rounded-sm border border-[#d7472f]/30 bg-[#d7472f]/8 px-5 py-3 text-xs font-extrabold uppercase tracking-[0.13em] text-[#b33c28]">
                      <span className="h-2 w-2 animate-pulse rounded-full bg-[#d7472f]" />
                      Application pending review
                    </div>
                  ) : isApproved ? (
                    <Link href="/products" className="w-full no-underline sm:w-auto">
                      <Button size="lg" className="h-12 w-full rounded-sm sm:w-auto bg-[#111111] px-7 text-xs font-extrabold uppercase tracking-[0.16em] text-white hover:bg-[#d7472f]">
                        Enter member catalogue
                        <ArrowUpRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  ) : null}
                </div>
                <div className="mt-8 grid max-w-xl grid-cols-2 gap-x-4 gap-y-4 border-t border-black/15 pt-6 sm:mt-10 sm:grid-cols-4 sm:gap-x-6">
                  {[
                    { icon: ShieldCheck, label: "Verified range" },
                    { icon: LockKeyhole, label: "Private access" },
                    { icon: Truck, label: "Fast delivery" },
                    { icon: BadgeCheck, label: "Member support" },
                  ].map(({ icon: Icon, label }) => (
                    <div key={label} className="flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[0.12em] text-black/56">
                      <Icon className="h-4 w-4 shrink-0 text-[#d7472f]" />
                      <span>{label}</span>
                    </div>
                  ))}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="relative mx-auto w-full max-w-lg"
              >
                <div className="absolute -right-3 top-8 h-16 w-3 bg-[#d7472f] sm:-right-6 sm:h-24 sm:w-4" />
                <div className="absolute -bottom-3 left-8 h-3 w-28 bg-[#111111] sm:-bottom-6 sm:left-12 sm:h-4 sm:w-40" />
                <div className="relative flex aspect-square w-full items-center justify-center">
                  <div className="absolute inset-0 opacity-50" style={{ backgroundImage: "radial-gradient(circle at 20% 20%, rgba(215,71,47,0.16) 0, transparent 27%), radial-gradient(circle at 80% 75%, rgba(216,243,111,0.48) 0, transparent 30%)" }} />
                  <img src={brandAssets.logo} alt="Gorilla Gear Nutrition illustrated gorilla logo" className="relative z-10 h-full w-full object-contain mix-blend-multiply drop-shadow-[0_20px_22px_rgba(0,0,0,0.18)]" />
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        <section className="bg-[#111111] py-5 text-white">
          <div className="container flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-white/55">Controlled access. Clear process. Serious standards.</p>
            <div className="flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#d8f36f]"><Sparkles className="h-4 w-4" /> Adults 18+ only</div>
          </div>
        </section>

        <section className="border-b border-black/10 bg-white py-14 sm:py-20 lg:py-24">
          <div className="container">
            <div className="mb-10 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
              <div>
                <p className="mb-3 text-[10px] font-extrabold uppercase tracking-[0.24em] text-[#d7472f]">Member catalogue</p>
                <h2 className="max-w-2xl text-4xl font-black uppercase leading-[0.92] tracking-[-0.05em] text-[#111111] sm:text-5xl">Explore the <span className="text-[#d7472f]">range.</span></h2>
              </div>
              <Link href="/products" className="group inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.15em] text-[#111111] no-underline">
                View all products <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
            {featuredQuery.isLoading ? (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {[...Array(4)].map((_, i) => <div key={i} className="h-72 animate-pulse rounded-2xl bg-[#ece9e2]" />)}
              </div>
            ) : displayProducts.length > 0 ? (
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {displayProducts.slice(0, 4).map((product: any) => <ProductCard key={product.id} product={product} isApproved={isApproved} />)}
              </motion.div>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-black/15 bg-[#f7f5f0] px-6 py-16 text-center">
                <Package className="mb-4 h-10 w-10 text-[#d7472f]" />
                <h3 className="text-xl font-black uppercase tracking-[-0.03em]">The new range is on its way</h3>
                <p className="mt-2 max-w-md text-sm leading-6 text-black/55">Product data and catalogue imagery can be re-uploaded from the admin panel when you are ready to load the Gorilla Gear Nutrition range.</p>
                <Link href="/products" className="mt-6 no-underline"><Button variant="outline" className="rounded-sm border-black/25 text-xs font-extrabold uppercase tracking-[0.15em]">Open catalogue <ArrowUpRight className="ml-2 h-4 w-4" /></Button></Link>
              </div>
            )}
          </div>
        </section>

        <section className="border-b border-black/10 bg-[#f7f5f0] py-14 sm:py-20 lg:py-24">
          <div className="container">
            <div className="mb-10 max-w-xl">
              <p className="mb-3 text-[10px] font-extrabold uppercase tracking-[0.24em] text-[#d7472f]">Browse by category</p>
              <h2 className="text-4xl font-black uppercase leading-[0.92] tracking-[-0.05em] text-[#111111] sm:text-5xl">Find your <span className="text-[#d7472f]">focus.</span></h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {categories.map((category, index) => (
                <Link key={category.name} href="/products" className="group relative min-h-[220px] overflow-hidden rounded-2xl sm:min-h-[260px] bg-[#111111] no-underline">
                  <img src={category.image} alt={category.name} className="absolute inset-0 h-full w-full object-cover opacity-70 transition duration-500 group-hover:scale-105 group-hover:opacity-85" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/25 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                    <div className="mb-2 flex items-center justify-between text-[9px] font-extrabold uppercase tracking-[0.18em] text-[#d8f36f]"><span>0{index + 1}</span><ArrowUpRight className="h-4 w-4" /></div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/65">{category.eyebrow}</p>
                    <h3 className="mt-1 text-2xl font-black uppercase leading-none tracking-[-0.04em]">{category.name}</h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="border-b border-black/10 bg-white py-14 sm:py-20 lg:py-24">
          <div className="container">
            <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
              <div>
                <p className="mb-3 text-[10px] font-extrabold uppercase tracking-[0.24em] text-[#d7472f]">How it works</p>
                <h2 className="text-4xl font-black uppercase leading-[0.92] tracking-[-0.05em] text-[#111111] sm:text-5xl">Access is <span className="text-[#d7472f]">earned.</span></h2>
                <p className="mt-6 max-w-md text-base leading-7 text-black/58">Gorilla Gear Nutrition is a gated platform. We keep the catalogue private so approved members can shop with a clear, supported process.</p>
                <Link href="/register" className="mt-8 inline-flex no-underline"><Button className="rounded-sm bg-[#111111] text-xs font-extrabold uppercase tracking-[0.15em] text-white hover:bg-[#d7472f]">Start your application <ArrowUpRight className="ml-2 h-4 w-4" /></Button></Link>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {processSteps.map((step) => (
                  <div key={step.number} className="rounded-2xl border border-black/10 bg-[#f7f5f0] p-6">
                    <div className="mb-10 flex items-start justify-between"><span className="text-4xl font-black tracking-[-0.06em] text-[#d7472f]">{step.number}</span><Check className="h-5 w-5 text-black/30" /></div>
                    <h3 className="text-lg font-black uppercase tracking-[-0.03em]">{step.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-black/55">{step.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="bg-[#111111] py-12 text-white sm:py-16 lg:py-20">
          <div className="container">
            <div className="relative overflow-hidden rounded-[1.5rem] border border-white/10 bg-[#191919] px-5 py-10 text-center sm:rounded-[2rem] sm:px-10 sm:py-14">
              <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-[#d8f36f]/15 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-28 -left-20 h-72 w-72 rounded-full bg-[#d7472f]/20 blur-3xl" />
              <div className="relative">
                <p className="mb-4 text-[10px] font-extrabold uppercase tracking-[0.24em] text-[#d8f36f]">Your next phase starts here</p>
                <h2 className="mx-auto max-w-3xl text-4xl font-black uppercase leading-[0.9] tracking-[-0.055em] sm:text-6xl">Ready to fuel your <span className="text-[#d7472f]">potential?</span></h2>
                <p className="mx-auto mt-6 max-w-xl text-base leading-7 text-white/60">Apply for membership, get verified, and access the Gorilla Gear Nutrition catalogue built for dedicated performance.</p>
                {!isAuthenticated && <Link href="/register" className="mt-8 inline-flex w-full justify-center no-underline sm:w-auto"><Button size="lg" className="h-12 rounded-sm bg-[#d7472f] px-8 text-xs font-extrabold uppercase tracking-[0.16em] text-white hover:bg-[#ef6447]">Get started today <ArrowUpRight className="ml-2 h-4 w-4" /></Button></Link>}
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
