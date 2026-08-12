import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Shield, Truck, CreditCard, Lock, ChevronRight, Star, Package, FlaskConical, Pill, Syringe } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const isApproved = (user as any)?.status === "approved";
  const isPending = (user as any)?.status === "pending";

  // Fetch featured products; fall back to all products if fewer than 4 featured
  const featuredQuery = trpc.products.list.useQuery({ featuredOnly: true });
  const allProductsQuery = trpc.products.list.useQuery(
    {},
    { enabled: !!(featuredQuery.data && featuredQuery.data.length < 4) }
  );
  const displayProducts = featuredQuery.data && featuredQuery.data.length >= 1
    ? featuredQuery.data
    : allProductsQuery.data ?? [];

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <Navbar />

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden pt-16">
        {/* Hex pattern background */}
        <div className="absolute inset-0 hex-pattern opacity-60" />

        {/* Blue glow top-right */}
        <div className="absolute top-0 right-0 w-[700px] h-[700px] rounded-full opacity-10 blur-3xl pointer-events-none"
          style={{ background: "radial-gradient(circle, #0EA5E9 0%, transparent 70%)" }} />

        {/* Red glow bottom-left */}
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full opacity-8 blur-3xl pointer-events-none"
          style={{ background: "radial-gradient(circle, #E11D48 0%, transparent 70%)" }} />

        <div className="container relative z-10 py-20 md:py-28">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Text */}
            <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#0EA5E9]/30 bg-[#0EA5E9]/10 mb-6">
                <Lock className="h-3.5 w-3.5 text-[#0EA5E9]" />
                <span className="text-xs font-bold uppercase tracking-widest text-[#0EA5E9]">Restricted Access Platform</span>
              </div>

              {/* Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black uppercase tracking-tight leading-[0.9] mb-6 break-words">
                <span className="text-white">Unlock Your</span>
                <br />
                <span className="text-white">Next </span>
                <span style={{ color: "#0EA5E9" }}>Phase</span>
                <br />
                <span className="text-white">of Performance</span>
              </h1>

              <p className="text-[#94A3B8] text-lg md:text-xl leading-relaxed mb-8 max-w-xl">
                Premium pharmaceutical-grade compounds by <strong className="text-white">HD Labs</strong>. Controlled access. Built for serious athletes who demand the highest quality.
              </p>

              {/* CTA */}
              {!isAuthenticated ? (
                <div className="flex flex-wrap gap-3">
                  <Link href="/register" className="no-underline">
                    <Button size="lg" className="text-white font-bold uppercase tracking-widest px-8 h-12"
                      style={{ background: "linear-gradient(135deg, #0EA5E9, #0284C7)" }}>
                      Apply for Access
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </Link>
                  <Link href="/login" className="no-underline">
                    <Button size="lg" variant="outline"
                      className="border-[#1E293B] text-[#94A3B8] hover:text-white hover:border-[#0EA5E9]/50 font-bold uppercase tracking-widest px-8 h-12 bg-transparent">
                      Sign In
                    </Button>
                  </Link>
                </div>
              ) : isPending ? (
                <div className="inline-flex items-center gap-3 px-6 py-3 rounded border border-[#E11D48]/30 bg-[#E11D48]/10">
                  <div className="w-2 h-2 rounded-full bg-[#E11D48] animate-pulse" />
                  <span className="text-[#E11D48] font-bold uppercase tracking-wide text-sm">Application Pending Review</span>
                </div>
              ) : isApproved ? (
                <Link href="/products" className="no-underline">
                  <Button size="lg" className="text-white font-bold uppercase tracking-widest px-8 h-12"
                    style={{ background: "linear-gradient(135deg, #0EA5E9, #0284C7)" }}>
                    Browse Products
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              ) : null}

              {/* Trust badges */}
              <div className="flex flex-wrap gap-6 mt-10 pt-8 border-t border-[#1E293B]">
                {[
                  { icon: Shield, label: "Verified Products" },
                  { icon: CreditCard, label: "Secure Payments" },
                  { icon: Truck, label: "Discreet Delivery" },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-2 text-[#64748B]">
                    <Icon className="h-4 w-4 text-[#0EA5E9]" />
                    <span className="text-sm font-medium">{label}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Right: Visual panel */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="hidden lg:flex items-center justify-center"
            >
              <div className="relative w-full max-w-md">
                {/* Main card */}
                <div className="rounded-xl border border-[#0EA5E9]/20 bg-[#0A0A0A] p-8 relative overflow-hidden"
                  style={{ boxShadow: "0 0 60px rgba(14,165,233,0.08), 0 0 120px rgba(14,165,233,0.04)" }}>
                  {/* Top stripe */}
                  <div className="absolute top-0 left-0 right-0 h-[3px]"
                    style={{ background: "linear-gradient(90deg, #E11D48 0%, #E11D48 35%, #0EA5E9 35%, #0EA5E9 100%)" }} />

                  <div className="hex-pattern absolute inset-0 opacity-30" />

                  <div className="relative z-10">
                    {/* HD Labs logo mark */}
                    <div className="flex items-center gap-3 mb-8">
                      <div className="w-12 h-12 rounded flex items-center justify-center font-black text-white text-lg"
                        style={{ background: "linear-gradient(135deg, #0EA5E9, #0284C7)" }}>
                        HD
                      </div>
                      <div>
                        <div className="text-white font-black uppercase tracking-widest text-sm">HD Labs</div>
                        <div className="text-[#64748B] text-xs uppercase tracking-widest">Pharmaceutical Grade</div>
                      </div>
                    </div>

                    {/* Category pills */}
                    <div className="grid grid-cols-3 gap-3 mb-8">
                      {[
                        { icon: Syringe, label: "Injectables", color: "#0EA5E9" },
                        { icon: Pill, label: "Orals", color: "#E11D48" },
                        { icon: FlaskConical, label: "Peptides", color: "#0EA5E9" },
                      ].map(({ icon: Icon, label, color }) => (
                        <div key={label} className="flex flex-col items-center gap-2 p-4 rounded border border-[#1E293B] bg-[#111111]">
                          <div className="w-8 h-8 rounded flex items-center justify-center"
                            style={{ background: `${color}15` }}>
                            <Icon className="h-4 w-4" style={{ color }} />
                          </div>
                          <span className="text-[10px] font-bold uppercase tracking-widest text-[#64748B]">{label}</span>
                        </div>
                      ))}
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { value: "100+", label: "Products" },
                        { value: "ZAR", label: "Currency" },
                        { value: "Free", label: "PE Delivery" },
                        { value: "R150", label: "Nationwide" },
                      ].map(({ value, label }) => (
                        <div key={label} className="p-3 rounded border border-[#1E293B] bg-[#080808]">
                          <div className="text-xl font-black text-white">{value}</div>
                          <div className="text-[10px] font-bold uppercase tracking-widest text-[#64748B]">{label}</div>
                        </div>
                      ))}
                    </div>

                    {/* Access badge */}
                    <div className="mt-4 flex items-center gap-2 px-4 py-2.5 rounded border border-[#E11D48]/30 bg-[#E11D48]/8">
                      <Lock className="h-3.5 w-3.5 text-[#E11D48] flex-shrink-0" />
                      <span className="text-xs font-bold uppercase tracking-widest text-[#E11D48]">Approved Members Only</span>
                    </div>
                  </div>
                </div>

                {/* Floating accent dots */}
                <div className="absolute -top-4 -right-4 w-3 h-3 rounded-full" style={{ background: "#0EA5E9" }} />
                <div className="absolute -bottom-4 -left-4 w-3 h-3 rounded-full" style={{ background: "#E11D48" }} />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Featured Products ────────────────────────────────────────────── */}
      <section className="py-20 border-t border-[#1E293B]">
        <div className="container">
          <div className="flex items-center justify-between mb-10">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-0.5" style={{ background: "#E11D48" }} />
                <span className="text-xs font-bold uppercase tracking-widest text-[#E11D48]">Featured</span>
              </div>
              <h2 className="text-3xl font-black uppercase tracking-tight text-white">
                Top <span style={{ color: "#0EA5E9" }}>Compounds</span>
              </h2>
            </div>
            <Link href="/products" className="no-underline">
              <Button variant="ghost" size="sm"
                className="text-[#0EA5E9] hover:text-white hover:bg-[#0EA5E9]/10 font-bold uppercase tracking-wide text-xs">
                View All <ChevronRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </Link>
          </div>

            {featuredQuery.isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-72 rounded-lg bg-[#111111] animate-pulse border border-[#1E293B]" />
                ))}
              </div>
            ) : displayProducts.length > 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className={`grid gap-5 ${
                  displayProducts.length === 1
                    ? 'grid-cols-1 max-w-xs'
                    : displayProducts.length === 2
                    ? 'grid-cols-1 sm:grid-cols-2 max-w-xl'
                    : displayProducts.length === 3
                    ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
                    : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
                }`}
              >
                {displayProducts.map((product: any) => (
                  <ProductCard key={product.id} product={product} isApproved={isApproved} />
                ))}
              </motion.div>
            ) : (
              <div className="text-center py-16 text-[#64748B]">
                <Package className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm">No products yet.</p>
              </div>
            )}
        </div>
      </section>

      {/* ── Features Grid ────────────────────────────────────────────────── */}
      <section className="py-20 border-t border-[#1E293B]">
        <div className="container">
          <div className="text-center mb-14">
            <div className="flex items-center justify-center gap-2 mb-3">
              <div className="w-8 h-0.5" style={{ background: "#E11D48" }} />
              <span className="text-xs font-bold uppercase tracking-widest text-[#E11D48]">Why Anabolics Africa</span>
              <div className="w-8 h-0.5" style={{ background: "#0EA5E9" }} />
            </div>
            <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight text-white">
              Built for <span style={{ color: "#0EA5E9" }}>Serious</span> Athletes
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                icon: Shield,
                color: "#0EA5E9",
                title: "Pharmaceutical Grade",
                desc: "Every compound is sourced directly from HD Labs — tested, verified, and manufactured to the highest pharmaceutical standards.",
              },
              {
                icon: Lock,
                color: "#E11D48",
                title: "Gated Access",
                desc: "Not open to the public. Every account is manually reviewed and approved before gaining access to pricing and purchasing.",
              },
              {
                icon: Truck,
                color: "#0EA5E9",
                title: "Discreet Delivery",
                desc: "Free delivery to Port Elizabeth. Flat R150 nationwide. All orders shipped in plain, unmarked packaging.",
              },
              {
                icon: CreditCard,
                color: "#E11D48",
                title: "Secure Payments",
                desc: "Approved quotes can be settled securely by EFT or PayFast in South African Rand.",
              },
              {
                icon: Star,
                color: "#0EA5E9",
                title: "HD Labs Exclusive",
                desc: "Authorised distributor of HD Labs products. Authentic compounds with full batch verification available.",
              },
              {
                icon: Package,
                color: "#E11D48",
                title: "100+ Products",
                desc: "Injectables, orals, peptides, ancillaries and PCT — everything you need in one controlled-access platform.",
              },
            ].map(({ icon: Icon, color, title, desc }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="p-6 rounded-lg border border-[#1E293B] bg-[#111111] hover:border-[#0EA5E9]/30 transition-colors"
              >
                <div className="w-10 h-10 rounded flex items-center justify-center mb-4"
                  style={{ background: `${color}15`, border: `1px solid ${color}30` }}>
                  <Icon className="h-5 w-5" style={{ color }} />
                </div>
                <h3 className="text-white font-bold uppercase tracking-wide text-sm mb-2">{title}</h3>
                <p className="text-[#64748B] text-sm leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Delivery Info Banner ─────────────────────────────────────────── */}
      <section className="py-12 border-t border-[#1E293B]">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-5">
            <div className="flex items-center gap-5 p-6 rounded-lg border border-[#0EA5E9]/20 bg-[#0EA5E9]/5">
              <div className="w-12 h-12 rounded flex items-center justify-center flex-shrink-0"
                style={{ background: "#0EA5E915", border: "1px solid #0EA5E930" }}>
                <Truck className="h-6 w-6" style={{ color: "#0EA5E9" }} />
              </div>
              <div>
                <div className="text-white font-black uppercase tracking-wide text-sm mb-1">Free Delivery — Port Elizabeth</div>
                <div className="text-[#64748B] text-sm">All orders within Port Elizabeth ship free, no minimum order required.</div>
              </div>
            </div>
            <div className="flex items-center gap-5 p-6 rounded-lg border border-[#E11D48]/20 bg-[#E11D48]/5">
              <div className="w-12 h-12 rounded flex items-center justify-center flex-shrink-0"
                style={{ background: "#E11D4815", border: "1px solid #E11D4830" }}>
                <Truck className="h-6 w-6" style={{ color: "#E11D48" }} />
              </div>
              <div>
                <div className="text-white font-black uppercase tracking-wide text-sm mb-1">R150 Flat Rate — Nationwide</div>
                <div className="text-[#64748B] text-sm">Flat R150 delivery fee for all other South African locations.</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA Banner ───────────────────────────────────────────────────── */}
      {!isAuthenticated && (
        <section className="py-16 border-t border-[#1E293B]">
          <div className="container">
            <div className="relative rounded-xl overflow-hidden p-10 md:p-16 text-center"
              style={{ background: "linear-gradient(135deg, #080808 0%, #0d1a2e 50%, #080808 100%)", border: "1px solid rgba(14,165,233,0.15)" }}>
              <div className="absolute inset-0 hex-pattern opacity-40" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[200px] rounded-full opacity-15 blur-3xl pointer-events-none"
                style={{ background: "radial-gradient(ellipse, #0EA5E9 0%, transparent 70%)" }} />

              <div className="relative z-10">
                <div className="h-[3px] w-16 mx-auto mb-6"
                  style={{ background: "linear-gradient(90deg, #E11D48 0%, #E11D48 50%, #0EA5E9 50%, #0EA5E9 100%)" }} />
                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-white mb-4">
                  Ready to <span style={{ color: "#0EA5E9" }}>Elevate</span>?
                </h2>
                <p className="text-[#94A3B8] text-lg mb-8 max-w-xl mx-auto">
                  Apply for access today. Approvals are reviewed within 24 hours.
                </p>
                <Link href="/register" className="no-underline">
                  <Button size="lg" className="text-white font-bold uppercase tracking-widest px-10 h-12"
                    style={{ background: "linear-gradient(135deg, #0EA5E9, #0284C7)" }}>
                    Apply Now
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
}
