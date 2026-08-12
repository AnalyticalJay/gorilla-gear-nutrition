import { trpc } from "@/lib/trpc";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Check, Eye, FileText, ShoppingBag, X } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { Link } from "wouter";

const ORDER_STATUSES = ["quote_pending", "quote_approved", "quote_rejected", "awaiting_payment", "paid", "processing", "shipped", "completed", "cancelled"] as const;

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
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

export default function AdminOrders() {
  const utils = trpc.useUtils();
  const ordersQuery = trpc.orders.adminList.useQuery();
  const updateStatus = trpc.orders.adminUpdateStatus.useMutation({
    onSuccess: () => { utils.orders.adminList.invalidate(); toast.success("Quote status updated"); },
    onError: (e) => toast.error(e.message),
  });
  const review = trpc.orders.review.useMutation({
    onSuccess: (_, variables) => { utils.orders.adminList.invalidate(); toast.success(variables.decision === "quote_approved" ? "Quote approved" : "Quote rejected"); },
    onError: (e) => toast.error(e.message),
  });
  const confirmEft = trpc.orders.confirmEft.useMutation({
    onSuccess: () => { utils.orders.adminList.invalidate(); toast.success("EFT payment confirmed"); },
    onError: (e) => toast.error(e.message),
  });

  const orders = ordersQuery.data ?? [];
  const handleReview = (orderId: number, decision: "quote_approved" | "quote_rejected") => {
    const prompt = decision === "quote_approved"
      ? "Approval notes or EFT banking instructions (optional):"
      : "Reason for rejecting this quote (optional):";
    const notes = window.prompt(prompt) ?? undefined;
    review.mutate({ orderId, decision, notes });
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-black">Quote <span style={{ color: "#0EA5E9" }}>Management</span></h1>
        <p className="text-muted-foreground text-sm mt-1">{orders.length} quote requests and orders</p>
      </div>

      <div className="glass-card rounded-xl overflow-hidden">
        {ordersQuery.isLoading ? <div className="p-6 space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-14 bg-accent/20 rounded animate-pulse" />)}</div> : orders.length === 0 ? (
          <div className="p-12 text-center"><ShoppingBag className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-30" /><p className="text-muted-foreground">No quote requests yet</p></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px]">
              <thead><tr className="border-b border-border/40 text-xs text-muted-foreground"><th className="text-left p-4 font-medium">Quote</th><th className="text-left p-4 font-medium">Customer</th><th className="text-left p-4 font-medium">Total</th><th className="text-left p-4 font-medium">Payment</th><th className="text-left p-4 font-medium">Status</th><th className="text-left p-4 font-medium">Date</th><th className="text-left p-4 font-medium">Actions</th></tr></thead>
              <tbody>{orders.map((order) => (
                <tr key={order.id} className="border-b border-border/20 hover:bg-accent/10 transition-colors">
                  <td className="p-4 text-sm font-medium"><Link href={`/admin/orders/${order.id}`} className="text-primary hover:underline no-underline">#{order.id}</Link></td>
                  <td className="p-4"><p className="text-sm font-medium">{order.userFullName ?? "—"}</p><p className="text-xs text-muted-foreground">{order.userEmail}</p></td>
                  <td className="p-4 text-sm font-bold text-primary">R{parseFloat(order.totalAmount).toFixed(2)}</td>
                  <td className="p-4"><Badge className={`text-xs ${order.paymentStatus === "paid" ? "bg-green-500/20 text-green-400 border-green-500/30" : "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"}`}>{order.paymentMethod ? `${order.paymentMethod} · ` : ""}{order.paymentStatus.replaceAll("_", " ")}</Badge></td>
                  <td className="p-4"><StatusBadge status={order.status} /></td>
                  <td className="p-4 text-xs text-muted-foreground">{format(new Date(order.createdAt), "d MMM yyyy")}</td>
                  <td className="p-4">
                    {order.status === "quote_pending" ? <div className="flex flex-wrap gap-2"><Button size="sm" className="h-9 bg-green-600 hover:bg-green-700 text-white" onClick={() => handleReview(order.id, "quote_approved")} disabled={review.isPending}><Check className="h-3.5 w-3.5 mr-1" />Approve</Button><Button size="sm" variant="outline" className="h-9 border-red-500/40 text-red-300 hover:bg-red-500/10" onClick={() => handleReview(order.id, "quote_rejected")} disabled={review.isPending}><X className="h-3.5 w-3.5 mr-1" />Reject</Button></div> : order.status === "awaiting_payment" && order.paymentMethod === "eft" ? <div className="flex items-center gap-2"><Button size="sm" className="h-9 bg-green-600 hover:bg-green-700 text-white" onClick={() => confirmEft.mutate({ orderId: order.id })} disabled={confirmEft.isPending}><Check className="h-3.5 w-3.5 mr-1" />Confirm EFT</Button><Link href={`/admin/orders/${order.id}`} className="no-underline"><Button size="sm" variant="ghost" className="h-9 px-2"><Eye className="h-4 w-4" /></Button></Link></div> : <div className="flex items-center gap-2"><Select value={order.status} onValueChange={(val) => updateStatus.mutate({ orderId: order.id, status: val as typeof ORDER_STATUSES[number] })}><SelectTrigger className="h-9 w-36 bg-input border-border text-xs"><SelectValue /></SelectTrigger><SelectContent>{ORDER_STATUSES.map((s) => <SelectItem key={s} value={s} className="text-xs capitalize">{s.replaceAll("_", " ")}</SelectItem>)}</SelectContent></Select><Link href={`/admin/orders/${order.id}`} className="no-underline"><Button size="sm" variant="ghost" className="h-9 px-2"><Eye className="h-4 w-4" /></Button></Link></div>}
                  </td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
