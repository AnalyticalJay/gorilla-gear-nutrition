import React, { useState } from "react";
import { ArrowUpRight, Eye, ImageOff, ShoppingCart } from "lucide-react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

type SupplementProduct = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  dosageInfo?: string | null;
  price: string | number | null;
  primaryImage: string | null;
};

export default function SupplementQuickViewCard({ product, isApproved }: { product: SupplementProduct; isApproved: boolean }) {
  const [open, setOpen] = useState(false);
  const utils = trpc.useUtils();
  const hasPrice = Number(product.price ?? 0) > 0;
  const isUnpriced = isApproved && !hasPrice;
  const canQuote = isApproved && hasPrice;
  const addToCart = trpc.cart.upsert.useMutation({
    onSuccess: () => {
      utils.cart.get.invalidate();
      toast.success(`${product.name} added to quote cart`);
    },
    onError: (error) => toast.error(error.message),
  });

  const displayPrice = !isApproved ? "Member access required" : hasPrice ? `R${Number(product.price).toFixed(2)}` : "Price on request";
  const addToQuote = () => addToCart.mutate({ productId: product.id, quantity: 1 });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <article className="group relative flex h-full flex-col overflow-hidden rounded-xl border border-white/10 bg-[#111] shadow-[0_14px_30px_rgba(0,0,0,0.2)] transition-[transform,border-color,box-shadow] duration-200 hover:-translate-y-1 hover:border-[#c99a3d]/80 hover:shadow-[0_20px_46px_rgba(201,154,61,0.15)] focus-within:border-[#c99a3d]/80">
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label={`Quick view ${product.name}`}
          className="relative block aspect-[1.08/1] w-full overflow-hidden bg-[#0b0b0b] text-left"
        >
          {product.primaryImage ? (
            <img src={product.primaryImage} alt={product.name} className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105" />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_center,rgba(201,154,61,0.12),transparent_48%)]">
              <ImageOff className="h-8 w-8 text-white/20 transition-colors duration-200 group-hover:text-[#c99a3d]/65" strokeWidth={1.35} />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/5 to-transparent opacity-70 transition-opacity duration-200 group-hover:opacity-90" />
          <span className="absolute inset-x-4 bottom-4 inline-flex items-center justify-center gap-2 border border-white/30 bg-black/55 px-3 py-2 text-[10px] font-black uppercase tracking-[0.16em] text-white opacity-100 backdrop-blur-sm transition duration-200 sm:translate-y-2 sm:opacity-0 sm:group-hover:translate-y-0 sm:group-hover:opacity-100">
            <Eye className="h-3.5 w-3.5 text-[#c99a3d]" /> Quick view
          </span>
          {isUnpriced && <span className="absolute right-3 top-3 border border-[#c99a3d]/45 bg-black/70 px-2 py-1 text-[9px] font-black uppercase tracking-[0.12em] text-[#e0b35a]">Price on request</span>}
        </button>

        <div className="flex flex-1 flex-col p-4 text-center sm:text-left">
          <p className="text-[9px] font-black uppercase tracking-[0.18em] text-[#c99a3d]">Supplements</p>
          <h3 className="mt-2 min-h-11 text-sm font-black uppercase leading-5 text-white transition-colors group-hover:text-[#e0b35a]">{product.name}</h3>
          <p className="mt-2 line-clamp-2 min-h-10 text-xs leading-5 text-white/58">{product.description ?? "Product details available in quick view."}</p>
          <div className="mt-4 flex items-end justify-between gap-3 border-t border-white/10 pt-3">
            <div>
              <p className="text-lg font-black text-white">{displayPrice}</p>
              <p className="mt-0.5 text-[9px] font-bold uppercase tracking-[0.14em] text-white/40">{!isApproved ? "Approval required" : hasPrice ? "Ready to quote" : "Price confirmation needed"}</p>
            </div>
            <button type="button" onClick={() => setOpen(true)} className="inline-flex min-h-10 items-center gap-1.5 border border-[#c99a3d]/55 px-3 text-[10px] font-black uppercase tracking-[0.12em] text-[#e0b35a] transition-colors hover:border-[#e0b35a] hover:bg-[#c99a3d]/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#c99a3d]">
              <Eye className="h-3.5 w-3.5" /> View
            </button>
          </div>
          {canQuote && <Button onClick={addToQuote} disabled={addToCart.isPending} className="mt-3 min-h-10 w-full rounded-none bg-[#c99a3d] text-[10px] font-black uppercase tracking-[0.13em] text-black hover:bg-[#e0b35a]"><ShoppingCart className="mr-2 h-3.5 w-3.5" />{addToCart.isPending ? "Adding..." : "Add to quote"}</Button>}
        </div>
      </article>

      <DialogContent className="max-h-[min(760px,calc(100vh-2rem))] overflow-y-auto rounded-none border-[#c99a3d]/45 bg-[#111] p-0 text-white shadow-[0_26px_80px_rgba(0,0,0,0.65)] sm:max-w-2xl" aria-describedby={`supplement-description-${product.id}`}>
        <div className="grid sm:grid-cols-[0.9fr_1.1fr]">
          <div className="relative aspect-square bg-[#0b0b0b] sm:aspect-auto">
            {product.primaryImage ? <img src={product.primaryImage} alt={product.name} className="h-full w-full object-cover" /> : <div className="flex h-full min-h-56 items-center justify-center bg-[radial-gradient(circle_at_center,rgba(201,154,61,0.14),transparent_53%)]"><ImageOff className="h-10 w-10 text-white/20" strokeWidth={1.25} /></div>}
          </div>
          <div className="flex flex-col p-6 sm:p-7">
            <DialogHeader className="text-left">
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#c99a3d]">Supplements quick view</p>
              <DialogTitle className="mt-2 pr-7 text-2xl font-black uppercase leading-none tracking-[-0.045em] text-white">{product.name}</DialogTitle>
              <DialogDescription id={`supplement-description-${product.id}`} className="mt-4 leading-6 text-white/67">{product.description ?? "Product details are available on the full product page."}</DialogDescription>
            </DialogHeader>
            <div className="mt-6 grid gap-3 border-y border-white/10 py-4 text-sm">
              {product.dosageInfo && <div><p className="text-[9px] font-black uppercase tracking-[0.16em] text-white/40">Quantity & strength</p><p className="mt-1 font-semibold text-white/82">{product.dosageInfo}</p></div>}
              <div className="flex items-center justify-between gap-3"><span className="text-[9px] font-black uppercase tracking-[0.16em] text-white/40">Price</span><span className="font-black text-[#e0b35a]">{displayPrice}</span></div>
            </div>
            <DialogFooter className="mt-6 sm:justify-start">
              <Link href={`/products/${product.slug}`} className="no-underline"><Button variant="outline" className="min-h-11 rounded-none border-white/25 bg-transparent text-[10px] font-black uppercase tracking-[0.12em] text-white hover:border-[#c99a3d] hover:bg-white/5 hover:text-white">Full details <ArrowUpRight className="ml-2 h-3.5 w-3.5" /></Button></Link>
              {canQuote && <Button onClick={addToQuote} disabled={addToCart.isPending} className="min-h-11 rounded-none bg-[#c99a3d] text-[10px] font-black uppercase tracking-[0.12em] text-black hover:bg-[#e0b35a]"><ShoppingCart className="mr-2 h-3.5 w-3.5" />{addToCart.isPending ? "Adding..." : "Add to quote"}</Button>}
              {!canQuote && <span className="inline-flex min-h-11 items-center text-xs text-white/55">{!isApproved ? "Member approval required" : "Price confirmation needed"}</span>}
            </DialogFooter>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
