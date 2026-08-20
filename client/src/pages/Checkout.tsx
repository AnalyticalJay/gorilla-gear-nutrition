import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, CheckCircle2, ClipboardCheck, Lock, MessageSquare, Send, Truck } from "lucide-react";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import React, { useState } from "react";
import { NATIONWIDE_SHIPPING_FEE_ZAR } from "@shared/shipping";

type FormData = {
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  postalCode: string;
  country: string;
  notes?: string;
};

type SubmittedQuote = {
  quoteId: number;
  total: string;
  deliveryFee: string;
  itemCount: number;
  city: string;
};

export default function Checkout() {
  const { user, isAuthenticated } = useAuth();
  const isApproved = (user as any)?.status === "approved";
  const [, navigate] = useLocation();
  const [submittedQuote, setSubmittedQuote] = useState<SubmittedQuote | null>(null);
  const cartQuery = trpc.cart.get.useQuery(undefined, { enabled: isApproved });
  const items = cartQuery.data ?? [];

  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      fullName: (user as any)?.fullName ?? "",
      phone: (user as any)?.phone ?? "",
      city: (user as any)?.city ?? "",
      country: "South Africa",
    },
  });

  const city = watch("city");
  const deliveryQuery = trpc.delivery.calculate.useQuery(
    { city: city || "" },
    { enabled: city?.length > 1 }
  );
  const delivery = deliveryQuery.data;
  const subtotal = items.reduce((sum, item) => sum + parseFloat(item.productPrice) * item.quantity, 0);
  const deliveryFee = delivery?.fee ?? NATIONWIDE_SHIPPING_FEE_ZAR;
  const estimatedTotal = subtotal + deliveryFee;

  const submitQuote = trpc.orders.submitQuote.useMutation({
    onSuccess: (data, variables) => {
      setSubmittedQuote({
        quoteId: data.quoteId,
        total: data.total,
        deliveryFee: data.deliveryFee,
        itemCount: items.reduce((count, item) => count + item.quantity, 0),
        city: variables.shipping.city,
      });
      toast.success(`Quote request #${data.quoteId} submitted for review`);
    },
    onError: (err) => toast.error(err.message),
  });

  if (!isAuthenticated || !isApproved) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 container text-center py-24">
          <Lock className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-30" />
          <h2 className="text-2xl font-bold mb-2">Approval Required</h2>
          <p className="text-muted-foreground mb-6">Only approved members can submit quote requests.</p>
          <Link href="/login"><Button className="text-white font-bold">Sign In</Button></Link>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 container text-center py-24">
          <h2 className="text-2xl font-bold mb-2">Your quote cart is empty</h2>
          <p className="text-muted-foreground mb-6">Add products to your quote cart before submitting a request.</p>
          <Link href="/products"><Button className="text-white font-bold">Browse Products</Button></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 pb-24 sm:pb-8">
        <div className="container px-4 py-6 sm:py-8">
          <Link href="/cart" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 no-underline">
            <ArrowLeft className="h-4 w-4" />
            Back to Quote Cart
          </Link>

          <div className="mb-8 max-w-3xl">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-[#0EA5E9]">Admin-reviewed pricing</p>
            <h1 className="text-2xl font-black mt-2 sm:text-3xl">
              Submit <span style={{ color: "#0EA5E9" }}>Quote Request</span>
            </h1>
            <p className="text-muted-foreground mt-3 max-w-2xl">
              Submit your selected products and delivery details. Gorilla Gear Nutrition will review the request and confirm the final quote before payment is enabled.
            </p>
          </div>

          <form onSubmit={handleSubmit((data: FormData) => submitQuote.mutate({ shipping: {
            fullName: data.fullName,
            phone: data.phone,
            addressLine1: data.addressLine1,
            addressLine2: data.addressLine2,
            city: data.city,
            postalCode: data.postalCode,
            country: data.country,
          }, notes: data.notes }))}>
            <div className="grid gap-6 lg:grid-cols-3 lg:gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="glass-card rounded-xl p-4 sm:p-6">
                  <div className="flex items-center gap-2 mb-6">
                    <Truck className="h-5 w-5 text-primary" />
                    <h2 className="font-bold text-lg">Delivery Details</h2>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <Label className="text-sm font-medium">Full Name</Label>
                      <Input {...register("fullName", { required: "Full name is required" })} className="mt-1.5 bg-input border-border" />
                      {errors.fullName && <p className="text-destructive text-xs mt-1">{errors.fullName.message}</p>}
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Phone Number</Label>
                      <Input {...register("phone", { required: "Phone number is required" })} className="mt-1.5 bg-input border-border" />
                      {errors.phone && <p className="text-destructive text-xs mt-1">{errors.phone.message}</p>}
                    </div>
                    <div>
                      <Label className="text-sm font-medium">City</Label>
                      <Input {...register("city", { required: "City is required" })} className="mt-1.5 bg-input border-border" />
                      {errors.city && <p className="text-destructive text-xs mt-1">{errors.city.message}</p>}
                    </div>
                    <div className="sm:col-span-2">
                      <Label className="text-sm font-medium">Address Line 1</Label>
                      <Input {...register("addressLine1", { required: "Address is required" })} placeholder="Street address" className="mt-1.5 bg-input border-border" />
                      {errors.addressLine1 && <p className="text-destructive text-xs mt-1">{errors.addressLine1.message}</p>}
                    </div>
                    <div className="sm:col-span-2">
                      <Label className="text-sm font-medium">Address Line 2 (Optional)</Label>
                      <Input {...register("addressLine2")} placeholder="Apartment, suite, etc." className="mt-1.5 bg-input border-border" />
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Postal Code</Label>
                      <Input {...register("postalCode", { required: "Postal code is required" })} className="mt-1.5 bg-input border-border" />
                      {errors.postalCode && <p className="text-destructive text-xs mt-1">{errors.postalCode.message}</p>}
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Country</Label>
                      <Input {...register("country")} className="mt-1.5 bg-input border-border" readOnly />
                    </div>
                    <div className="sm:col-span-2">
                      <Label className="text-sm font-medium">Message to the reviewing team (Optional)</Label>
                      <Textarea {...register("notes")} placeholder="Add preferred pack sizes, questions, or delivery notes..." className="mt-1.5 min-h-28 bg-input border-border" />
                    </div>
                  </div>
                </div>

                {city?.length > 1 && (
                  <div className="glass-card flex flex-wrap items-start gap-3 rounded-xl p-4 sm:items-center">
                    <Truck className="h-5 w-5 text-primary shrink-0" />
                    <div>
                      <p className="text-sm font-medium">
                        Nationwide Delivery — R{deliveryFee.toFixed(2)}
                      </p>
                      <p className="text-xs text-muted-foreground">A flat R140 delivery fee applies nationwide across South Africa.</p>
                    </div>
                    <span className="text-xs font-semibold text-[#0EA5E9] bg-[#0EA5E9]/10 px-2 py-1 rounded sm:ml-auto">NATIONWIDE RATE</span>
                  </div>
                )}
              </div>

              <div className="glass-card h-fit rounded-xl p-4 sm:p-6 lg:sticky lg:top-24">
                <h2 className="font-bold text-lg mb-4">Quote Summary</h2>
                <div className="space-y-3 mb-4">
                  {items.map((item) => (
                    <div key={item.id} className="flex flex-wrap items-start justify-between gap-2 text-sm">
                      <span className="min-w-0 flex-1 text-muted-foreground">{item.productName} ×{item.quantity}</span>
                      <span className="shrink-0">R{(parseFloat(item.productPrice) * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-border pt-3 space-y-2 mb-4">
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground">Estimated subtotal</span><span>R{subtotal.toFixed(2)}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground">Nationwide delivery</span><span>R{deliveryFee.toFixed(2)}</span></div>
                </div>
                <div className="border-t border-border pt-3 mb-5">
                  <div className="flex justify-between font-bold text-lg"><span>Estimated total</span><span className="text-primary">R{estimatedTotal.toFixed(2)}</span></div>
                </div>
                <Button type="submit" className="min-h-11 w-full text-white font-bold" disabled={submitQuote.isPending}>
                  <Send className="h-4 w-4 mr-2" />
                  {submitQuote.isPending ? "Submitting..." : "Submit Quote Request"}
                </Button>
                <p className="text-xs text-muted-foreground text-center mt-3 flex items-center justify-center gap-1">
                  <MessageSquare className="h-3 w-3" />
                  Admin review required before payment
                </p>
              </div>
            </div>
          </form>
        </div>
      </div>
      <Dialog open={Boolean(submittedQuote)} onOpenChange={(open) => !open && setSubmittedQuote(null)}>
        <DialogContent className="border-[#e5dfd4] bg-white p-0 text-[#1f1f1f] sm:max-w-lg">
          {submittedQuote && <>
            <div className="border-b border-[#ead8ad] bg-[#fdf7e9] px-5 pb-5 pt-6 sm:px-7">
              <div className="flex items-start gap-4 pr-7">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#1f7a45] text-white shadow-sm">
                  <CheckCircle2 className="h-6 w-6" aria-hidden="true" />
                </div>
                <DialogHeader className="space-y-1 text-left">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#a8751c]">Quote submitted</p>
                  <DialogTitle className="text-xl font-black uppercase tracking-tight text-[#1f1f1f] sm:text-2xl">We’ve received your request</DialogTitle>
                  <DialogDescription className="text-sm leading-relaxed text-[#6b665e]">Your quote is now with the Gorilla Gear team for review.</DialogDescription>
                </DialogHeader>
              </div>
            </div>
            <div className="space-y-5 px-5 py-5 sm:px-7 sm:py-6">
              <div className="grid grid-cols-2 gap-3 rounded-lg border border-[#e5dfd4] bg-[#fcfbf8] p-4 text-sm">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wide text-[#6b665e]">Quote reference</p>
                  <p className="mt-1 text-lg font-black text-[#a8751c]">#{submittedQuote.quoteId}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wide text-[#6b665e]">Items submitted</p>
                  <p className="mt-1 text-lg font-black text-[#1f1f1f]">{submittedQuote.itemCount} {submittedQuote.itemCount === 1 ? "item" : "items"}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wide text-[#6b665e]">Delivery to</p>
                  <p className="mt-1 font-bold text-[#454545]">{submittedQuote.city}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wide text-[#6b665e]">Estimated total</p>
                  <p className="mt-1 font-black text-[#1f1f1f]">R{Number(submittedQuote.total).toFixed(2)}</p>
                  <p className="mt-0.5 text-[10px] text-[#6b665e]">Includes R{Number(submittedQuote.deliveryFee).toFixed(2)} delivery</p>
                </div>
              </div>
              <div className="flex gap-3 rounded-lg border border-[#a8751c]/20 bg-[#f6f0e4] p-4">
                <ClipboardCheck className="mt-0.5 h-5 w-5 shrink-0 text-[#a8751c]" aria-hidden="true" />
                <div className="text-sm leading-relaxed text-[#684713]">
                  <p className="font-bold text-[#5f4210]">What happens next</p>
                  <p className="mt-1">We’ll review your availability and final quote. Once approved, you’ll receive an email and can choose iKhokha or Manual EFT from your quote status page.</p>
                </div>
              </div>
            </div>
            <DialogFooter className="flex-col gap-2 border-t border-[#e5dfd4] bg-[#fcfbf8] px-5 py-4 sm:flex-row sm:justify-between sm:px-7">
              <Button type="button" variant="outline" className="min-h-11 w-full border-[#d5c7b0] text-[#454545] hover:bg-[#f6f0e4] sm:w-auto" onClick={() => { setSubmittedQuote(null); navigate("/products"); }}>Continue browsing</Button>
              <Button type="button" className="min-h-11 w-full bg-[#a8751c] font-bold text-white hover:bg-[#865b14] sm:w-auto" onClick={() => { const quoteId = submittedQuote.quoteId; setSubmittedQuote(null); navigate(`/orders/${quoteId}`); }}>View quote status</Button>
            </DialogFooter>
          </>}
        </DialogContent>
      </Dialog>
      <Footer />
    </div>
  );
}
