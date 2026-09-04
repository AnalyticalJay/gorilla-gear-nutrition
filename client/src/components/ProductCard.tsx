import React from "react";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { ShoppingCart, Lock, Eye } from "lucide-react";
import { Link } from "wouter";
import { Button } from "./ui/button";
import { toast } from "sonner";

type Product = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  price: string | null;
  primaryImage: string | null;
  categoryName?: string | null;
  brandName?: string | null;
  subcategoryName?: string | null;
  isFeatured?: boolean | null;
};

export default function ProductCard({
  product,
  isApproved,
  prioritizeImage = false,
}: {
  product: Product;
  isApproved: boolean;
  prioritizeImage?: boolean;
}) {
  const utils = trpc.useUtils();
  const [imageFailed, setImageFailed] = useState(false);
  const imageFallback = product.name
    .replace(/[^A-Za-z0-9 ]/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join("");
  const addToCart = trpc.cart.upsert.useMutation({
    onSuccess: () => {
      utils.cart.get.invalidate();
      toast.success(`${product.name} added to quote cart`);
    },
    onError: (err) => toast.error(err.message),
  });

  const hasPrice = Number(product.price ?? 0) > 0;
  const isQuoteReady = hasPrice;

  return (
    <div className="rounded-lg border border-[#454545] bg-[#111111] overflow-hidden group hover:border-[#a8751c]/40 hover:shadow-[0_0_20px_rgba(168,117,28,0.10)] transition-all duration-200 flex flex-col h-full">

      {/* Image */}
      <Link href={`/products/${product.slug}`} className="block no-underline">
        <div className="relative aspect-square bg-[#0D0D0D] overflow-hidden">
          {product.primaryImage && !imageFailed ? (
            <img
              src={product.primaryImage}
              alt={product.name}
              loading={prioritizeImage ? "eager" : "lazy"}
              decoding="async"
              fetchPriority={prioritizeImage ? "high" : "auto"}
              onError={() => setImageFailed(true)}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-400"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center" aria-label={`${product.name} image unavailable`}>
              <div className="flex h-20 w-20 items-center justify-center rounded-full border border-[#a8751c]/35 bg-[#1a1712] text-2xl font-black tracking-[0.12em] text-[#c99a3d]" aria-hidden="true">
                {imageFallback || <ShoppingCart className="h-7 w-7 text-[#5c5852]" />}
              </div>
            </div>
          )}

          {/* Featured badge */}
          {product.isFeatured && (
            <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest text-white"
              style={{ background: "linear-gradient(135deg, #a8751c, #7c5a20)" }}>
              Featured
            </div>
          )}

          {!hasPrice && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <span className="text-xs font-bold uppercase tracking-widest text-[#9b9388] border border-[#454545] px-3 py-1 rounded">
                Price on Request
              </span>
            </div>
          )}
        </div>
      </Link>

      {/* Content */}
      <div className="flex flex-1 flex-col p-3 text-center sm:p-4 sm:text-left">
        <div className="mb-1.5 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 sm:justify-start">
          {product.brandName && <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "#a8751c" }}>{product.brandName}</span>}
          {product.categoryName && <span className="text-[10px] font-bold uppercase tracking-widest text-[#9b9388]">{product.categoryName}</span>}
        </div>
        {product.subcategoryName && <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-[#6b665e]">{product.subcategoryName}</p>}

        <Link href={`/products/${product.slug}`} className="no-underline flex-1">
          <h3 className="font-bold text-sm text-white leading-snug mb-3 group-hover:text-[#a8751c] transition-colors line-clamp-2">
            {product.name}
          </h3>
        </Link>

        {/* Price + CTA */}
        <div className="mt-auto flex flex-col items-center justify-center gap-3 sm:flex-row sm:flex-wrap sm:justify-between">
          {isApproved ? (
            <>
              <span className="text-base font-black text-white sm:text-lg">
                {hasPrice ? `R${parseFloat(product.price ?? "0").toFixed(2)}` : "Price on request"}
              </span>
              {isQuoteReady ? (
                <Button
                  size="sm"
                  className="min-h-10 w-full text-white font-bold text-[0.68rem] uppercase tracking-wide px-3 sm:h-9 sm:min-h-0 sm:w-auto sm:flex-none"
                  style={{ background: "linear-gradient(135deg, #a8751c, #7c5a20)" }}
                  onClick={() => addToCart.mutate({ productId: product.id, quantity: 1 })}
                  disabled={addToCart.isPending}
                >
                  <ShoppingCart className="h-3.5 w-3.5 mr-1" />
                  {addToCart.isPending ? "..." : "Add to Quote"}
                </Button>
              ) : null}
            </>
          ) : (
            <>
              <div className="flex min-w-0 items-center justify-center gap-1.5 text-[#9b9388]">
                <Lock className="h-3.5 w-3.5" />
                <span className="text-xs font-medium">Approval required</span>
              </div>
              <Link href="/register" className="no-underline">
                <Button size="sm" variant="ghost"
                  className="min-h-10 px-3 text-xs font-bold uppercase tracking-wide sm:h-9 sm:min-h-0"
                  style={{ color: "#a8751c" }}>
                  <Eye className="h-3.5 w-3.5 mr-1" />
                  Apply
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
