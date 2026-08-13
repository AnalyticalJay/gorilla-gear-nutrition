export type OrderTrackingEventInput = {
  id?: number;
  eventCode: string;
  statusLabel: string;
  description?: string | null;
  location?: string | null;
  externalEventId?: string | null;
  source?: string;
  occurredAt: Date | string;
};

export type OrderTrackingInput = {
  createdAt: Date | string;
  reviewedAt?: Date | string | null;
  paidAt?: Date | string | null;
  dispatchedAt?: Date | string | null;
  deliveredAt?: Date | string | null;
  status: string;
  paymentStatus: string;
  trackingNumber?: string | null;
  trackingCarrier?: string | null;
  trackingUrl?: string | null;
  trackingNotes?: string | null;
  trackingEvents?: OrderTrackingEventInput[];
};

export type OrderTimelineStep = {
  key: "placed" | "reviewed" | "paid" | "dispatched" | "delivered";
  label: string;
  description: string;
  completed: boolean;
  active: boolean;
  timestamp: Date | string | null;
};

const statusOrder = ["placed", "reviewed", "paid", "dispatched", "delivered"] as const;

export function isOrderDispatched(order: Pick<OrderTrackingInput, "status" | "dispatchedAt">) {
  return Boolean(order.dispatchedAt) || ["shipped", "completed"].includes(order.status);
}

export function buildOrderTimeline(order: OrderTrackingInput): OrderTimelineStep[] {
  const placed = true;
  const reviewed = Boolean(order.reviewedAt) || !["pending", "quote_pending"].includes(order.status);
  const paid = Boolean(order.paidAt) || order.paymentStatus === "paid" || ["processing", "shipped", "completed"].includes(order.status);
  const dispatched = isOrderDispatched(order);
  const delivered = Boolean(order.deliveredAt) || order.status === "completed";
  const completed = { placed, reviewed, paid, dispatched, delivered };
  const currentIndex = delivered ? 4 : dispatched ? 3 : paid ? 2 : reviewed ? 1 : 0;

  const dispatchDescription = dispatched
    ? order.trackingNumber ? "Your parcel is with the courier." : "Your order is ready for courier collection."
    : order.trackingNumber ? "Tracking number assigned. Dispatch is pending." : "Your order is not yet with the courier.";
  const steps: Array<Omit<OrderTimelineStep, "completed" | "active">> = [
    { key: "placed", label: "Order placed", description: "Your quote request has been received.", timestamp: order.createdAt },
    { key: "reviewed", label: "Quote reviewed", description: "Gorilla Gear Nutrition has reviewed your request.", timestamp: order.reviewedAt ?? null },
    { key: "paid", label: "Payment confirmed", description: "Payment has been confirmed and your order is being prepared.", timestamp: order.paidAt ?? null },
    { key: "dispatched", label: "Order dispatched", description: dispatchDescription, timestamp: order.dispatchedAt ?? null },
    { key: "delivered", label: "Delivered", description: "Your parcel has been marked as delivered.", timestamp: order.deliveredAt ?? null },
  ];

  return steps.map((step, index) => ({
    ...step,
    completed: completed[step.key],
    active: !completed[step.key] && index === currentIndex + 1,
  }));
}

export function getCourierGuyTrackingUrl(_trackingNumber: string) {
  return "https://thecourierguy.co.za/tracking/";
}

export function getTrackingUrl(carrier: string | null | undefined, trackingNumber: string | null | undefined, trackingUrl?: string | null) {
  if (trackingUrl) return trackingUrl;
  if (!trackingNumber) return null;
  if (!carrier || carrier.toLowerCase().includes("courier guy")) return getCourierGuyTrackingUrl(trackingNumber);
  return null;
}

export function isTrackingStatus(status: string) {
  return ["shipped", "completed"].includes(status);
}

export function getOrderStatusTimelineUpdates(status: string, currentDispatchedAt: Date | null | undefined, now = new Date()) {
  if (status === "shipped" && !currentDispatchedAt) return { dispatchedAt: now };
  if (status === "completed") return { dispatchedAt: currentDispatchedAt ?? now, deliveredAt: now };
  return {};
}
