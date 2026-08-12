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

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    quote_pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    quote_approved: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    quote_rejected: "bg-red-500/20 text-red-400 border-red-500/30",
    awaiting_payment: "bg-orange-500/20 text-orange-400 border-orange-500/30",
    paid: "bg-green-500/20 text-green-400 border-green-500/30",
    processing: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    shipped: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
    completed: "bg-green-500/20 text-green-400 border-green-500/30",
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
    { enabled: isAuthenticated && !!orderId }
  );
  const order = orderQuery.data;

  const choosePayment = trpc.orders.choosePayment.useMutation({
    onSuccess: (data) => {
      if (data.method === "eft") {
        toast.success("EFT selected. Follow the payment instructions below.");
        utils.orders.detail.invalidate({ orderId: parsedOrderId });
        return;
      }
      if (!data.payfastReference) {
        toast.error("PayFast reference could not be created.");
        return;
      }
      submitPayFast({ orderId: data.orderId, payfastReference: data.payfastReference, total: data.total });
    },
    onError: (error) => toast.error(error.message),
  });

  const submitPayFast = (payment: { orderId: number; payfastReference: string; total: string }) => {
    const form = document.createElement("form");
    form.method = "POST";
    form.action = "https://www.payfast.co.za/eng/process";
    const params: Record<string, string> = {
      merchant_id: import.meta.env.VITE_PAYFAST_MERCHANT_ID || "10000100",
      merchant_key: import.meta.env.VITE_PAYFAST_MERCHANT_KEY || "46f0cd694581a",
      return_url: `${window.location.origin}/order-success/${payment.orderId}`,
      cancel_url: `${window.location.origin}/orders/${payment.orderId}`,
      notify_url: `${window.location.origin}/api/trpc/orders.payfastItn`,
      m_payment_id: payment.payfastReference,
      amount: parseFloat(payment.total).toFixed(2),
      item_name: `Gorilla Gear Nutrition Approved Quote #${payment.orderId}`,
      email_address: (user as any)?.email ?? "",
      name_first: ((user as any)?.fullName ?? "").split(" ")[0] ?? "",
      name_last: ((user as any)?.fullName ?? "").split(" ").slice(1).join(" ") || ".",
    };
    Object.entries(params).forEach(([key, value]) => {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = key;
      input.value = value;
      form.appendChild(input);
    });
    document.body.appendChild(form);
    form.submit();
  };

  if (orderQuery.isLoading) {
    return <div className="min-h-screen flex flex-col bg-background"><Navbar /><main className="flex-1 container py-12"><div className="max-w-3xl mx-auto space-y-4">{[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-accent/20 rounded-xl animate-pulse" />)}</div></main><Footer /></div>;
  }

  if (!order) {
    return <div className="min-h-screen flex flex-col bg-background"><Navbar /><main className="flex-1 container py-12 text-center"><p className="text-muted-foreground">Quote not found.</p><Link href="/account"><Button className="mt-4 text-white font-bold">Back to Account</Button></Link></main><Footer /></div>;
  }

  const isApprovedForPayment = order.status === "quote_approved";
  const isEftAwaiting = order.status === "awaiting_payment" && order.paymentMethod === "eft";

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 container py-12">
        <div className="max-w-3xl mx-auto">
          <div className="flex flex-wrap items-center gap-3 mb-8">
            <Link href="/account"><button className="p-1.5 rounded-md hover:bg-accent"><ArrowLeft className="h-4 w-4" /></button></Link>
            <div className="min-w-0 mr-auto"><h1 className="text-2xl font-black">Quote <span style={{ color: "#0EA5E9" }}>#{order.id}</span></h1><p className="text-sm text-muted-foreground">Submitted {format(new Date(order.createdAt), "d MMMM yyyy")}</p></div>
            <StatusBadge status={order.status} />
          </div>

          <div className="grid gap-6">
            <QuoteProgressTracker status={order.status} paymentStatus={order.paymentStatus} />
            <QuoteConversation orderId={order.id} comments={order.comments} viewerRole={user?.role === "admin" ? "admin" : "user"} />

            <div className="glass-card rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4"><Package className="h-4 w-4 text-primary" /><h2 className="font-bold">Products in Quote</h2></div>
              <div className="space-y-3">{order.items.map((item) => <div key={item.id} className="flex items-center justify-between py-2 border-b border-border/20 last:border-0"><div><p className="font-medium text-sm">{item.productName}</p><p className="text-xs text-muted-foreground">Qty: {item.quantity}</p></div><p className="font-bold text-sm text-primary">R{(parseFloat(item.priceAtPurchase) * item.quantity).toFixed(2)}</p></div>)}</div>
            </div>

            {order.shipping && <div className="glass-card rounded-xl p-6"><div className="flex items-center gap-2 mb-4"><MapPin className="h-4 w-4 text-primary" /><h2 className="font-bold">Delivery Address</h2></div><div className="text-sm space-y-1"><p className="font-medium">{order.shipping.fullName}</p><p className="text-muted-foreground">{order.shipping.addressLine1}</p>{order.shipping.addressLine2 && <p className="text-muted-foreground">{order.shipping.addressLine2}</p>}<p className="text-muted-foreground">{order.shipping.city}, {order.shipping.postalCode}</p><p className="text-muted-foreground">{order.shipping.country}</p><p className="text-muted-foreground mt-2">{order.shipping.phone}</p></div></div>}

            <div className="glass-card rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4"><CreditCard className="h-4 w-4 text-primary" /><h2 className="font-bold">Quote & Payment</h2></div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>R{(parseFloat(order.totalAmount) - parseFloat(order.deliveryFee)).toFixed(2)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground flex items-center gap-1"><Truck className="h-3 w-3" /> Delivery</span><span>{parseFloat(order.deliveryFee) === 0 ? <span className="text-green-400">Free</span> : `R${parseFloat(order.deliveryFee).toFixed(2)}`}</span></div>
                <div className="flex justify-between font-bold text-base border-t border-border/40 pt-2 mt-2"><span>Quote Total</span><span className="text-primary">R{parseFloat(order.totalAmount).toFixed(2)}</span></div>
                <div className="flex justify-between text-xs mt-2"><span className="text-muted-foreground">Payment Status</span><Badge className={`text-xs ${order.paymentStatus === "paid" ? "bg-green-500/20 text-green-400 border-green-500/30" : "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"}`}>{order.paymentStatus.replaceAll("_", " ")}</Badge></div>
                {order.paymentMethod && <div className="flex justify-between text-xs"><span className="text-muted-foreground">Payment Method</span><span className="uppercase">{order.paymentMethod}</span></div>}
              </div>

              {order.status === "quote_pending" && <div className="mt-5 rounded-lg border border-yellow-500/20 bg-yellow-500/5 p-4 text-sm text-yellow-200"><Lock className="inline h-4 w-4 mr-2" />Payment will become available after an admin reviews and approves this quote.</div>}
              {order.status === "quote_rejected" && <div className="mt-5 rounded-lg border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-200">This quote was not approved. {order.rejectionReason || "Please contact the store if you need clarification."}</div>}
              {isApprovedForPayment && <div className="mt-5 grid gap-3 sm:grid-cols-2"><Button className="min-h-11 text-white font-bold" onClick={() => choosePayment.mutate({ orderId: order.id, method: "payfast" })} disabled={choosePayment.isPending}><CreditCard className="h-4 w-4 mr-2" />Pay via PayFast</Button><Button variant="outline" className="min-h-11 font-bold border-[#0EA5E9]/40" onClick={() => choosePayment.mutate({ orderId: order.id, method: "eft" })} disabled={choosePayment.isPending}><Banknote className="h-4 w-4 mr-2" />Pay via EFT</Button></div>}
              {isEftAwaiting && <div className="mt-5 rounded-lg border border-[#0EA5E9]/30 bg-[#0EA5E9]/5 p-4 text-sm"><div className="flex items-center gap-2 font-bold text-[#38BDF8] mb-2"><CheckCircle2 className="h-4 w-4" />EFT payment selected</div><p className="text-muted-foreground">Please use the banking details provided by Gorilla Gear Nutrition in your approval instructions and include Quote #{order.id} as the payment reference. Send proof of payment to the store for confirmation.</p>{order.quoteNotes && <p className="mt-3 whitespace-pre-wrap text-foreground">{order.quoteNotes}</p>}</div>}
            </div>

            {order.quoteNotes && order.status !== "awaiting_payment" && <div className="glass-card rounded-xl p-6"><h2 className="font-bold mb-2">Review Notes</h2><p className="text-sm text-muted-foreground whitespace-pre-wrap">{order.quoteNotes}</p></div>}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
