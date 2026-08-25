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
  const { user } = useAuth();
  const isApproved = (user as any)?.status === "approved";
  const [quantity, setQuantity] = useState(1);
  const [imgIndex, setImgIndex] = useState(0);

  const utils = trpc.useUtils();
  const productQuery = trpc.products.bySlug.useQuery({ slug: slug ?? "" }, { enabled: !!slug });
  const product = productQuery.data;

  const addToCart = trpc.cart.upsert.useMutation({
    onSuccess: () => {
      utils.cart.get.invalidate();
      toast.success(`${product?.name} added to quote cart`);
    },
    onError: (err) => toast.error(err.message),
  });

  if (productQuery.isLoading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A]">
        <Navbar />
        <div className="pt-24 container">
          <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
            <div className="aspect-square bg-[#111111] rounded-lg border border-[#1E293B] animate-pulse" />
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
      <div className="min-h-screen bg-[#0A0A0A]">
        <Navbar />
        <div className="pt-24 container text-center py-24">
          <Package className="h-16 w-16 mx-auto mb-4 text-[#334155]" />
          <h2 className="text-2xl font-black uppercase tracking-tight text-white mb-4">Product Not Found</h2>
          <Link href="/products" className="no-underline">
            <Button variant="outline" className="border-[#1E293B] text-[#94A3B8] hover:text-white hover:border-[#0EA5E9]/40 bg-transparent">
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
    <div className="min-h-screen bg-[#0A0A0A]">
      <Navbar />
      <div className="pt-20 pb-8">
        <div className="container px-4 py-6 sm:py-8">
          {/* Breadcrumb */}
          <Link href="/products" className="inline-flex items-center gap-2 text-sm text-[#64748B] hover:text-[#0EA5E9] mb-8 no-underline transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Back to Products
          </Link>

          <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
            {/* Images */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
              <div className="relative aspect-square rounded-lg overflow-hidden border border-[#1E293B] bg-[#111111] mb-4">
                {currentImage ? (
                  <img
                    src={currentImage.imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="w-24 h-24 rounded-full flex items-center justify-center"
                      style={{ background: "#0EA5E915", border: "1px solid #0EA5E930" }}>
                      <span className="font-black text-3xl" style={{ color: "#0EA5E9" }}>AC</span>
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
                      style={{ borderColor: i === imgIndex ? "#0EA5E9" : "#1E293B" }}
                    >
                      <img src={img.imageUrl} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Details */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              {/* Category + stripe */}
              <div className="flex items-center gap-3 mb-3">
                <div className="h-[3px] w-8" style={{ background: "linear-gradient(90deg, #E11D48 0%, #E11D48 50%, #0EA5E9 50%, #0EA5E9 100%)" }} />
                {(product as any).category && (
                  <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "#0EA5E9" }}>
                    {(product as any).category?.name}
                  </span>
                )}
              </div>

              <h1 className="text-2xl font-black uppercase tracking-tight text-white mb-5 sm:text-3xl">
                {product.name}
              </h1>

              {/* Price */}
              <div className="mb-6">
                {isApproved && product.price ? (
                  <div className="text-4xl font-black text-white">
                    R<span style={{ color: "#0EA5E9" }}>{parseFloat(product.price).toFixed(2)}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 py-3 px-4 rounded border border-[#0EA5E9]/20 bg-[#0EA5E9]/5 inline-flex">
                    <Lock className="h-4 w-4 flex-shrink-0" style={{ color: "#0EA5E9" }} />
                    <span className="text-sm text-[#64748B]">Login & Get Approved to View Pricing</span>
                  </div>
                )}
              </div>

              {/* Stock */}
              <div className="mb-6">
                {product.stockQuantity > 0 ? (
                  <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "#4ADE80" }}>
                    ✓ In Stock ({product.stockQuantity} available)
                  </span>
                ) : (
                  <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "#F87171" }}>
                    ✗ Out of Stock
                  </span>
                )}
              </div>

              {/* Description */}
              {product.description && (
                <div className="mb-6">
                  <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#64748B] mb-2">Description</h3>
                  <p className="text-sm text-[#94A3B8] leading-relaxed">{product.description}</p>
                </div>
              )}

              {/* Dosage */}
              {product.dosageInfo && (
                <div className="mb-6 p-4 rounded border border-[#1E293B] bg-[#111111]">
                  <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#64748B] mb-2">Dosage Information</h3>
                  <p className="text-sm text-[#94A3B8] leading-relaxed">{product.dosageInfo}</p>
                </div>
              )}

              {/* Add to Quote */}
              {isApproved && product.stockQuantity > 0 && (
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                  <div className="flex items-center self-start border border-[#1E293B] rounded overflow-hidden bg-[#111111]">
                    <button
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="flex h-11 w-11 items-center justify-center px-3 py-2 text-sm text-white transition-colors hover:bg-[#1E293B] sm:h-9 sm:w-10"
                    >
                      −
                    </button>
                    <span className="flex h-11 min-w-12 items-center justify-center border-x border-[#1E293B] px-4 py-2 text-sm font-bold text-white sm:h-9">{quantity}</span>
                    <button
                      onClick={() => setQuantity((q) => Math.min(product.stockQuantity, q + 1))}
                      className="flex h-11 w-11 items-center justify-center px-3 py-2 text-sm text-white transition-colors hover:bg-[#1E293B] sm:h-9 sm:w-10"
                    >
                      +
                    </button>
                  </div>
                  <Button
                    className="min-h-11 w-full text-white font-bold uppercase tracking-wide sm:flex-1"
                    style={{ background: "linear-gradient(135deg, #0EA5E9, #0284C7)" }}
                    onClick={() => addToCart.mutate({ productId: product.id, quantity })}
                    disabled={addToCart.isPending}
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    {addToCart.isPending ? "Adding..." : "Add to Quote"}
                  </Button>
                </div>
              )}

              {!isApproved && (
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Link href="/register" className="flex-1 no-underline">
                    <Button className="w-full text-white font-bold uppercase tracking-wide"
                      style={{ background: "linear-gradient(135deg, #E11D48, #BE123C)" }}>
                      Apply for Access
                    </Button>
                  </Link>
                  <Link href="/login" className="no-underline">
                    <Button variant="outline" className="min-h-11 w-full border-[#1E293B] bg-transparent text-[#94A3B8] hover:border-[#0EA5E9]/40 hover:text-white sm:w-auto">
                      Login
                    </Button>
                  </Link>
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
