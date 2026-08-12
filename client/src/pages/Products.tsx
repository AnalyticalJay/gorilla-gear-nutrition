import React from "react";
import { trpc } from "@/lib/trpc";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, SlidersHorizontal, Lock, X, RotateCcw, ChevronDown, Tag, DollarSign } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { BrandFilter, AVAILABLE_BRANDS, matchesBrand, matchesPriceRange } from "@/lib/productFilters";
import { useAuth } from "@/_core/hooks/useAuth";

export default function Products() {
  const { user } = useAuth();
  const isApproved = (user as any)?.status === "approved";
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<number | undefined>();
  const [selectedBrand, setSelectedBrand] = useState<BrandFilter>("all");
  const [maxPrice, setMaxPrice] = useState<number>(0); // 0 means any price
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const categoriesQuery = trpc.categories.list.useQuery();
  const productsQuery = trpc.products.list.useQuery({
    categoryId: selectedCategory,
    search: search || undefined,
  });

  const products = productsQuery.data ?? [];
  const categories = categoriesQuery.data ?? [];

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      if (!matchesBrand(product, selectedBrand)) return false;
      if (!matchesPriceRange(product, maxPrice)) return false;
      return true;
    });
  }, [products, selectedBrand, maxPrice]);

  const activeFilterCount = Number(Boolean(search)) + Number(selectedCategory !== undefined) + Number(selectedBrand !== "all") + Number(maxPrice > 0);
  const selectedCategoryName = categories.find((category) => category.id === selectedCategory)?.name;

  const clearFilters = () => {
    setSearch("");
    setSelectedCategory(undefined);
    setSelectedBrand("all");
    setMaxPrice(0);
  };

  const filterPanel = (
    <div className="space-y-6">
      <div className="flex items-center justify-between lg:hidden">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#0EA5E9]">Catalog filters</p>
          <h2 className="mt-1 text-lg font-black uppercase text-white">Find a product</h2>
        </div>
        <button onClick={() => setMobileFiltersOpen(false)} className="flex h-11 w-11 items-center justify-center rounded border border-[#1E293B] text-[#94A3B8] hover:text-white" aria-label="Close filters">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div>
        <label htmlFor="product-search" className="mb-2 block text-xs font-bold uppercase tracking-widest text-[#94A3B8]">Search products</label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748B]" />
          <Input
            id="product-search"
            placeholder="Name, compound, or dosage"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="border-[#1E293B] bg-[#0A0A0A] pl-9 text-white placeholder:text-[#475569] focus:border-[#0EA5E9]/60"
          />
        </div>
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <p className="text-xs font-bold uppercase tracking-widest text-[#94A3B8]">Brand</p>
          <Tag className="h-4 w-4 text-[#E11D48]" />
        </div>
        <div className="max-h-60 space-y-1.5 overflow-y-auto pr-1">
          {AVAILABLE_BRANDS.map((brand) => {
            const active = selectedBrand === brand;
            const label = brand === "all" ? "All brands" : brand;
            return (
              <button
                key={brand}
                onClick={() => setSelectedBrand(brand)}
                className={`flex min-h-10 w-full items-center justify-between rounded border px-3 py-2 text-left text-xs font-bold transition-colors ${active ? "border-[#0EA5E9]/60 bg-[#0EA5E9]/10 text-white" : "border-[#1E293B] text-[#64748B] hover:border-[#0EA5E9]/40 hover:text-white"}`}
              >
                <span className="truncate">{label}</span>
                <span className={`h-2 w-2 flex-shrink-0 rounded-full ${active ? "bg-[#0EA5E9]" : "bg-[#334155]"}`} />
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <p className="text-xs font-bold uppercase tracking-widest text-[#94A3B8]">Category</p>
          <ChevronDown className="h-4 w-4 text-[#0EA5E9]" />
        </div>
        <div className="max-h-60 space-y-1 overflow-y-auto pr-1">
          <button
            onClick={() => setSelectedCategory(undefined)}
            className={`flex min-h-10 w-full items-center justify-between rounded px-3 py-2 text-left text-xs font-semibold transition-colors ${selectedCategory === undefined ? "bg-[#E11D48]/10 text-[#E11D48]" : "text-[#64748B] hover:bg-white/5 hover:text-white"}`}
          >
            <span>All categories</span>
            {selectedCategory === undefined && <span className="text-[10px]">Active</span>}
          </button>
          {categories.map((category) => {
            const active = selectedCategory === category.id;
            return (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(active ? undefined : category.id)}
                className={`flex min-h-10 w-full items-center justify-between rounded px-3 py-2 text-left text-xs font-semibold transition-colors ${active ? "bg-[#E11D48]/10 text-[#E11D48]" : "text-[#64748B] hover:bg-white/5 hover:text-white"}`}
              >
                <span className="truncate">{category.name}</span>
                {active && <span className="text-[10px]">Active</span>}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <p className="text-xs font-bold uppercase tracking-widest text-[#94A3B8]">Max Price (ZAR)</p>
          <DollarSign className="h-4 w-4 text-[#0EA5E9]" />
        </div>
        <div className="space-y-2">
          {[
            { label: "Any price", value: 0 },
            { label: "Under R500", value: 500 },
            { label: "Under R1,000", value: 1000 },
            { label: "Under R2,000", value: 2000 },
          ].map((tier) => {
            const active = maxPrice === tier.value;
            return (
              <button
                key={tier.value}
                onClick={() => setMaxPrice(tier.value)}
                className={`flex min-h-10 w-full items-center justify-between rounded border px-3 py-2 text-left text-xs font-bold transition-colors ${active ? "border-[#0EA5E9]/60 bg-[#0EA5E9]/10 text-white" : "border-[#1E293B] text-[#64748B] hover:border-[#0EA5E9]/40 hover:text-white"}`}
              >
                <span>{tier.label}</span>
                <span className={`h-2 w-2 flex-shrink-0 rounded-full ${active ? "bg-[#0EA5E9]" : "bg-[#334155]"}`} />
              </button>
            );
          })}
        </div>
      </div>

      <Button onClick={clearFilters} variant="outline" className="min-h-11 w-full border-[#1E293B] text-[#94A3B8] hover:border-[#E11D48]/50 hover:bg-[#E11D48]/5 hover:text-white">
        <RotateCcw className="mr-2 h-4 w-4" /> Clear filters
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <Navbar />
      <div className="pt-16">
        <div className="border-b border-[#1E293B] bg-[#080808] py-12">
          <div className="container">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
              <div className="mb-5 h-[3px] w-16" style={{ background: "linear-gradient(90deg, #E11D48 0%, #E11D48 50%, #0EA5E9 50%, #0EA5E9 100%)" }} />
              <h1 className="mb-2 text-4xl font-black uppercase tracking-tight text-white">Product <span style={{ color: "#0EA5E9" }}>Catalog</span></h1>
              <p className="text-sm text-[#64748B]">{isApproved ? `${filteredProducts.length} premium products available` : "Prices hidden — get approved to view pricing and purchase"}</p>
            </motion.div>
          </div>
        </div>

        {!isApproved && (
          <div className="border-b py-3" style={{ borderColor: "#0EA5E9" + "30", background: "#0EA5E9" + "08" }}>
            <div className="container flex flex-col items-stretch gap-3 py-1 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2 text-sm text-[#64748B]"><Lock className="h-4 w-4 flex-shrink-0" style={{ color: "#0EA5E9" }} /><span>Prices are hidden. <strong className="text-white">Get approved</strong> to view pricing and add products to your quote cart.</span></div>
              <Link href="/register" className="no-underline"><Button size="sm" className="h-10 w-full flex-shrink-0 px-4 text-xs font-bold uppercase tracking-wide text-white sm:w-auto" style={{ background: "linear-gradient(135deg, #E11D48, #BE123C)" }}>Apply Now</Button></Link>
            </div>
          </div>
        )}

        <div className="container py-8">
          <div className="mb-6 flex items-center justify-between gap-3 lg:hidden">
            <button onClick={() => setMobileFiltersOpen(true)} className="inline-flex min-h-11 items-center gap-2 rounded border border-[#1E293B] bg-[#111111] px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-white hover:border-[#0EA5E9]/50">
              <SlidersHorizontal className="h-4 w-4 text-[#0EA5E9]" /> Filters {activeFilterCount > 0 && <span className="rounded-full bg-[#E11D48] px-2 py-0.5 text-[10px]">{activeFilterCount}</span>}
            </button>
            <span className="text-xs font-semibold uppercase tracking-wide text-[#64748B]">{filteredProducts.length} results</span>
          </div>

          {mobileFiltersOpen && (
            <div className="fixed inset-0 z-[60] lg:hidden">
              <button aria-label="Close filter overlay" className="absolute inset-0 bg-black/75" onClick={() => setMobileFiltersOpen(false)} />
              <aside role="dialog" aria-modal="true" aria-label="Product filters" className="absolute inset-y-0 left-0 w-[min(88vw,360px)] overflow-y-auto border-r border-[#1E293B] bg-[#090909] p-5 shadow-2xl">
                {filterPanel}
              </aside>
            </div>
          )}

          <div className="grid gap-8 lg:grid-cols-[280px_minmax(0,1fr)]">
            <aside className="sticky top-24 hidden h-fit rounded border border-[#1E293B] bg-[#111111] p-5 lg:block">{filterPanel}</aside>
            <main className="min-w-0">
              <div className="mb-5 hidden items-center justify-between lg:flex">
                <div className="flex flex-wrap items-center gap-2">
                  {search && <span className="rounded-full border border-[#0EA5E9]/30 bg-[#0EA5E9]/10 px-3 py-1 text-xs font-semibold text-[#7DD3FC]">Search: {search}</span>}
                  {selectedBrand !== "all" && <span className="rounded-full border border-[#E11D48]/30 bg-[#E11D48]/10 px-3 py-1 text-xs font-semibold text-[#FDA4AF]">Brand: {selectedBrand}</span>}
                  {selectedCategoryName && <span className="rounded-full border border-[#1E293B] px-3 py-1 text-xs font-semibold text-[#94A3B8]">Category: {selectedCategoryName}</span>}
                  {maxPrice > 0 && <span className="rounded-full border border-[#0EA5E9]/30 bg-[#0EA5E9]/10 px-3 py-1 text-xs font-semibold text-[#7DD3FC]">Under R{maxPrice}</span>}
                  {activeFilterCount === 0 && <span className="text-xs font-semibold uppercase tracking-widest text-[#64748B]">Browse the full catalog</span>}
                </div>
                <span className="text-xs font-semibold uppercase tracking-wide text-[#64748B]">{filteredProducts.length} results</span>
              </div>

              {productsQuery.isLoading ? (
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                  {[...Array(8)].map((_, i) => <div key={i} className="h-72 animate-pulse rounded-lg border border-[#1E293B] bg-[#111111]" />)}
                </div>
              ) : filteredProducts.length > 0 ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                  {filteredProducts.map((product) => <ProductCard key={product.id} product={product} isApproved={isApproved} />)}
                </motion.div>
              ) : (
                <div className="py-24 text-center text-[#64748B]">
                  <Search className="mx-auto mb-4 h-12 w-12 opacity-20" />
                  <p className="mb-2 text-lg font-bold text-white">No products found</p>
                  <p className="mb-5 text-sm">Try another brand, search term, price limit, or category.</p>
                  <Button onClick={clearFilters} variant="outline" className="border-[#1E293B] text-[#94A3B8] hover:text-white">Clear filters</Button>
                </div>
              )}
            </main>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
