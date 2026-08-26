import React from "react";
import { trpc } from "@/lib/trpc";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, SlidersHorizontal, Lock, X, RotateCcw, ChevronDown, Tag, DollarSign, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { BrandFilter, AVAILABLE_BRANDS } from "@/lib/productFilters";
import { useAuth } from "@/_core/hooks/useAuth";

export default function Products() {
  const { user } = useAuth();
  const isApproved = (user as any)?.status === "approved";
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<number | undefined>();
  const [selectedBrand, setSelectedBrand] = useState<BrandFilter>("all");
  const [maxPrice, setMaxPrice] = useState<number>(0); // 0 means any price
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 24;

  const categoriesQuery = trpc.categories.list.useQuery();
  const productsQuery = trpc.products.listPage.useQuery({
    categoryId: selectedCategory,
    search: search || undefined,
    brand: selectedBrand === "all" ? undefined : selectedBrand,
    maxPrice: maxPrice > 0 ? maxPrice : undefined,
    limit: PAGE_SIZE,
    offset: (page - 1) * PAGE_SIZE,
  });

  const products = productsQuery.data?.items ?? [];
  const totalProducts = productsQuery.data?.total ?? 0;
  const categories = categoriesQuery.data ?? [];
  const totalPages = Math.max(Math.ceil(totalProducts / PAGE_SIZE), 1);
  const pageNumbers = useMemo(() => {
    const start = Math.max(1, Math.min(page - 2, totalPages - 4));
    const end = Math.min(totalPages, start + 4);
    return Array.from({ length: end - start + 1 }, (_, index) => start + index);
  }, [page, totalPages]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const activeFilterCount = Number(Boolean(search)) + Number(selectedCategory !== undefined) + Number(selectedBrand !== "all") + Number(maxPrice > 0);
  const selectedCategoryName = categories.find((category) => category.id === selectedCategory)?.name;

  const clearFilters = () => {
    setSearch("");
    setSelectedCategory(undefined);
    setSelectedBrand("all");
    setMaxPrice(0);
    setPage(1);
  };

  const filterPanel = (
    <div className="space-y-6">
      <div className="flex items-center justify-between lg:hidden">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#a8751c]">Catalog filters</p>
          <h2 className="mt-1 text-lg font-black uppercase text-white">Find a product</h2>
        </div>
        <button onClick={() => setMobileFiltersOpen(false)} className="flex h-11 w-11 items-center justify-center rounded border border-[#454545] text-[#c9c2b6] hover:text-white" aria-label="Close filters">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div>
        <label htmlFor="product-search" className="mb-2 block text-xs font-bold uppercase tracking-widest text-[#c9c2b6]">Search products</label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9b9388]" />
          <Input
            id="product-search"
            placeholder="Name, compound, or dosage"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            className="border-[#454545] bg-[#101010] pl-9 text-white placeholder:text-[#6b665e] focus:border-[#a8751c]/60"
          />
        </div>
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <p className="text-xs font-bold uppercase tracking-widest text-[#c9c2b6]">Brand</p>
          <Tag className="h-4 w-4 text-[#a8751c]" />
        </div>
        <div className="max-h-60 space-y-1.5 overflow-y-auto pr-1">
          {AVAILABLE_BRANDS.map((brand) => {
            const active = selectedBrand === brand;
            const label = brand === "all" ? "All brands" : brand;
            return (
              <button
                key={brand}
                onClick={() => {
                  setSelectedBrand(brand);
                  setPage(1);
                }}
                className={`flex min-h-10 w-full items-center justify-between rounded border px-3 py-2 text-left text-xs font-bold transition-colors ${active ? "border-[#a8751c]/60 bg-[#a8751c]/10 text-white" : "border-[#454545] text-[#9b9388] hover:border-[#a8751c]/40 hover:text-white"}`}
              >
                <span className="truncate">{label}</span>
                <span className={`h-2 w-2 flex-shrink-0 rounded-full ${active ? "bg-[#a8751c]" : "bg-[#5c5852]"}`} />
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <p className="text-xs font-bold uppercase tracking-widest text-[#c9c2b6]">Category</p>
          <ChevronDown className="h-4 w-4 text-[#a8751c]" />
        </div>
        <div className="max-h-60 space-y-1 overflow-y-auto pr-1">
          <button
            onClick={() => {
              setSelectedCategory(undefined);
              setPage(1);
            }}
            className={`flex min-h-10 w-full items-center justify-between rounded px-3 py-2 text-left text-xs font-semibold transition-colors ${selectedCategory === undefined ? "bg-[#a8751c]/10 text-[#a8751c]" : "text-[#9b9388] hover:bg-white/5 hover:text-white"}`}
          >
            <span>All categories</span>
            {selectedCategory === undefined && <span className="text-[10px]">Active</span>}
          </button>
          {categories.map((category) => {
            const active = selectedCategory === category.id;
            return (
              <button
                key={category.id}
                onClick={() => {
                  setSelectedCategory(active ? undefined : category.id);
                  setPage(1);
                }}
                className={`flex min-h-10 w-full items-center justify-between rounded px-3 py-2 text-left text-xs font-semibold transition-colors ${active ? "bg-[#a8751c]/10 text-[#a8751c]" : "text-[#9b9388] hover:bg-white/5 hover:text-white"}`}
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
          <p className="text-xs font-bold uppercase tracking-widest text-[#c9c2b6]">Max Price (ZAR)</p>
          <DollarSign className="h-4 w-4 text-[#a8751c]" />
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
                onClick={() => {
                  setMaxPrice(tier.value);
                  setPage(1);
                }}
                className={`flex min-h-10 w-full items-center justify-between rounded border px-3 py-2 text-left text-xs font-bold transition-colors ${active ? "border-[#a8751c]/60 bg-[#a8751c]/10 text-white" : "border-[#454545] text-[#9b9388] hover:border-[#a8751c]/40 hover:text-white"}`}
              >
                <span>{tier.label}</span>
                <span className={`h-2 w-2 flex-shrink-0 rounded-full ${active ? "bg-[#a8751c]" : "bg-[#5c5852]"}`} />
              </button>
            );
          })}
        </div>
      </div>

      <Button onClick={clearFilters} variant="outline" className="min-h-11 w-full border-[#454545] text-[#c9c2b6] hover:border-[#a8751c]/50 hover:bg-[#a8751c]/5 hover:text-white">
        <RotateCcw className="mr-2 h-4 w-4" /> Clear filters
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#101010]">
      <Navbar />
      <div className="pt-16">
        <div className="border-b border-[#454545] bg-[#080808] py-12">
          <div className="container">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="text-center lg:text-left">
              <div className="mx-auto mb-5 h-[3px] w-16 lg:mx-0" style={{ background: "linear-gradient(90deg, #a8751c 0%, #a8751c 50%, #a8751c 50%, #a8751c 100%)" }} />
              <h1 className="mb-2 text-4xl font-black uppercase tracking-tight text-white">Product <span style={{ color: "#a8751c" }}>Catalog</span></h1>
              <p className="text-sm text-[#9b9388]">{isApproved ? `${totalProducts} premium products available` : "Prices hidden — get approved to view pricing and purchase"}</p>
            </motion.div>
          </div>
        </div>

        {!isApproved && (
          <div className="border-b py-3" style={{ borderColor: "#a8751c" + "30", background: "#a8751c" + "08" }}>
            <div className="container flex flex-col items-center gap-3 py-1 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">
              <div className="flex items-center justify-center gap-2 text-sm text-[#9b9388] sm:justify-start"><Lock className="h-4 w-4 flex-shrink-0" style={{ color: "#a8751c" }} /><span>Prices are hidden. <strong className="text-white">Get approved</strong> to view pricing and add products to your quote cart.</span></div>
              <Link href="/register" className="no-underline"><Button size="sm" className="h-10 w-full flex-shrink-0 px-4 text-xs font-bold uppercase tracking-wide text-white sm:w-auto" style={{ background: "linear-gradient(135deg, #a8751c, #7c5a20)" }}>Apply Now</Button></Link>
            </div>
          </div>
        )}

        <div className="container py-8">
          <div className="mb-6 flex flex-col items-center justify-center gap-3 text-center lg:hidden">
            <button onClick={() => setMobileFiltersOpen(true)} className="inline-flex min-h-11 items-center gap-2 rounded border border-[#454545] bg-[#111111] px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-white hover:border-[#a8751c]/50">
              <SlidersHorizontal className="h-4 w-4 text-[#a8751c]" /> Filters {activeFilterCount > 0 && <span className="rounded-full bg-[#a8751c] px-2 py-0.5 text-[10px]">{activeFilterCount}</span>}
            </button>
            <span className="text-xs font-semibold uppercase tracking-wide text-[#9b9388]">{totalProducts} results</span>
          </div>

          {mobileFiltersOpen && (
            <div className="fixed inset-0 z-[60] lg:hidden">
              <button aria-label="Close filter overlay" className="absolute inset-0 bg-black/75" onClick={() => setMobileFiltersOpen(false)} />
              <aside role="dialog" aria-modal="true" aria-label="Product filters" className="absolute inset-y-0 left-0 w-[min(88vw,360px)] overflow-y-auto border-r border-[#454545] bg-[#090909] p-5 shadow-2xl">
                {filterPanel}
              </aside>
            </div>
          )}

          <div className="grid gap-8 lg:grid-cols-[280px_minmax(0,1fr)]">
            <aside className="sticky top-24 hidden h-fit rounded border border-[#454545] bg-[#111111] p-5 lg:block">{filterPanel}</aside>
            <main className="min-w-0">
              <div className="mb-5 hidden items-center justify-between lg:flex">
                <div className="flex flex-wrap items-center gap-2">
                  {search && <span className="rounded-full border border-[#a8751c]/30 bg-[#a8751c]/10 px-3 py-1 text-xs font-semibold text-[#e7c979]">Search: {search}</span>}
                  {selectedBrand !== "all" && <span className="rounded-full border border-[#a8751c]/30 bg-[#a8751c]/10 px-3 py-1 text-xs font-semibold text-[#e7c979]">Brand: {selectedBrand}</span>}
                  {selectedCategoryName && <span className="rounded-full border border-[#454545] px-3 py-1 text-xs font-semibold text-[#c9c2b6]">Category: {selectedCategoryName}</span>}
                  {maxPrice > 0 && <span className="rounded-full border border-[#a8751c]/30 bg-[#a8751c]/10 px-3 py-1 text-xs font-semibold text-[#e7c979]">Under R{maxPrice}</span>}
                  {activeFilterCount === 0 && <span className="text-xs font-semibold uppercase tracking-widest text-[#9b9388]">Browse the full catalog</span>}
                </div>
                <span className="text-xs font-semibold uppercase tracking-wide text-[#9b9388]">{totalProducts} results</span>
              </div>

              {productsQuery.isLoading ? (
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                  {[...Array(8)].map((_, i) => <div key={i} className="h-72 animate-pulse rounded-lg border border-[#454545] bg-[#111111]" />)}
                </div>
              ) : products.length > 0 ? (
                <>
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                    {products.map((product) => <ProductCard key={product.id} product={product} isApproved={isApproved} />)}
                  </motion.div>
                  {totalPages > 1 && (
                    <nav aria-label="Product catalogue pagination" className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-[#454545] pt-6 sm:flex-row">
                      <p className="text-xs font-semibold uppercase tracking-widest text-[#9b9388]">
                        Page {page} of {totalPages}
                      </p>
                      <div className="flex items-center gap-1.5">
                        <Button
                          variant="outline"
                          size="sm"
                          aria-label="Previous page"
                          disabled={page === 1 || productsQuery.isFetching}
                          onClick={() => setPage((current) => Math.max(1, current - 1))}
                          className="h-10 border-[#454545] px-3 text-[#c9c2b6] hover:border-[#a8751c]/50 hover:text-white"
                        >
                          <ChevronLeft className="h-4 w-4" />
                          <span className="sr-only sm:not-sr-only sm:ml-1">Previous</span>
                        </Button>
                        {pageNumbers.map((pageNumber) => (
                          <Button
                            key={pageNumber}
                            variant="outline"
                            size="sm"
                            aria-label={`Go to page ${pageNumber}`}
                            aria-current={pageNumber === page ? "page" : undefined}
                            disabled={productsQuery.isFetching}
                            onClick={() => setPage(pageNumber)}
                            className={`h-10 min-w-10 border-[#454545] px-3 ${pageNumber === page ? "border-[#a8751c] bg-[#a8751c]/15 text-white" : "text-[#c9c2b6] hover:border-[#a8751c]/50 hover:text-white"}`}
                          >
                            {pageNumber}
                          </Button>
                        ))}
                        <Button
                          variant="outline"
                          size="sm"
                          aria-label="Next page"
                          disabled={page === totalPages || productsQuery.isFetching}
                          onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                          className="h-10 border-[#454545] px-3 text-[#c9c2b6] hover:border-[#a8751c]/50 hover:text-white"
                        >
                          <span className="sr-only sm:not-sr-only sm:mr-1">Next</span>
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </nav>
                  )}
                </>
              ) : (
                <div className="py-24 text-center text-[#9b9388]">
                  <Search className="mx-auto mb-4 h-12 w-12 opacity-20" />
                  <p className="mb-2 text-lg font-bold text-white">No products found</p>
                  <p className="mb-5 text-sm">Try another brand, search term, price limit, or category.</p>
                  <Button onClick={clearFilters} variant="outline" className="border-[#454545] text-[#c9c2b6] hover:text-white">Clear filters</Button>
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
