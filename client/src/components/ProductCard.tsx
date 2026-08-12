import React from "react";
import { trpc } from "@/lib/trpc";
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
  isFeatured?: boolean | null;
  stockQuantity: number;
};

export default function ProductCard({
  product,
  isApproved,
}: {
  product: Product;
  isApproved: boolean;
}) {
  const utils = trpc.useUtils();
  const addToCart = trpc.cart.upsert.useMutation({
    onSuccess: () => {
      utils.cart.get.invalidate();
      toast.success(`${product.name} added to quote cart`);
    },
    onError: (err) => toast.error(err.message),
  });

  const inStock = product.stockQuantity > 0;

  return (
    <div className="rounded-lg border border-[#1E293B] bg-[#111111] overflow-hidden group hover:border-[#0EA5E9]/40 hover:shadow-[0_0_20px_rgba(14,165,233,0.08)] transition-all duration-200 flex flex-col h-full">

      {/* Image */}
      <Link href={`/products/${product.slug}`} className="block no-underline">
        <div className="relative aspect-square bg-[#0D0D0D] overflow-hidden">
          {product.primaryImage ? (
            <img
              src={product.primaryImage}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-400"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-[#1E293B] flex items-center justify-center">
                <ShoppingCart className="h-7 w-7 text-[#334155]" />
              </div>
            </div>
          )}

          {/* Featured badge */}
          {product.isFeatured && (
            <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest text-white"
              style={{ background: "linear-gradient(135deg, #E11D48, #BE123C)" }}>
              Featured
            </div>
          )}

          {/* Out of stock overlay */}
          {!inStock && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <span className="text-xs font-bold uppercase tracking-widest text-[#64748B] border border-[#1E293B] px-3 py-1 rounded">
                Out of Stock
              </span>
            </div>
          )}
        </div>
      </Link>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        {product.categoryName && (
          <span className="text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: "#0EA5E9" }}>
            {product.categoryName}
          </span>
        )}

        <Link href={`/products/${product.slug}`} className="no-underline flex-1">
          <h3 className="font-bold text-sm text-white leading-snug mb-3 group-hover:text-[#0EA5E9] transition-colors line-clamp-2">
            {product.name}
          </h3>
        </Link>

        {/* Price + CTA */}
        <div className="flex items-center justify-between gap-2 mt-auto">
          {isApproved ? (
            <>
              <span className="text-lg font-black text-white">
                {product.price ? `R${parseFloat(product.price).toFixed(2)}` : "—"}
              </span>
              {inStock ? (
                <Button
                  size="sm"
                  className="text-white font-bold text-xs uppercase tracking-wide h-8 px-3 flex-shrink-0"
                  style={{ background: "linear-gradient(135deg, #0EA5E9, #0284C7)" }}
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
              <div className="flex items-center gap-1.5 text-[#64748B]">
                <Lock className="h-3.5 w-3.5" />
                <span className="text-xs font-medium">Approval required</span>
              </div>
              <Link href="/register" className="no-underline">
                <Button size="sm" variant="ghost"
                  className="h-8 px-3 text-xs font-bold uppercase tracking-wide"
                  style={{ color: "#0EA5E9" }}>
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
