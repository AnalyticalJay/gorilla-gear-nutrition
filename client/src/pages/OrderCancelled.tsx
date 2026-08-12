import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { XCircle, ShoppingCart, ArrowLeft } from "lucide-react";
import { Link } from "wouter";

export default function OrderCancelled() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 flex items-center justify-center px-4 py-20">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 rounded-full bg-destructive/20 flex items-center justify-center mx-auto mb-6">
            <XCircle className="h-10 w-10 text-destructive" />
          </div>
          <h1 className="text-3xl font-black mb-4" >
            Payment <span className="text-destructive">Cancelled</span>
          </h1>
          <p className="text-muted-foreground mb-8 leading-relaxed">
            Your payment attempt was cancelled or did not complete successfully. Your approved quote remains available in your account so you can choose a payment method again.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/cart">
              <Button className="text-white font-bold px-8">
                <ShoppingCart className="h-4 w-4 mr-2" />
                Return to Quote
              </Button>
            </Link>
            <Link href="/products">
              <Button variant="outline" className="border-border px-8">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Continue Shopping
              </Button>
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
