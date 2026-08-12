import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Trash2, ShoppingCart, ArrowRight, Plus, Minus } from "lucide-react";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function Cart() {
  const { user, isAuthenticated } = useAuth();
  const isApproved = (user as any)?.status === "approved";
  const [, navigate] = useLocation();
  const utils = trpc.useUtils();

  const cartQuery = trpc.cart.get.useQuery(undefined, { enabled: isApproved });
  const items = cartQuery.data ?? [];

  const upsert = trpc.cart.upsert.useMutation({
    onSuccess: () => utils.cart.get.invalidate(),
    onError: (err) => toast.error(err.message),
  });

  const remove = trpc.cart.remove.useMutation({
    onSuccess: () => utils.cart.get.invalidate(),
    onError: (err) => toast.error(err.message),
  });

  const subtotal = items.reduce((sum, item) => sum + parseFloat(item.productPrice) * item.quantity, 0);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 container text-center py-24">
          <ShoppingCart className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-30" />
          <h2 className="text-2xl font-bold mb-2">Sign In Required</h2>
          <p className="text-muted-foreground mb-6">Please sign in to view your cart.</p>
          <Link href="/login"><Button className="text-white font-bold">Sign In</Button></Link>
        </div>
      </div>
    );
  }

  if (!isApproved) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 container text-center py-24">
          <ShoppingCart className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-30" />
          <h2 className="text-2xl font-bold mb-2">Approval Required</h2>
          <p className="text-muted-foreground mb-6">Your account must be approved before you can add items to cart.</p>
          <Link href="/account"><Button variant="outline">Check Status</Button></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20">
        <div className="container py-8">
          <h1 className="text-3xl font-black mb-8" >
            Quote <span style={{ color: "#0EA5E9" }}>Cart</span>
          </h1>

          {items.length === 0 ? (
            <div className="text-center py-24">
              <ShoppingCart className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-30" />
              <h2 className="text-xl font-bold mb-2">Your quote cart is empty</h2>
              <p className="text-muted-foreground mb-6">Browse our catalog and add products to request a quote.</p>
              <Link href="/products">
                <Button className="text-white font-bold">Browse Products</Button>
              </Link>
            </div>
          ) : (
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Items */}
              <div className="lg:col-span-2 space-y-4">
                {items.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card rounded-xl p-4 flex items-center gap-4"
                  >
                    <Link href={`/products/${item.productSlug}`} className="no-underline">
                      <div className="w-20 h-20 rounded-lg overflow-hidden bg-muted/30 shrink-0">
                        {item.primaryImage ? (
                          <img src={item.primaryImage} alt={item.productName} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="text-xs text-muted-foreground">AC</span>
                          </div>
                        )}
                      </div>
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link href={`/products/${item.productSlug}`} className="no-underline">
                        <h3 className="font-semibold text-sm hover:text-primary transition-colors truncate">{item.productName}</h3>
                      </Link>
                      <p className="text-primary font-bold mt-1">R{parseFloat(item.productPrice).toFixed(2)}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => {
                          if (item.quantity <= 1) {
                            remove.mutate({ cartItemId: item.id });
                          } else {
                            upsert.mutate({ productId: item.productId, quantity: item.quantity - 1 });
                          }
                        }}
                        className="w-7 h-7 rounded-md border border-border flex items-center justify-center hover:bg-accent transition-colors"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                      <button
                        onClick={() => upsert.mutate({ productId: item.productId, quantity: item.quantity + 1 })}
                        className="w-7 h-7 rounded-md border border-border flex items-center justify-center hover:bg-accent transition-colors"
                        disabled={item.quantity >= item.productStock}
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                    <div className="text-right shrink-0 w-20">
                      <p className="font-bold text-sm">R{(parseFloat(item.productPrice) * item.quantity).toFixed(2)}</p>
                    </div>
                    <button
                      onClick={() => remove.mutate({ cartItemId: item.id })}
                      className="text-muted-foreground hover:text-destructive transition-colors shrink-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </motion.div>
                ))}
              </div>

              {/* Summary */}
              <div className="glass-card rounded-xl p-6 h-fit sticky top-24">
                <h2 className="font-bold text-lg mb-4">Quote Summary</h2>
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal ({items.length} items)</span>
                    <span>R{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Delivery</span>
                    <span className="text-muted-foreground">Confirmed during review</span>
                  </div>
                </div>
                <div className="border-t border-border pt-4 mb-6">
                  <div className="flex justify-between font-bold">
                    <span>Subtotal</span>
                    <span className="text-primary">R{subtotal.toFixed(2)}</span>
                  </div>
                </div>
                <Button
                  className="w-full text-white font-bold"
                  onClick={() => navigate("/checkout")}
                >
                  Submit Quote Request
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Link href="/products" className="block text-center text-sm text-muted-foreground hover:text-foreground mt-4 no-underline">
                  Continue Shopping
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
