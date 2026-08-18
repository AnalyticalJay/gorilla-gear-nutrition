import React from "react";
import { useEffect } from "react";
import { trpc } from "@/lib/trpc";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Banknote, CheckCircle2, CreditCard, Lock, MapPin, Package, Send, Truck } from "lucide-react";
import { Link, useParams } from "wouter";
import { format } from "date-fns";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";
import QuoteProgressTracker from "@/components/QuoteProgressTracker";
import QuoteConversation from "@/components/QuoteConversation";
import OrderTrackingTimeline from "@/components/OrderTrackingTimeline";
import { proofStatusMeta, resolveProofStatus } from "@shared/paymentProof";

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
  const { isAuthenticated, user } = useAuth();
  const utils = trpc.useUtils();
  const parsedOrderId = parseInt(orderId ?? "0");

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
    onSuccess: (data) => {
      if (data.method === "eft") {
        toast.success("Manual EFT selected. Follow the banking instructions and upload your proof of payment.");
        utils.orders.detail.invalidate({ orderId: parsedOrderId });
        return;
      }
      if (!data.ikhokhaData?.paylinkUrl) {
        toast.error("iKhokha checkout could not be generated. Please try again or use Manual EFT & POP.");
        return;
      }
      toast.success("Opening secure iKhokha checkout. Select your preferred payment method to continue.");
      window.location.assign(data.ikhokhaData.paylinkUrl);
    },
    onError: (error) => toast.error(error.message),
  });

  const uploadProof = trpc.orders.uploadProof.useMutation({
    onSuccess: () => {
      toast.success("Proof of payment uploaded successfully. Awaiting admin verification.");
      utils.orders.detail.invalidate({ orderId: parsedOrderId });
    },
    onError: (error) => toast.error(error.message),
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      uploadProof.mutate({ orderId: parsedOrderId, dataUrl: result, fileName: file.name });
    };
    reader.readAsDataURL(file);
  };

  if (orderQuery.isLoading) {
    return <div className="min-h-screen flex flex-col bg-background"><Navbar /><main className="flex-1 container px-4 py-8 pb-24 sm:py-12 sm:pb-12"><div className="max-w-3xl mx-auto space-y-4">{[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-accent/20 rounded-xl animate-pulse" />)}</div></main><Footer /></div>;
  }

  if (!order) {
    return <div className="min-h-screen flex flex-col bg-background"><Navbar /><main className="flex-1 container py-12 text-center"><p className="text-muted-foreground">Quote not found.</p><Link href="/account"><Button className="mt-4 text-white font-bold">Back to Account</Button></Link></main><Footer /></div>;
  }

  const canSelectPayment = order.status === "quote_approved" || (order.status === "awaiting_payment" && !order.paymentMethod);
  const isEftAwaiting = order.status === "awaiting_payment" && order.paymentMethod === "eft";
  const isIkhokhaAwaiting = order.status === "awaiting_payment" && order.paymentMethod === "ikhokha" && order.paymentStatus === "pending";
  const proofStatus = resolveProofStatus(order);
  const proofMeta = proofStatusMeta[proofStatus];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 container px-4 py-8 pb-24 sm:py-12 sm:pb-12">
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
              <div className="flex items-center gap-2 mb-4"><Package className="h-4 w-4 text-primary" /><h2 className="font-bold">Products in Quote</h2></div>
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
                {(order.paymentMethod === "eft" || order.proofOfPaymentUrl) && (
                  <div className="mt-4 rounded-lg border border-border/40 bg-background/30 p-3 space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Proof of payment</span>
                      <Badge className={`text-xs ${proofMeta.className}`}>{proofMeta.label}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{proofMeta.description}</p>
                    {proofStatus === "rejected" && order.proofReviewNote && <p className="rounded border border-[#b42318]/20 bg-[#b42318]/5 p-2 text-xs text-[#b42318]"><strong>Admin note:</strong> {order.proofReviewNote}</p>}
                    {order.proofOfPaymentUrl && <a href={order.proofOfPaymentUrl} target="_blank" rel="noreferrer" className="block text-xs text-primary underline">View uploaded receipt</a>}
                  </div>
                )}
              </div>

              {order.status === "quote_pending" && <div className="mt-5 rounded-lg border border-[#a8751c]/20 bg-[#f6f0e4] p-4 text-sm text-[#7c5a20]"><Lock className="inline h-4 w-4 mr-2" />Payment will become available after an admin reviews and approves this quote.</div>}
              {order.status === "quote_rejected" && <div className="mt-5 rounded-lg border border-[#b42318]/20 bg-[#b42318]/5 p-4 text-sm text-[#b42318]">This quote was not approved. {order.rejectionReason || "Please contact the store if you need clarification."}</div>}
              {canSelectPayment && <div className="mt-5 space-y-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  <Button className="min-h-11 bg-[#a8751c] text-[#1f1f1f] font-bold hover:bg-[#c89536]" onClick={() => choosePayment.mutate({ orderId: order.id, method: "ikhokha" })} disabled={choosePayment.isPending}><CreditCard className="h-4 w-4 mr-2" />Pay securely with iKhokha</Button>
                  <Button variant="outline" className="min-h-11 font-bold border-[#a8751c]/40 hover:bg-[#f6f0e4]" onClick={() => choosePayment.mutate({ orderId: order.id, method: "eft" })} disabled={choosePayment.isPending}><Banknote className="h-4 w-4 mr-2" />Manual EFT &amp; POP</Button>
                </div>
                <p className="rounded-lg border border-[#a8751c]/20 bg-[#f6f0e4] px-3 py-2 text-xs leading-5 text-[#6b665e]">Secure iKhokha checkout lets you select the available payment method on the payment page. <strong className="text-[#1f1f1f]">Manual EFT &amp; POP</strong> remains available if you prefer to submit a bank transfer for review.</p>
              </div>}
              {isIkhokhaAwaiting && <div className="mt-5 rounded-lg border border-[#a8751c]/30 bg-[#f6f0e4] p-4 text-sm space-y-3"><div className="flex items-center gap-2 font-bold text-[#7c5a20]"><Lock className="h-4 w-4" />Secure iKhokha payment pending</div><p className="text-[#6b665e]">Your payment link is ready. Once iKhokha confirms the payment, this quote will update automatically.</p>{order.ikhokhaPaylinkUrl && <Button className="min-h-11 bg-[#a8751c] text-[#1f1f1f] hover:bg-[#c89536]" onClick={() => { if (order.ikhokhaPaylinkUrl) window.location.assign(order.ikhokhaPaylinkUrl); }}><CreditCard className="mr-2 h-4 w-4" />Continue secure payment</Button>}</div>}
              {isEftAwaiting && (
                <div className="mt-5 rounded-lg border border-[#a8751c]/30 bg-[#f6f0e4] p-4 text-sm space-y-4">
                  <div className="flex items-center gap-2 font-bold text-[#7c5a20]"><CheckCircle2 className="h-4 w-4" />EFT payment selected</div>
                  <p className="text-muted-foreground">Please transfer R{parseFloat(order.totalAmount).toFixed(2)} to Gorilla Gear Nutrition (Bank: FNB, Acc: 62812345678, Branch: 250655) using reference <strong className="text-foreground">Quote #{order.id}</strong>.</p>
                  {order.quoteNotes && <p className="whitespace-pre-wrap text-foreground bg-background/40 p-3 rounded">{order.quoteNotes}</p>}

                  <div className="border-t border-border/40 pt-4">
                    <h3 className="font-bold mb-2">Upload Proof of Payment (POP)</h3>
                    {proofStatus === "pending" || proofStatus === "approved" ? (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-[#1f7a45] font-medium">
                          <CheckCircle2 className="h-4 w-4" /> POP uploaded successfully
                        </div>
                        <p className="text-xs text-muted-foreground">{proofMeta.description}</p>
                        {order.proofOfPaymentUrl && <a href={order.proofOfPaymentUrl} target="_blank" rel="noreferrer" className="text-xs text-primary underline block">View uploaded receipt</a>}
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <p className="text-xs text-muted-foreground">{proofStatus === "rejected" ? "Please upload a corrected bank deposit slip or POP screenshot." : "Upload your bank deposit slip or POP screenshot (PDF, PNG, JPG) for admin review."}</p>
                        {proofStatus === "rejected" && order.proofReviewNote && <p className="rounded border border-[#b42318]/20 bg-[#b42318]/5 p-2 text-xs text-[#b42318]"><strong>Admin note:</strong> {order.proofReviewNote}</p>}
                        <input
                          aria-label="Upload proof of payment"
                          type="file"
                          accept="image/*,application/pdf"
                          className="block w-full text-xs text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-bold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 cursor-pointer"
                          onChange={handleFileChange}
                          disabled={uploadProof.isPending}
                        />
                        {uploadProof.isPending && <p className="text-xs text-primary animate-pulse">Uploading proof of payment...</p>}
                      </div>
                    )}
                  </div>
                </div>
              )}

            </div>

            {order.quoteNotes && order.status !== "awaiting_payment" && <div className="glass-card rounded-xl p-4 sm:p-6"><h2 className="font-bold mb-2">Review Notes</h2><p className="text-sm text-muted-foreground whitespace-pre-wrap">{order.quoteNotes}</p></div>}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
