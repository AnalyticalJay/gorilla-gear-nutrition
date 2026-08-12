export type AdminOrderStatus =
  | "pending"
  | "quote_pending"
  | "quote_approved"
  | "quote_rejected"
  | "awaiting_payment"
  | "paid"
  | "processing"
  | "shipped"
  | "completed"
  | "cancelled";

export function countPendingQuotes(orders: Array<{ status: AdminOrderStatus | string }>) {
  return orders.reduce((count, order) => count + (order.status === "quote_pending" ? 1 : 0), 0);
}
