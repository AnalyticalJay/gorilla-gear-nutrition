import { trpc } from "@/lib/trpc";
import React, { useEffect, useState } from "react";
import { useParams, Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Package, MapPin, CreditCard, Truck, User, ExternalLink, Save } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import QuoteConversation from "@/components/QuoteConversation";
import MockCourierSimulator from "@/components/MockCourierSimulator";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { getTrackingUrl, type OrderTrackingEventInput } from "@shared/orderTracking";
import OrderTrackingTimeline from "@/components/OrderTrackingTimeline";
import type { MockCourierScenario } from "@shared/mockCourierEvents";
import { proofStatusMeta, resolveProofStatus } from "@shared/paymentProof";

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
  const [trackingNumber, setTrackingNumber] = useState("");
  const [trackingCarrier, setTrackingCarrier] = useState("The Courier Guy");
  const [trackingUrl, setTrackingUrl] = useState("");
  const [trackingNotes, setTrackingNotes] = useState("");
  const [proofReviewNote, setProofReviewNote] = useState("");
  const [isPacked, setIsPacked] = useState(false);
  const [isCourierBooked, setIsCourierBooked] = useState(false);
  const [waybillNumber, setWaybillNumber] = useState("");
  const [mockPreview, setMockPreview] = useState<{ scenario: MockCourierScenario; events: OrderTrackingEventInput[] } | null>(null);

  const orderQuery = trpc.orders.adminDetail.useQuery(
    { orderId: parseInt(orderId ?? "0") },
    { enabled: !!orderId }
  );
  const order = orderQuery.data;

  useEffect(() => {
    if (!order) return;
    setTrackingNumber(order.trackingNumber ?? "");
    setTrackingCarrier(order.trackingCarrier ?? "The Courier Guy");
    setTrackingUrl(order.trackingUrl ?? "");
    setTrackingNotes(order.trackingNotes ?? "");
    setIsPacked(!!order.packedAt);
    setIsCourierBooked(!!order.courierBookedAt);
    setWaybillNumber(order.waybillNumber ?? "");
  }, [order?.id, order?.trackingNumber, order?.trackingCarrier, order?.trackingUrl, order?.trackingNotes, order?.packedAt, order?.courierBookedAt, order?.waybillNumber]);

  const confirmEft = trpc.orders.confirmEft.useMutation({
    onSuccess: () => {
      toast.success("EFT payment confirmed");
      utils.orders.adminDetail.invalidate({ orderId: parseInt(orderId ?? "0") });
      utils.orders.adminList.invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  const rejectProof = trpc.orders.rejectProof.useMutation({
    onSuccess: () => {
      toast.success("Proof of payment rejected and customer notified in their order view");
      setProofReviewNote("");
      utils.orders.adminDetail.invalidate({ orderId: parseInt(orderId ?? "0") });
      utils.orders.adminList.invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  const updateTracking = trpc.orders.adminUpdateTracking.useMutation({
    onSuccess: () => {
      toast.success("Tracking details saved");
      utils.orders.adminDetail.invalidate({ orderId: parseInt(orderId ?? "0") });
      utils.orders.adminList.invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  const updateFulfilment = trpc.orders.adminUpdateFulfilment.useMutation({
    onSuccess: () => {
      toast.success("Fulfilment checklist updated");
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

  const mockPreviewOrder = mockPreview
    ? {
        ...order,
        status: mockPreview.scenario === "delivered" ? "completed" : "shipped",
        trackingNumber: trackingNumber.trim() || "MOCK-TCG-001",
        trackingCarrier: "Mock Courier Preview",
        trackingUrl: null,
        trackingNotes: "Browser-only mock courier preview. This note is not saved to the order.",
        dispatchedAt: mockPreview.events[mockPreview.events.length - 1]?.occurredAt ?? order.dispatchedAt,
        deliveredAt: mockPreview.scenario === "delivered" ? mockPreview.events[0]?.occurredAt ?? order.deliveredAt : null,
        trackingEvents: mockPreview.events,
      }
    : null;

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
      <div className="glass-card rounded-xl p-4 sm:p-6">

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

      {/* Fulfilment Checklist */}
      <div className="glass-card rounded-xl p-4 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-2"><Package className="h-4 w-4 text-[#38BDF8]" /><h2 className="font-bold">Fulfilment Checklist</h2></div>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">Track order preparation, Courier Guy booking, and waybill assignment before dispatch.</p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold ${isPacked && isCourierBooked ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400"}`}>
              {isPacked && isCourierBooked ? "Ready for Dispatch" : "Fulfilment In Progress"}
            </span>
          </div>
        </div>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <label className="flex items-center gap-3 rounded-lg border border-[#1E293B] bg-[#0A0A0A] p-3.5 cursor-pointer hover:border-[#334155]">
            <input
              type="checkbox"
              checked={isPacked}
              onChange={(event) => setIsPacked(event.target.checked)}
              className="h-4 w-4 rounded border-[#334155] bg-[#111111] text-[#38BDF8] focus:ring-[#38BDF8]"
            />
            <div>
              <p className="text-sm font-bold text-white">Order Packed</p>
              <p className="text-xs text-muted-foreground">{order.packedAt ? `Packed on ${format(new Date(order.packedAt), "PP p")}` : "Items inspected and boxed"}</p>
            </div>
          </label>

          <label className="flex items-center gap-3 rounded-lg border border-[#1E293B] bg-[#0A0A0A] p-3.5 cursor-pointer hover:border-[#334155]">
            <input
              type="checkbox"
              checked={isCourierBooked}
              onChange={(event) => setIsCourierBooked(event.target.checked)}
              className="h-4 w-4 rounded border-[#334155] bg-[#111111] text-[#38BDF8] focus:ring-[#38BDF8]"
            />
            <div>
              <p className="text-sm font-bold text-white">Courier Booked</p>
              <p className="text-xs text-muted-foreground">{order.courierBookedAt ? `Booked on ${format(new Date(order.courierBookedAt), "PP p")}` : "The Courier Guy collection booked"}</p>
            </div>
          </label>

          <div className="space-y-2 sm:col-span-2">
            <label htmlFor="waybill-number" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Waybill / Collection Reference</label>
            <Input
              id="waybill-number"
              value={waybillNumber}
              onChange={(event) => setWaybillNumber(event.target.value)}
              placeholder="e.g. WAY-8849201"
              className="bg-background/50"
            />
          </div>
        </div>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground">Save completion steps before updating the main tracking number and shipping status.</p>
          <Button
            className="min-h-10 text-white font-bold bg-[#38BDF8] text-slate-950 hover:bg-[#38BDF8]/90"
            disabled={updateFulfilment.isPending}
            onClick={() => updateFulfilment.mutate({
              orderId: order.id,
              packed: isPacked,
              courierBooked: isCourierBooked,
              waybillNumber: waybillNumber.trim() || null,
            })}
          >
            <Save className="mr-2 h-4 w-4" />
            {updateFulfilment.isPending ? "Saving checklist..." : "Save fulfilment checklist"}
          </Button>
        </div>
      </div>

      {/* Shipment Tracking */}
      <div className="glass-card rounded-xl p-4 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-2"><Truck className="h-4 w-4 text-primary" /><h2 className="font-bold">Shipment Tracking</h2></div>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">Add the courier details customers will see on their order timeline.</p>
          </div>
          {trackingNumber && getTrackingUrl(trackingCarrier, trackingNumber, trackingUrl) && <a href={getTrackingUrl(trackingCarrier, trackingNumber, trackingUrl) ?? undefined} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs font-bold text-primary no-underline hover:underline"><ExternalLink className="h-3.5 w-3.5" /> Preview link</a>}
        </div>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="space-y-2"><label htmlFor="tracking-number" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Tracking number</label><Input id="tracking-number" value={trackingNumber} onChange={(event) => setTrackingNumber(event.target.value)} placeholder="e.g. TCG123456789" className="bg-background/50" /></div>
          <div className="space-y-2"><label htmlFor="tracking-carrier" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Carrier</label><Input id="tracking-carrier" value={trackingCarrier} onChange={(event) => setTrackingCarrier(event.target.value)} placeholder="The Courier Guy" className="bg-background/50" /></div>
          <div className="space-y-2 sm:col-span-2"><label htmlFor="tracking-url" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Tracking URL <span className="font-normal normal-case">(optional)</span></label><Input id="tracking-url" value={trackingUrl} onChange={(event) => setTrackingUrl(event.target.value)} placeholder="Leave blank to use the Courier Guy tracking page" className="bg-background/50" /></div>
          <div className="space-y-2 sm:col-span-2"><label htmlFor="tracking-notes" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Customer tracking note <span className="font-normal normal-case">(optional)</span></label><Textarea id="tracking-notes" value={trackingNotes} onChange={(event) => setTrackingNotes(event.target.value)} placeholder="e.g. Dispatched from Johannesburg depot." className="min-h-20 bg-background/50" /></div>
        </div>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground">Set the order status to <strong className="text-foreground">Shipped</strong> after the parcel has been handed to the courier.</p>
          <Button className="min-h-10 text-white font-bold" disabled={updateTracking.isPending} onClick={() => updateTracking.mutate({ orderId: order.id, trackingNumber: trackingNumber.trim() || null, trackingCarrier: trackingCarrier.trim() || null, trackingUrl: trackingUrl.trim() || null, trackingNotes: trackingNotes.trim() || null })}><Save className="mr-2 h-4 w-4" />{updateTracking.isPending ? "Saving..." : "Save tracking"}</Button>
        </div>
      </div>

      {/* Mock Courier Scenario Simulator */}
      <MockCourierSimulator
        activeScenario={mockPreview?.scenario ?? null}
        onPreview={(scenario, events) => setMockPreview({ scenario, events })}
        onClear={() => setMockPreview(null)}
      />
      {mockPreviewOrder && (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 px-1">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#FBBF24]">Mock customer view</p>
              <p className="text-xs text-muted-foreground">This preview uses generated events only. No order status, tracking number, or scan event has been saved.</p>
            </div>
          </div>
          <OrderTrackingTimeline order={mockPreviewOrder} />
        </div>
      )}

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
                {order.paymentStatus.replaceAll("_", " ")}
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
            {(order.paymentMethod === "eft" || order.proofOfPaymentUrl) && (
              <div className="pt-2 border-t border-border/40 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-bold text-xs">Proof of Payment (POP)</p>
                  <Badge className={`text-xs ${proofStatusMeta[resolveProofStatus(order)].className}`}>{proofStatusMeta[resolveProofStatus(order)].label}</Badge>
                </div>
                {order.proofOfPaymentUrl && <a href={order.proofOfPaymentUrl} target="_blank" rel="noreferrer" className="text-xs text-primary underline flex items-center gap-1">
                  <ExternalLink className="h-3 w-3" /> View customer uploaded receipt
                </a>}
                {order.proofReviewNote && <p className="rounded border border-red-500/20 bg-red-500/5 p-2 text-xs text-red-200"><strong>Review note:</strong> {order.proofReviewNote}</p>}
              </div>
            )}
            {order.paymentMethod === "eft" && order.proofOfPaymentUrl && resolveProofStatus(order) === "pending" && (
              <div className="mt-3 space-y-2">
                <Textarea value={proofReviewNote} onChange={(event) => setProofReviewNote(event.target.value)} placeholder="Optional rejection reason for the customer" className="min-h-20 bg-background/50 text-xs" />
                <div className="grid gap-2 sm:grid-cols-2">
                  <Button variant="outline" className="border-red-500/40 text-red-300 hover:bg-red-500/10" onClick={() => rejectProof.mutate({ orderId: order.id, note: proofReviewNote.trim() || "Please upload a clearer proof of payment." })} disabled={rejectProof.isPending || confirmEft.isPending}>
                    {rejectProof.isPending ? "Rejecting..." : "Reject POP"}
                  </Button>
                  <Button className="bg-green-600 hover:bg-green-700 text-white font-bold" onClick={() => confirmEft.mutate({ orderId: order.id })} disabled={confirmEft.isPending || rejectProof.isPending}>
                    {confirmEft.isPending ? "Verifying..." : "Approve & Confirm EFT"}
                  </Button>
                </div>
              </div>
            )}
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
                {item.strength && <p className="text-xs text-primary/80 mt-1">{item.strength}</p>}
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
        <div className="glass-card rounded-xl p-4 sm:p-6">
          <div className="flex items-center gap-2 mb-2"><Truck className="h-4 w-4 text-primary" /><h2 className="font-bold">Tracking Notes</h2></div>
          <p className="whitespace-pre-wrap text-sm text-muted-foreground">{order.trackingNotes}</p>
        </div>
      )}
    </div>
  );
}
