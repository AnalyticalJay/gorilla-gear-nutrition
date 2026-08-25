import React from "react";
import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CreditCard, Loader2, Lock, MapPin, Package, Truck } from "lucide-react";
import { Link, useLocation, useParams } from "wouter";
import { format } from "date-fns";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";
import QuoteProgressTracker from "@/components/QuoteProgressTracker";
import QuoteConversation from "@/components/QuoteConversation";
import OrderTrackingTimeline from "@/components/OrderTrackingTimeline";

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending: "bg-[#a8751c]/10 text-[#7c5a20] border-[#a8751c]/30",
    quote_pending: "bg-[#a8751c]/10 text-[#7c5a20] border-[#a8751c]/30",
    quote_approved: "bg-[#a8751c]/10 text-[#7c5a20] border-[#a8751c]/30",
    quote_rejected: "bg-[#b42318]/8 text-[#b42318] border-[#b42318]/25",
    awaiting_payment: "bg-[#a8751c]/10 text-[#7c5a20] border-[#a8751c]/30",
    paid: "bg-[#1f7a45]/10 text-[#1f7a45] border-[#1f7a45]/25",
    processing: "bg-[#454545]/8 text-[#454545] border-[#454545]/20",
    shipped: "bg-[#a8751c]/10 text-[#7c5a20] border-[#a8751c]/30",
    completed: "bg-[#1f7a45]/10 text-[#1f7a45] border-[#1f7a45]/25",
    cancelled: "bg-destructive/20 text-destructive border-destructive/30",
  };
  return <Badge className={`${map[status] ?? "bg-muted text-muted-foreground"} text-xs capitalize`}>{status.replaceAll("_", " ")}</Badge>;
}

export default function OrderDetail() {
  const { orderId } = useParams<{ orderId: string }>();
  const [location] = useLocation();
  const { isAuthenticated, user } = useAuth();
  const utils = trpc.useUtils();
  const parsedOrderId = parseInt(orderId ?? "0");
  const [checkoutAction, setCheckoutAction] = useState<"ikhokha" | null>(null);

  const orderQuery = trpc.orders.detail.useQuery(
    { orderId: parsedOrderId },
    {
      enabled: isAuthenticated && !!orderId,
      refetchInterval: 30000,
      refetchIntervalInBackground: true,
    },
  );
  const order = orderQuery.data;

  const refreshTracking = trpc.orders.refreshTracking.useMutation({
    onSuccess: (data) => {
      utils.orders.detail.invalidate({ orderId: parsedOrderId });
      if (data.configured && data.synced > 0) {
        toast.success(`${data.synced} courier scan${data.synced === 1 ? "" : "s"} received.`);
      } else if (!data.configured && data.message) {
        toast.info(data.message);
      }
    },
    onError: (error) => toast.error(error.message),
  });

  useEffect(() => {
    const canSync = Boolean(order?.trackingNumber && ["shipped", "completed"].includes(order.status));
    if (!canSync) return;
    const interval = window.setInterval(() => {
      refreshTracking.mutate({ orderId: parsedOrderId });
    }, 60_000);
    return () => window.clearInterval(interval);
  }, [order?.trackingNumber, order?.status, parsedOrderId]);

  const handleTrackingRefresh = async () => {
    if (!order?.trackingNumber) {
      await orderQuery.refetch();
      return;
    }
    await refreshTracking.mutateAsync({ orderId: parsedOrderId });
    await orderQuery.refetch();
  };

  const choosePayment = trpc.orders.choosePayment.useMutation({
    onMutate: ({ method }) => setCheckoutAction(method),
    onSuccess: (data) => {
      if (!data.ikhokhaData?.paylinkUrl) {
        setCheckoutAction(null);
        toast.error("iKhokha checkout could not be generated. Please try again.");
        return;
      }
      toast.success("Opening secure iKhokha checkout. Select your preferred payment method to continue.");
      window.location.assign(data.ikhokhaData.paylinkUrl);
    },
    onError: (error) => {
      setCheckoutAction(null);
      toast.error(error.message);
    },
  });

  if (orderQuery.isLoading) {
    return <div className="min-h-screen flex flex-col bg-background"><Navbar /><main className="flex-1 container px-4 py-8 sm:py-12 sm:pb-12"><div className="max-w-3xl mx-auto space-y-4">{[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-accent/20 rounded-xl animate-pulse" />)}</div></main><Footer /></div>;
  }

  if (!order) {
    return <div className="min-h-screen flex flex-col bg-background"><Navbar /><main className="flex-1 container py-12 text-center"><p className="text-muted-foreground">Quote not found.</p><Link href="/account"><Button className="mt-4 text-white font-bold">Back to Account</Button></Link></main><Footer /></div>;
  }

  const canSelectPayment = order.status === "quote_approved" || (order.status === "awaiting_payment" && !order.paymentMethod);
  const isIkhokhaAwaiting = order.status === "awaiting_payment" && order.paymentMethod === "ikhokha" && order.paymentStatus === "pending";
  const paymentReturnState = new URLSearchParams(location.split("?")[1] ?? "").get("payment");

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 container px-4 py-8 sm:py-12 sm:pb-12">
        <div className="max-w-3xl mx-auto">
          <div className="flex flex-wrap items-start gap-3 mb-6 sm:mb-8">
            <Link href="/account"><button className="p-1.5 rounded-md hover:bg-accent"><ArrowLeft className="h-4 w-4" /></button></Link>
            <div className="min-w-0 mr-auto"><h1 className="text-xl font-black text-[#1f1f1f] sm:text-2xl">Quote <span style={{ color: "#a8751c" }}>#{order.id}</span></h1><p className="text-sm text-muted-foreground">Submitted {format(new Date(order.createdAt), "d MMMM yyyy")}</p></div>
            <StatusBadge status={order.status} />
          </div>

          <div className="grid gap-6">
            <OrderTrackingTimeline
              order={order}
              onRefresh={() => void handleTrackingRefresh()}
              isRefreshing={orderQuery.isFetching || refreshTracking.isPending}
              lastUpdatedAt={orderQuery.dataUpdatedAt}
            />
            <QuoteProgressTracker status={order.status} paymentStatus={order.paymentStatus} />
            <QuoteConversation orderId={order.id} comments={order.comments} viewerRole={user?.role === "admin" ? "admin" : "user"} />

            <div className="glass-card rounded-xl p-4 sm:p-6">
              <div className="flex items-center justify-between gap-3 mb-4"><div className="flex items-center gap-2"><Package className="h-4 w-4 text-primary" /><h2 className="font-bold">Products in Quote</h2></div><Badge variant="outline" className="border-[#a8751c]/30 bg-[#f6f0e4] text-[#7c5a20]">{order.items.length} {order.items.length === 1 ? "item" : "items"}</Badge></div>
              <div className="space-y-3">{order.items.length > 0 ? order.items.map((item) => <div key={item.id} className="flex flex-col gap-2 border-b border-border/20 py-3 last:border-0 sm:flex-row sm:items-start sm:justify-between sm:gap-4"><div className="min-w-0"><p className="font-medium text-sm">{item.productName}</p>{item.strength && <p className="text-xs text-primary/80 mt-1">{item.strength}</p>}<p className="text-xs text-muted-foreground mt-1">Qty: {item.quantity} × R{parseFloat(item.priceAtPurchase).toFixed(2)}</p></div><p className="self-end font-bold text-sm text-primary sm:self-auto">R{(parseFloat(item.priceAtPurchase) * item.quantity).toFixed(2)}</p></div>) : <p className="text-sm text-muted-foreground">Product details are being prepared for this quote.</p>}</div>
            </div>

            {order.shipping && <div className="glass-card rounded-xl p-4 sm:p-6"><div className="flex items-center gap-2 mb-4"><MapPin className="h-4 w-4 text-primary" /><h2 className="font-bold">Delivery Address</h2></div><div className="text-sm space-y-1"><p className="font-medium">{order.shipping.fullName}</p><p className="text-muted-foreground">{order.shipping.addressLine1}</p>{order.shipping.addressLine2 && <p className="text-muted-foreground">{order.shipping.addressLine2}</p>}<p className="text-muted-foreground">{order.shipping.city}, {order.shipping.postalCode}</p><p className="text-muted-foreground">{order.shipping.country}</p><p className="text-muted-foreground mt-2">{order.shipping.phone}</p></div></div>}

            <div className="glass-card rounded-xl p-4 sm:p-6">
              <div className="flex items-center gap-2 mb-4"><CreditCard className="h-4 w-4 text-primary" /><h2 className="font-bold">Quote & Payment</h2></div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>R{(parseFloat(order.totalAmount) - parseFloat(order.deliveryFee)).toFixed(2)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground flex items-center gap-1"><Truck className="h-3 w-3" /> Delivery</span><span>{parseFloat(order.deliveryFee) === 0 ? <span className="text-[#1f7a45]">Free</span> : `R${parseFloat(order.deliveryFee).toFixed(2)}`}</span></div>
                <div className="flex justify-between font-bold text-base border-t border-border/40 pt-2 mt-2"><span>Quote Total</span><span className="text-primary">R{parseFloat(order.totalAmount).toFixed(2)}</span></div>
                <div className="flex flex-wrap justify-between gap-3 text-xs mt-2"><span className="text-muted-foreground">Payment Status</span><Badge className={`text-xs ${order.paymentStatus === "paid" ? "bg-[#1f7a45]/10 text-[#1f7a45] border-[#1f7a45]/25" : "bg-[#a8751c]/10 text-[#7c5a20] border-[#a8751c]/30"}`}>{order.paymentStatus.replaceAll("_", " ")}</Badge></div>
                {order.paymentMethod && <div className="flex flex-wrap justify-between gap-3 text-xs"><span className="text-muted-foreground">Payment Method</span><span className="uppercase">{order.paymentMethod}</span></div>}
              </div>

              {order.status === "quote_pending" && <div className="mt-5 rounded-lg border border-[#a8751c]/20 bg-[#f6f0e4] p-4 text-sm text-[#7c5a20]"><Lock className="inline h-4 w-4 mr-2" />Payment will become available after an admin reviews and approves this quote.</div>}
              {order.status === "quote_rejected" && <div className="mt-5 rounded-lg border border-[#b42318]/20 bg-[#b42318]/5 p-4 text-sm text-[#b42318]">This quote was not approved. {order.rejectionReason || "Please contact the store if you need clarification."}</div>}
              {paymentReturnState === "cancelled" && <div role="status" className="mt-5 rounded-lg border border-[#a8751c]/30 bg-[#f6f0e4] p-4 text-sm text-[#7c5a20]"><strong>Payment cancelled.</strong> No payment was confirmed. You can try secure iKhokha checkout again.</div>}
              {paymentReturnState === "failed" && <div role="alert" className="mt-5 rounded-lg border border-[#b42318]/25 bg-[#b42318]/5 p-4 text-sm text-[#b42318]"><strong>Payment was not completed.</strong> Your approved quote remains available. Please try secure iKhokha checkout again.</div>}
              {canSelectPayment && <div className="mt-5 space-y-3">
                <Button className="min-h-11 w-full bg-[#a8751c] text-[#1f1f1f] font-bold hover:bg-[#c89536]" onClick={() => choosePayment.mutate({ orderId: order.id, method: "ikhokha" })} disabled={choosePayment.isPending}>{choosePayment.isPending && checkoutAction === "ikhokha" ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Preparing secure checkout…</> : <><CreditCard className="h-4 w-4 mr-2" />Pay securely with iKhokha</>}</Button>
                {choosePayment.isPending && checkoutAction === "ikhokha" && <div role="status" aria-live="polite" className="flex items-start gap-3 rounded-lg border border-[#a8751c]/30 bg-[#f6f0e4] px-3 py-3 text-sm text-[#6b665e]"><span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[#a8751c]/30 bg-white"><Loader2 className="h-3.5 w-3.5 animate-spin text-[#a8751c]" /></span><span><strong className="block text-[#7c5a20]">Creating your secure iKhokha payment link</strong><span className="mt-1 block text-xs leading-5">Please do not refresh or close this page. You will be redirected to iKhokha to choose your payment method.</span></span></div>}
                <p className="rounded-lg border border-[#a8751c]/20 bg-[#f6f0e4] px-3 py-2 text-xs leading-5 text-[#6b665e]">Secure iKhokha checkout is the available payment method for approved quotes. You will be redirected to complete payment through iKhokha.</p>
              </div>}
              {isIkhokhaAwaiting && <div className="mt-5 rounded-lg border border-[#a8751c]/30 bg-[#f6f0e4] p-4 text-sm space-y-3"><div className="flex items-center gap-2 font-bold text-[#7c5a20]"><Lock className="h-4 w-4" />Secure iKhokha payment pending</div><p className="text-[#6b665e]">Your payment link is ready. Once iKhokha confirms the payment, this quote will update automatically.</p>{order.ikhokhaPaylinkUrl && <Button className="min-h-11 bg-[#a8751c] text-[#1f1f1f] hover:bg-[#c89536]" onClick={() => { if (order.ikhokhaPaylinkUrl) window.location.assign(order.ikhokhaPaylinkUrl); }}><CreditCard className="mr-2 h-4 w-4" />Continue secure payment</Button>}</div>}
            </div>

            {order.quoteNotes && order.status !== "awaiting_payment" && <div className="glass-card rounded-xl p-4 sm:p-6"><h2 className="font-bold mb-2">Review Notes</h2><p className="text-sm text-muted-foreground whitespace-pre-wrap">{order.quoteNotes}</p></div>}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
