import React from "react";
import { Link } from "wouter";
import { ArrowLeft, ArrowRight, Lock, PackageOpen } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";

const apparelArtwork = "/api/media/ggn-clothing-mannequin_b7e2bdb6.png";

export default function ApparelShop() {
  const { user } = useAuth();
  const isApproved = (user as any)?.status === "approved";
  const categoriesQuery = trpc.categories.list.useQuery();
  const clothingCategory = (categoriesQuery.data ?? []).find((category) => category.slug === "clothing");
  const productsQuery = trpc.products.listPage.useQuery(
    { categoryId: clothingCategory?.id, limit: 48, offset: 0 },
    { enabled: Boolean(clothingCategory) },
  );

  const products = productsQuery.data?.items ?? [];
  const totalProducts = productsQuery.data?.total ?? 0;
  const loading = categoriesQuery.isLoading || productsQuery.isLoading;

  return (
    <div className="min-h-screen bg-[#080808] text-white">
      <Navbar />
      <main className="pt-16">
        <section className="relative isolate overflow-hidden border-b border-white/10 bg-[#0d0d0d] py-14 sm:py-18 lg:py-20">
          <img src={apparelArtwork} alt="Gorilla Gear performance apparel on a mannequin" className="absolute inset-0 h-full w-full object-cover object-[center_18%] opacity-55" />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(8,8,8,0.98)_0%,rgba(8,8,8,0.88)_43%,rgba(8,8,8,0.45)_100%)]" />
          <div className="container relative">
            <Link href="/" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-white/65 no-underline transition-colors hover:text-[#c99a3d]"><ArrowLeft className="h-3.5 w-3.5" /> Back to collections</Link>
            <div className="mt-10 max-w-xl text-center sm:text-left">
              <p className="text-[10px] font-black uppercase tracking-[0.28em] text-[#c99a3d]">Performance apparel</p>
              <h1 className="mt-3 text-4xl font-black uppercase leading-none tracking-[-0.06em] text-white sm:text-6xl">Apparel <span className="text-[#c99a3d]">shop</span></h1>
              <p className="mx-auto mt-5 max-w-md text-sm leading-6 text-white/72 sm:mx-0 sm:text-base">Premium Gorilla Gear pieces designed for training, discipline, and life beyond the gym.</p>
              <p className="mt-6 text-[10px] font-black uppercase tracking-[0.2em] text-white/65">{loading ? "Loading collection" : `${totalProducts} ${totalProducts === 1 ? "product" : "products"} in this collection`}</p>
            </div>
          </div>
        </section>

        {!isApproved && (
          <section className="border-b border-[#c99a3d]/25 bg-[#c99a3d]/8 py-3">
            <div className="container flex flex-col items-center gap-3 text-center sm:flex-row sm:justify-between sm:text-left">
              <p className="flex items-center justify-center gap-2 text-sm text-white/65 sm:justify-start"><Lock className="h-4 w-4 text-[#c99a3d]" /> Browse freely. Member approval is required before requesting a quote.</p>
              <Link href="/register" className="no-underline"><Button size="sm" className="h-10 rounded-none bg-[#c99a3d] px-4 text-[10px] font-black uppercase tracking-[0.14em] text-black hover:bg-[#e0b35a]">Apply now</Button></Link>
            </div>
          </section>
        )}

        <section className="container py-10 sm:py-14">
          <div className="mb-7 flex flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#c99a3d]">Public collection</p>
              <h2 className="mt-2 text-2xl font-black uppercase tracking-[-0.045em] text-white sm:text-3xl">Explore apparel</h2>
            </div>
            {isApproved && <Link href="/products" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.16em] text-white/70 no-underline transition-colors hover:text-[#c99a3d]">View full catalogue <ArrowRight className="h-3.5 w-3.5" /></Link>}
          </div>

          {loading ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{[0, 1, 2, 3].map((index) => <div key={index} className="h-80 animate-pulse border border-white/10 bg-white/[0.035]" />)}</div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{products.map((product, index) => <ProductCard key={product.id} product={product} isApproved={isApproved} prioritizeImage={index < 3} />)}</div>
          ) : (
            <div className="border border-dashed border-white/20 bg-white/[0.025] px-6 py-16 text-center"><PackageOpen className="mx-auto h-10 w-10 text-[#c99a3d]" strokeWidth={1.3} /><h2 className="mt-5 text-xl font-black uppercase text-white">Collection in progress</h2><p className="mx-auto mt-3 max-w-md text-sm leading-6 text-white/60">Apparel products will appear here as soon as they are added to the Clothing category.</p></div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}
