import React from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Lock, PackageOpen, Ruler, Shirt } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "wouter";

export default function ApparelShop() {
  const { user } = useAuth();
  const isApproved = (user as any)?.status === "approved";
  const categoriesQuery = trpc.categories.list.useQuery();
  const clothingCategory = (categoriesQuery.data ?? []).find((category) => category.slug === "clothing");
  const productsQuery = trpc.products.listPage.useQuery(
    { categoryId: clothingCategory?.id, limit: 24, offset: 0 },
    { enabled: Boolean(clothingCategory) },
  );
  const products = productsQuery.data?.items ?? [];

  return (
    <div className="min-h-screen bg-[#080808] text-white">
      <Navbar />
      <main className="pt-20">
        <section className="border-b border-white/10 bg-[radial-gradient(circle_at_78%_15%,rgba(201,154,61,0.17),transparent_28%),linear-gradient(135deg,#070707_0%,#12100d_100%)] py-12 sm:py-16">
          <div className="container">
            <Link href="/" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-white/55 no-underline transition-colors hover:text-[#c99a3d]">
              <ArrowLeft className="h-3.5 w-3.5" /> Back to home
            </Link>
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="mt-8 max-w-3xl text-center sm:text-left">
              <p className="text-[10px] font-black uppercase tracking-[0.28em] text-[#c99a3d]">Gorilla Gear apparel</p>
              <h1 className="mt-3 text-4xl font-black uppercase leading-[0.9] tracking-[-0.06em] text-white sm:text-6xl">The <span className="text-[#c99a3d]">Apparel</span> Shop</h1>
              <p className="mx-auto mt-5 max-w-2xl text-sm leading-6 text-white/65 sm:mx-0 sm:text-base sm:leading-7">Heavyweight training apparel built to move with purpose. Choose your colour, select your size, and add it to your member quote.</p>
            </motion.div>
            <div className="mt-8 grid gap-3 sm:grid-cols-3 sm:max-w-3xl">
              {[{ icon: Shirt, label: "220gsm heavyweight" }, { icon: Ruler, label: "Sizes S–4XL" }, { icon: PackageOpen, label: "50 per size, per colour" }].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center justify-center gap-2 border border-white/10 bg-black/25 px-4 py-3 text-center text-xs font-bold uppercase tracking-wide text-white/80 sm:justify-start sm:text-left"><Icon className="h-4 w-4 text-[#c99a3d]" />{label}</div>
              ))}
            </div>
          </div>
        </section>

        {!isApproved && (
          <section className="border-b border-[#c99a3d]/25 bg-[#c99a3d]/10 py-3">
            <div className="container flex flex-col items-center justify-between gap-3 text-center sm:flex-row sm:text-left">
              <p className="flex items-center gap-2 text-sm text-white/70"><Lock className="h-4 w-4 shrink-0 text-[#c99a3d]" />Apply for member access to view pricing and add apparel to a quote.</p>
              <Link href="/register" className="no-underline"><Button className="min-h-10 rounded-none bg-[#c99a3d] px-4 text-xs font-black uppercase tracking-wide text-black hover:bg-[#e0b35a]">Apply for access</Button></Link>
            </div>
          </section>
        )}

        <section className="container py-10 sm:py-14">
          <div className="mb-7 flex flex-col items-center justify-between gap-3 text-center sm:flex-row sm:text-left">
            <div><p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#c99a3d]">Current drop</p><h2 className="mt-2 text-2xl font-black uppercase tracking-tight text-white sm:text-3xl">Training T-shirts</h2></div>
            <Link href="/products" className="no-underline"><Button variant="outline" className="min-h-11 border-white/25 bg-transparent text-xs font-bold uppercase tracking-wide text-white hover:border-[#c99a3d] hover:bg-white/5 hover:text-white">Full member catalogue</Button></Link>
          </div>

          {categoriesQuery.isLoading || productsQuery.isLoading ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2"><div className="h-96 animate-pulse border border-white/10 bg-[#111111]" /><div className="h-96 animate-pulse border border-white/10 bg-[#111111]" /></div>
          ) : products.length > 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              {products.map((product) => <ProductCard key={product.id} product={product} isApproved={isApproved} />)}
            </motion.div>
          ) : (
            <div className="border border-dashed border-white/15 bg-[#111111] px-6 py-16 text-center"><PackageOpen className="mx-auto h-10 w-10 text-[#c99a3d]" /><p className="mt-4 text-lg font-bold text-white">No apparel is currently listed.</p><p className="mt-2 text-sm text-white/55">Please check back soon for the next Gorilla Gear drop.</p></div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}
