import React, { useMemo, useState } from "react";
import { trpc } from "@/lib/trpc";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Check, Eye, Filter, ShoppingBag, Sparkles, X } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { Link } from "wouter";

const ORDER_STATUSES = ["quote_pending", "quote_approved", "quote_rejected", "awaiting_payment", "paid", "processing", "shipped", "completed", "cancelled"] as const;
type OrderStatus = (typeof ORDER_STATUSES)[number];
type FilterStatus = "all" | "awaiting_approval" | OrderStatus;
const FILTER_OPTIONS = [
  { value: "all", label: "All quotes and orders" },
  { value: "awaiting_approval", label: "Awaiting approval" },
  ...ORDER_STATUSES.map((status) => ({ value: status, label: status.replaceAll("_", " ") })),
] satisfies Array<{ value: FilterStatus; label: string }>;
type AdminOrder = {
  id: number;
  status: string;
  totalAmount: string;
  paymentStatus: string;
  paymentMethod?: string | null;
  createdAt: Date;
  userFullName?: string | null;
  userEmail?: string | null;
};

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    quote_pending: "border-[#a8751c]/35 bg-[#f6e9c7] text-[#684713]",
    quote_approved: "border-[#a8751c]/30 bg-[#a8751c]/10 text-[#7c5a20]",
    quote_rejected: "border-[#b42318]/25 bg-[#b42318]/8 text-[#b42318]",
    awaiting_payment: "border-[#a8751c]/30 bg-[#a8751c]/10 text-[#7c5a20]",
    paid: "border-[#1f7a45]/25 bg-[#1f7a45]/10 text-[#1f7a45]",
    processing: "border-[#454545]/20 bg-[#454545]/8 text-[#454545]",
    shipped: "border-[#a8751c]/30 bg-[#a8751c]/10 text-[#7c5a20]",
    completed: "border-[#1f7a45]/25 bg-[#1f7a45]/10 text-[#1f7a45]",
    cancelled: "border-[#b42318]/25 bg-[#b42318]/8 text-[#b42318]",
  };
  return <Badge className={`border text-xs capitalize ${map[status] ?? "border-[#d5c7b0] bg-[#fcfbf8] text-[#6b665e]"}`}>{status.replaceAll("_", " ")}</Badge>;
}

function PaymentBadge({ method, status }: { method?: string | null; status: string }) {
  const paid = status === "paid";
  return <Badge className={`border text-xs ${paid ? "border-[#1f7a45]/25 bg-[#1f7a45]/10 text-[#1f7a45]" : "border-[#a8751c]/30 bg-[#a8751c]/10 text-[#7c5a20]"}`}>{method ? `${method} · ` : ""}{status.replaceAll("_", " ")}</Badge>;
}

function AwaitingApprovalFlag() {
  return <span className="inline-flex items-center gap-1 rounded-full border border-[#a8751c]/35 bg-[#f6e9c7] px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.1em] text-[#684713]"><Sparkles className="h-3 w-3" />New quote</span>;
}

export default function AdminOrders() {
  const utils = trpc.useUtils();
  const ordersQuery = trpc.orders.adminList.useQuery();
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("awaiting_approval");
  const updateStatus = trpc.orders.adminUpdateStatus.useMutation({ onSuccess: () => { utils.orders.adminList.invalidate(); toast.success("Quote status updated"); }, onError: (error) => toast.error(error.message) });
  const review = trpc.orders.review.useMutation({ onSuccess: (_, variables) => { utils.orders.adminList.invalidate(); toast.success(variables.decision === "quote_approved" ? "Quote approved" : "Quote rejected"); }, onError: (error) => toast.error(error.message) });
  const orders = ordersQuery.data ?? [];
  const awaitingApprovalCount = orders.filter((order) => order.status === "quote_pending").length;
  const filteredOrders = useMemo(() => orders.filter((order) => statusFilter === "all" || (statusFilter === "awaiting_approval" ? order.status === "quote_pending" : order.status === statusFilter)), [orders, statusFilter]);

  const handleReview = (orderId: number, decision: "quote_approved" | "quote_rejected") => {
    const prompt = decision === "quote_approved" ? "Approval notes for the customer (optional):" : "Reason for rejecting this quote (optional):";
    const notes = window.prompt(prompt) ?? undefined;
    review.mutate({ orderId, decision, notes });
  };

  const StatusSelect = ({ orderId, status, compact = false }: { orderId: number; status: string; compact?: boolean }) => <Select value={status} onValueChange={(value) => updateStatus.mutate({ orderId, status: value as OrderStatus })}><SelectTrigger className={`${compact ? "h-9 w-36" : "h-10 min-w-0 flex-1"} border-[#d5c7b0] bg-white text-xs text-[#1f1f1f] focus:ring-[#a8751c]/25`}><SelectValue /></SelectTrigger><SelectContent className="border-[#e5dfd4] bg-white text-[#1f1f1f]">{ORDER_STATUSES.map((item) => <SelectItem key={item} value={item} className="text-xs capitalize focus:bg-[#f6f0e4] focus:text-[#1f1f1f]">{item.replaceAll("_", " ")}</SelectItem>)}</SelectContent></Select>;

  const OrderActions = ({ order, compact = false }: { order: AdminOrder; compact?: boolean }) => {
    if (order.status === "quote_pending") return <div className={`flex flex-wrap gap-2 ${compact ? "" : "border-t border-[#ead8ad] pt-3"}`}><Button size="sm" className="min-h-10 flex-1 bg-[#1f7a45] text-white hover:bg-[#176138]" onClick={() => handleReview(order.id, "quote_approved")} disabled={review.isPending}><Check className="mr-1 h-3.5 w-3.5" />Approve</Button><Button size="sm" variant="outline" className="min-h-10 flex-1 border-[#b42318]/35 text-[#b42318] hover:bg-[#b42318]/5" onClick={() => handleReview(order.id, "quote_rejected")} disabled={review.isPending}><X className="mr-1 h-3.5 w-3.5" />Reject</Button><Link href={`/admin/orders/${order.id}`} className="no-underline"><Button size="sm" variant="outline" className="min-h-10 border-[#a8751c]/35 px-3 text-[#684713] hover:bg-[#f6f0e4]"><Eye className="h-4 w-4" /><span className="sr-only">View quote</span></Button></Link></div>;
    return <div className="flex items-center gap-2"><StatusSelect orderId={order.id} status={order.status} compact={compact} /><Link href={`/admin/orders/${order.id}`} className="no-underline"><Button size="sm" variant="outline" className="min-h-9 border-[#d5c7b0] px-3 text-[#454545] hover:bg-[#f6f0e4]"><Eye className="h-4 w-4" /></Button></Link></div>;
  };

  return <div className="space-y-6"><header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#a8751c]">Commercial operations</p><h1 className="mt-2 text-2xl font-black uppercase tracking-tight text-[#1f1f1f]">Quote <span className="text-[#a8751c]">Management</span></h1><p className="mt-1 text-sm text-[#6b665e]">{filteredOrders.length} shown of {orders.length} quote requests and orders</p></div><div className="rounded-xl border border-[#a8751c]/30 bg-[#fdf7e9] px-4 py-3 shadow-[0_10px_24px_rgba(168,117,28,0.08)]"><p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#7c5a20]">Requires review</p><p className="mt-1 text-2xl font-black text-[#684713]">{awaitingApprovalCount}<span className="ml-1 text-xs font-bold text-[#7c5a20]">awaiting approval</span></p></div></header><section className="overflow-hidden rounded-xl border border-[#e5dfd4] bg-white shadow-[0_14px_34px_rgba(69,69,69,0.06)]"><div className="flex flex-col gap-3 border-b border-[#e5dfd4] bg-[#fcfbf8] p-4 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-center gap-2 text-sm font-bold text-[#454545]"><Filter className="h-4 w-4 text-[#a8751c]" />Order status</div><Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as FilterStatus)}><SelectTrigger aria-label="Filter orders by status" className="h-10 w-full border-[#d5c7b0] bg-white text-sm text-[#1f1f1f] sm:w-64 focus:ring-[#a8751c]/25"><SelectValue /></SelectTrigger><SelectContent className="border-[#e5dfd4] bg-white text-[#1f1f1f]">{FILTER_OPTIONS.map((option) => <SelectItem key={option.value} value={option.value} className="capitalize focus:bg-[#f6f0e4] focus:text-[#1f1f1f]">{option.label}{option.value === "awaiting_approval" ? ` (${awaitingApprovalCount})` : ""}</SelectItem>)}</SelectContent></Select></div>{ordersQuery.isLoading ? <div className="space-y-3 p-6">{[...Array(5)].map((_, index) => <div key={index} className="h-14 animate-pulse rounded bg-[#eee9df]" />)}</div> : filteredOrders.length === 0 ? <div className="p-12 text-center"><ShoppingBag className="mx-auto mb-3 h-12 w-12 text-[#bdb5a8]" /><p className="font-semibold text-[#454545]">No {statusFilter === "awaiting_approval" ? "quotes awaiting approval" : "matching quotes or orders"}</p><p className="mt-1 text-sm text-[#6b665e]">Change the status filter to review another workflow stage.</p></div> : <><div className="space-y-3 p-3 md:hidden">{filteredOrders.map((order) => { const isAwaitingApproval = order.status === "quote_pending"; return <article key={order.id} className={`rounded-lg border p-3 ${isAwaitingApproval ? "border-[#d8ac58] bg-[#fdf7e9] shadow-[inset_4px_0_0_#a8751c]" : "border-[#e5dfd4] bg-[#fcfbf8]"}`}><div className="flex items-start justify-between gap-3"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><Link href={`/admin/orders/${order.id}`} className="text-sm font-bold text-[#a8751c] no-underline hover:underline">Quote #{order.id}</Link>{isAwaitingApproval && <AwaitingApprovalFlag />}</div><p className="mt-1 truncate text-xs text-[#6b665e]">{order.userFullName ?? "—"}</p></div><StatusBadge status={order.status} /></div><div className="mt-3 grid grid-cols-2 gap-3 text-xs"><div><span className="block text-[#6b665e]">Total</span><strong className="text-[#1f1f1f]">R{parseFloat(order.totalAmount).toFixed(2)}</strong></div><div><span className="block text-[#6b665e]">Date</span><span className="text-[#454545]">{format(new Date(order.createdAt), "d MMM yyyy")}</span></div><div className="col-span-2"><span className="block text-[#6b665e]">Payment</span><div className="mt-1"><PaymentBadge method={order.paymentMethod} status={order.paymentStatus} /></div></div></div><div className="mt-3"><OrderActions order={order} /></div></article>; })}</div><div className="hidden overflow-x-auto md:block"><table className="w-full min-w-[980px]"><thead><tr className="border-b border-[#e5dfd4] text-left text-xs text-[#6b665e]"><th className="p-4 font-medium">Quote</th><th className="p-4 font-medium">Customer</th><th className="p-4 font-medium">Total</th><th className="p-4 font-medium">Payment</th><th className="p-4 font-medium">Status</th><th className="p-4 font-medium">Date</th><th className="p-4 font-medium">Actions</th></tr></thead><tbody>{filteredOrders.map((order) => { const isAwaitingApproval = order.status === "quote_pending"; return <tr key={order.id} className={`border-b transition-colors ${isAwaitingApproval ? "border-[#ead8ad] bg-[#fdf7e9] shadow-[inset_4px_0_0_#a8751c] hover:bg-[#fbf2dd]" : "border-[#eee9df] hover:bg-[#fcfbf8]"}`}><td className="p-4 text-sm font-medium"><div className="flex items-center gap-2"><Link href={`/admin/orders/${order.id}`} className="text-[#a8751c] no-underline hover:underline">#{order.id}</Link>{isAwaitingApproval && <AwaitingApprovalFlag />}</div></td><td className="p-4"><p className="text-sm font-medium text-[#1f1f1f]">{order.userFullName ?? "—"}</p><p className="text-xs text-[#6b665e]">{order.userEmail}</p></td><td className="p-4 text-sm font-bold text-[#1f1f1f]">R{parseFloat(order.totalAmount).toFixed(2)}</td><td className="p-4"><PaymentBadge method={order.paymentMethod} status={order.paymentStatus} /></td><td className="p-4"><StatusBadge status={order.status} /></td><td className="p-4 text-xs text-[#6b665e]">{format(new Date(order.createdAt), "d MMM yyyy")}</td><td className="p-4"><OrderActions order={order} compact /></td></tr>; })}</tbody></table></div></>}</section></div>;
}
