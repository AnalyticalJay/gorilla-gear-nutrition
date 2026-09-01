import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Lock, ArrowLeft, ChevronLeft, ChevronRight, Package } from "lucide-react";
import { useState } from "react";
import { Link, useParams } from "wouter";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { user, isAuthenticated } = useAuth();
  const isApproved = (user as any)?.status === "approved";
  const [quantity, setQuantity] = useState(1);
  const [imgIndex, setImgIndex] = useState(0);

  const utils = trpc.useUtils();
  const productQuery = trpc.products.bySlug.useQuery({ slug: slug ?? "" }, { enabled: !!slug });
  const product = productQuery.data;
  const hasPrice = Number(product?.price ?? 0) > 0;

  const addToCart = trpc.cart.upsert.useMutation({
    onSuccess: () => {
      utils.cart.get.invalidate();
      toast.success(`${product?.name} added to quote cart`);
    },
    onError: (err) => toast.error(err.message),
  });

  if (productQuery.isLoading) {
    return (
      <div className="min-h-screen bg-[#101010]">
        <Navbar />
        <div className="pt-24 container">
          <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
            <div className="aspect-square bg-[#111111] rounded-lg border border-[#454545] animate-pulse" />
            <div className="space-y-4">
              <div className="h-8 bg-[#111111] rounded animate-pulse w-3/4" />
              <div className="h-4 bg-[#111111] rounded animate-pulse w-1/2" />
              <div className="h-24 bg-[#111111] rounded animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#101010]">
        <Navbar />
        <div className="pt-24 container text-center py-24">
          <Package className="h-16 w-16 mx-auto mb-4 text-[#5c5852]" />
          <h2 className="text-2xl font-black uppercase tracking-tight text-white mb-4">Product Not Found</h2>
          <Link href="/products" className="no-underline">
            <Button variant="outline" className="border-[#454545] text-[#c9c2b6] hover:text-white hover:border-[#a8751c]/40 bg-transparent">
              Back to Products
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const images = product.images ?? [];
  const currentImage = images[imgIndex];

  return (
    <div className="min-h-screen bg-[#101010]">
      <Navbar />
      <div className="pt-20 pb-10 sm:pb-8">
        <div className="container px-4 py-6 sm:py-8">
          {/* Breadcrumb */}
          <Link href="/products" className="inline-flex items-center gap-2 text-sm text-[#9b9388] hover:text-[#a8751c] mb-8 no-underline transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Back to Products
          </Link>

          <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
            {/* Images */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
              <div className="relative aspect-square rounded-lg overflow-hidden border border-[#454545] bg-[#111111] mb-4">
                {currentImage ? (
                  <img
                    src={currentImage.imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="w-24 h-24 rounded-full flex items-center justify-center"
                      style={{ background: "#a8751c15", border: "1px solid #a8751c30" }}>
                      <span className="font-black text-3xl" style={{ color: "#a8751c" }}>AC</span>
                    </div>
                  </div>
                )}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={() => setImgIndex((i) => Math.max(0, i - 1))}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/70 flex items-center justify-center hover:bg-black text-white transition-colors"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setImgIndex((i) => Math.min(images.length - 1, i + 1))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/70 flex items-center justify-center hover:bg-black text-white transition-colors"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </>
                )}
              </div>
              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {images.map((img, i) => (
                    <button
                      key={img.id}
                      onClick={() => setImgIndex(i)}
                      className="h-16 w-16 shrink-0 rounded border-2 overflow-hidden transition-colors sm:h-20 sm:w-20"
                      style={{ borderColor: i === imgIndex ? "#a8751c" : "#454545" }}
                    >
                      <img src={img.imageUrl} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Details */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              {/* Taxonomy context + stripe */}
              <div className="mb-3 flex flex-wrap items-center gap-3">
                <div className="h-[3px] w-8" style={{ background: "linear-gradient(90deg, #a8751c 0%, #a8751c 50%, #a8751c 50%, #a8751c 100%)" }} />
                {(product as any).brand && <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "#a8751c" }}>{(product as any).brand?.name}</span>}
                {(product as any).category && <span className="text-xs font-bold uppercase tracking-widest text-[#9b9388]">{(product as any).category?.name}</span>}
                {(product as any).subcategory && <span className="text-xs font-semibold uppercase tracking-widest text-[#6b665e]">{(product as any).subcategory?.name}</span>}
              </div>

              <h1 className="text-2xl font-black uppercase tracking-tight text-white mb-5 sm:text-3xl">
                {product.name}
              </h1>

              {/* Price */}
              <div className="mb-6">
                {isApproved && hasPrice ? (
                  <div className="text-4xl font-black text-white">
                    R<span style={{ color: "#a8751c" }}>{parseFloat(product.price ?? "0").toFixed(2)}</span>
                  </div>
                ) : isApproved ? (
                  <div className="inline-flex rounded border border-[#c99a3d]/35 bg-[#c99a3d]/10 px-4 py-3 text-sm font-bold text-[#c99a3d]">
                    Price on request
                  </div>
                ) : (
                  <div className="flex items-center gap-2 py-3 px-4 rounded border border-[#a8751c]/20 bg-[#a8751c]/5 inline-flex">
                    <Lock className="h-4 w-4 flex-shrink-0" style={{ color: "#a8751c" }} />
                    <span className="text-sm text-[#9b9388]">Login & Get Approved to View Pricing</span>
                  </div>
                )}
              </div>

              {/* Description */}
              {product.description && (
                <div className="mb-6">
                  <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#9b9388] mb-2">Description</h3>
                  <p className="text-sm text-[#c9c2b6] leading-relaxed">{product.description}</p>
                </div>
              )}

              {/* Dosage */}
              {product.dosageInfo && (
                <div className="mb-6 p-4 rounded border border-[#454545] bg-[#111111]">
                  <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#9b9388] mb-2">Dosage Information</h3>
                  <p className="text-sm text-[#c9c2b6] leading-relaxed">{product.dosageInfo}</p>
                </div>
              )}

              {/* Add to Quote */}
              {isApproved && hasPrice && (
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                  <div className="flex items-center self-start border border-[#454545] rounded overflow-hidden bg-[#111111]">
                    <button
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="flex h-11 w-11 items-center justify-center px-3 py-2 text-sm text-white transition-colors hover:bg-[#454545] sm:h-9 sm:w-10"
                    >
                      −
                    </button>
                    <span className="flex h-11 min-w-12 items-center justify-center border-x border-[#454545] px-4 py-2 text-sm font-bold text-white sm:h-9">{quantity}</span>
                    <button
                      onClick={() => setQuantity((q) => Math.min(99, q + 1))}
                      className="flex h-11 w-11 items-center justify-center px-3 py-2 text-sm text-white transition-colors hover:bg-[#454545] sm:h-9 sm:w-10"
                    >
                      +
                    </button>
                  </div>
                  <Button
                    className="min-h-11 w-full text-white font-bold uppercase tracking-wide sm:flex-1"
                    style={{ background: "linear-gradient(135deg, #a8751c, #7c5a20)" }}
                    onClick={() => addToCart.mutate({ productId: product.id, quantity })}
                    disabled={addToCart.isPending}
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    {addToCart.isPending ? "Adding..." : "Add to Quote"}
                  </Button>
                </div>
              )}

              {!isApproved && (
                <div className="rounded border border-[#c99a3d]/30 bg-[#c99a3d]/8 p-4">
                  <p className="text-sm leading-6 text-[#d7c39d]">Membership approval is required to request quotes and access your customer dashboard.</p>
                  <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                    {isAuthenticated ? (
                      <Link href="/account" className="flex-1 no-underline">
                        <Button className="w-full text-black font-bold uppercase tracking-wide" style={{ background: "#c99a3d" }}>
                          View approval status
                        </Button>
                      </Link>
                    ) : (
                      <Link href="/register" className="flex-1 no-underline">
                        <Button className="w-full text-black font-bold uppercase tracking-wide" style={{ background: "#c99a3d" }}>
                          Apply to request a quote
                        </Button>
                      </Link>
                    )}
                    {!isAuthenticated && (
                      <Link href="/login" className="no-underline">
                        <Button variant="outline" className="min-h-11 w-full border-[#c99a3d]/45 bg-transparent text-[#d7c39d] hover:border-[#c99a3d] hover:text-white sm:w-auto">
                          Sign in
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
