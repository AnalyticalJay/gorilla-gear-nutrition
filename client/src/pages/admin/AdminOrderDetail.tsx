import { trpc } from "@/lib/trpc";
import { useParams, Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Package, MapPin, CreditCard, Truck, User } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { useState } from "react";
import QuoteConversation from "@/components/QuoteConversation";

const ORDER_STATUSES = ["quote_pending", "quote_approved", "quote_rejected", "awaiting_payment", "paid", "processing", "shipped", "completed", "cancelled"];

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    quote_pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    quote_approved: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    quote_rejected: "bg-red-500/20 text-red-400 border-red-500/30",
    awaiting_payment: "bg-orange-500/20 text-orange-400 border-orange-500/30",
    paid: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    processing: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    shipped: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
    completed: "bg-green-500/20 text-green-400 border-green-500/30",
    cancelled: "bg-destructive/20 text-destructive border-destructive/30",
  };
  return <Badge className={`${map[status] ?? "bg-muted text-muted-foreground"} text-xs capitalize`}>{status.replaceAll("_", " ")}</Badge>;
}

export default function AdminOrderDetail() {
  const { orderId } = useParams<{ orderId: string }>();
  const utils = trpc.useUtils();
  const [newStatus, setNewStatus] = useState<string>("");

  const orderQuery = trpc.orders.adminDetail.useQuery(
    { orderId: parseInt(orderId ?? "0") },
    { enabled: !!orderId }
  );
  const order = orderQuery.data;

  const confirmEft = trpc.orders.confirmEft.useMutation({
    onSuccess: () => {
      toast.success("EFT payment confirmed");
      utils.orders.adminDetail.invalidate({ orderId: parseInt(orderId ?? "0") });
      utils.orders.adminList.invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  const updateStatus = trpc.orders.adminUpdateStatus.useMutation({
    onSuccess: () => {
      toast.success("Order status updated");
      utils.orders.adminDetail.invalidate({ orderId: parseInt(orderId ?? "0") });
      utils.orders.adminList.invalidate();
      setNewStatus("");
    },
    onError: (e) => toast.error(e.message),
  });

  if (orderQuery.isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 bg-accent/20 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Order not found.</p>
        <Link href="/admin/orders">
          <Button className="mt-4 text-white font-bold">Back to Orders</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/orders">
          <button className="p-1.5 rounded-md hover:bg-accent">
            <ArrowLeft className="h-4 w-4" />
          </button>
        </Link>
        <div>
          <h1 className="text-2xl font-black" >
            Order <span style={{ color: "#0EA5E9" }}>#{order.id}</span>
          </h1>
          <p className="text-sm text-muted-foreground">
            {format(new Date(order.createdAt), "d MMMM yyyy, HH:mm")}
          </p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      {/* Status Update */}
      <div className="glass-card rounded-xl p-6">
        <h2 className="font-bold mb-4">Update Order Status</h2>
        <div className="flex gap-3 items-center">
          <Select value={newStatus} onValueChange={setNewStatus}>
            <SelectTrigger className="w-48 bg-background/50">
              <SelectValue placeholder="Select new status" />
            </SelectTrigger>
            <SelectContent>
              {ORDER_STATUSES.map((s) => (
                <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            className="text-white font-bold"
            disabled={!newStatus || updateStatus.isPending}
            onClick={() => {
              if (newStatus) {
                updateStatus.mutate({ orderId: order.id, status: newStatus as any });
              }
            }}
          >
            {updateStatus.isPending ? "Updating..." : "Update Status"}
          </Button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Customer Info */}
        <div className="glass-card rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <User className="h-4 w-4 text-primary" />
            <h2 className="font-bold">Customer</h2>
          </div>
          <div className="text-sm space-y-1">
            <p className="font-medium">User ID: {order.userId}</p>
            <p className="text-muted-foreground">Order #{order.id}</p>
          </div>
        </div>

        {/* Payment Info */}
        <div className="glass-card rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <CreditCard className="h-4 w-4 text-primary" />
            <h2 className="font-bold">Payment</h2>
          </div>
          <div className="text-sm space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status</span>
              <Badge className={`text-xs ${order.paymentStatus === "paid" ? "bg-green-500/20 text-green-400 border-green-500/30" : "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"}`}>
                {order.paymentStatus}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total</span>
              <span className="font-bold text-primary">R{parseFloat(order.totalAmount).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Delivery</span>
              <span>
                {parseFloat(order.deliveryFee) === 0
                  ? <span className="text-green-400">Free</span>
                  : `R${parseFloat(order.deliveryFee).toFixed(2)}`}
              </span>
            </div>
            {order.paymentMethod && <div className="flex justify-between"><span className="text-muted-foreground">Method</span><span className="uppercase">{order.paymentMethod}</span></div>}
            {order.payfastReference && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">PayFast Ref</span>
                <span className="font-mono text-xs">{order.payfastReference}</span>
              </div>
            )}
            {order.status === "awaiting_payment" && order.paymentMethod === "eft" && <Button className="w-full mt-3 bg-green-600 hover:bg-green-700 text-white font-bold" onClick={() => confirmEft.mutate({ orderId: order.id })} disabled={confirmEft.isPending}>{confirmEft.isPending ? "Confirming..." : "Confirm EFT Payment"}</Button>}
          </div>
        </div>
      </div>

      {/* Order Items */}
      <div className="glass-card rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Package className="h-4 w-4 text-primary" />
          <h2 className="font-bold">Items Ordered</h2>
        </div>
        <div className="space-y-3">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center justify-between py-2 border-b border-border/20 last:border-0">
              <div>
                <p className="font-medium text-sm">{item.productName}</p>
                <p className="text-xs text-muted-foreground">
                  Qty: {item.quantity} × R{parseFloat(item.priceAtPurchase).toFixed(2)}
                </p>
              </div>
              <p className="font-bold text-sm text-primary">
                R{(parseFloat(item.priceAtPurchase) * item.quantity).toFixed(2)}
              </p>
            </div>
          ))}
          <div className="flex justify-between font-bold pt-2">
            <span>Total</span>
            <span className="text-primary">R{parseFloat(order.totalAmount).toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Shipping Details */}
      {order.shipping && (
        <div className="glass-card rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="h-4 w-4 text-primary" />
            <h2 className="font-bold">Shipping Address</h2>
          </div>
          <div className="text-sm space-y-1">
            <p className="font-medium">{order.shipping.fullName}</p>
            <p className="text-muted-foreground">{order.shipping.addressLine1}</p>
            {order.shipping.addressLine2 && (
              <p className="text-muted-foreground">{order.shipping.addressLine2}</p>
            )}
            <p className="text-muted-foreground">
              {order.shipping.city}, {order.shipping.postalCode}
            </p>
            <p className="text-muted-foreground">{order.shipping.country}</p>
            <p className="text-muted-foreground mt-2">📞 {order.shipping.phone}</p>
          </div>
        </div>
      )}

      <QuoteConversation orderId={order.id} comments={order.comments} viewerRole="admin" />

      {(order.quoteNotes || order.rejectionReason) && (
        <div className="glass-card rounded-xl p-6">
          <h2 className="font-bold mb-2">Quote Review Notes</h2>
          {order.quoteNotes && <p className="text-sm text-muted-foreground whitespace-pre-wrap">{order.quoteNotes}</p>}
          {order.rejectionReason && <p className="text-sm text-red-300 whitespace-pre-wrap">Rejection reason: {order.rejectionReason}</p>}
        </div>
      )}

      {/* Tracking Notes */}
      {order.trackingNotes && (
        <div className="glass-card rounded-xl p-6">
          <div className="flex items-center gap-2 mb-2">
            <Truck className="h-4 w-4 text-primary" />
            <h2 className="font-bold">Tracking Notes</h2>
          </div>
          <p className="text-sm text-muted-foreground">{order.trackingNotes}</p>
        </div>
      )}
    </div>
  );
}
