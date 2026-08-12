import { trpc } from "@/lib/trpc";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { CheckCircle, Package, ArrowRight } from "lucide-react";
import { Link, useParams } from "wouter";
import { motion } from "framer-motion";

export default function OrderSuccess() {
  const { orderId } = useParams<{ orderId: string }>();
  const orderQuery = trpc.orders.detail.useQuery(
    { orderId: parseInt(orderId ?? "0") },
    { enabled: !!orderId }
  );
  const order = orderQuery.data;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20">
        <div className="container py-16 max-w-2xl mx-auto text-center">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", duration: 0.6 }}
          >
            <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-12 w-12 text-black" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h1 className="text-4xl font-black mb-3" >
              Order <span style={{ color: "#0EA5E9" }}>Confirmed!</span>
            </h1>
            <p className="text-muted-foreground mb-2">
              Thank you for your order. Your payment has been processed successfully.
            </p>
            {order && (
              <p className="text-sm text-muted-foreground mb-8">
                Order #{order.id} · R{parseFloat(order.totalAmount).toFixed(2)}
              </p>
            )}

            <div className="glass-card rounded-xl p-6 text-left mb-8">
              <div className="flex items-center gap-2 mb-4">
                <Package className="h-5 w-5 text-primary" />
                <h2 className="font-bold">What happens next?</h2>
              </div>
              <ul className="space-y-3">
                {[
                  "Your order is being prepared for dispatch",
                  "You'll receive a confirmation email shortly",
                  "Delivery within 2–3 business days",
                  "All orders are shipped in discreet, plain packaging",
                ].map((step, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-muted-foreground">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center text-black font-bold text-xs shrink-0">
                      {i + 1}
                    </div>
                    {step}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/account/orders">
                <Button variant="outline" className="border-border/60">
                  View Order History
                </Button>
              </Link>
              <Link href="/products">
                <Button className="text-white font-bold">
                  Continue Shopping
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
