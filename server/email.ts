import nodemailer from "nodemailer";
import { ENV } from "./_core/env";
import { getTrackingUrl } from "../shared/orderTracking";

export type QuoteConfirmationItem = {
  productName: string;
  quantity: number;
  lineTotal: number;
};

export type QuoteConfirmationInput = {
  quoteId: number;
  customerName: string;
  customerEmail: string | null | undefined;
  items: QuoteConfirmationItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
};

export type PasswordResetEmailInput = {
  customerName: string;
  customerEmail: string;
  resetToken: string;
};

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return entities[character] ?? character;
  });
}

function formatZar(value: number): string {
  return `R${value.toFixed(2)}`;
}

export function isSmtpConfigured(): boolean {
  return Boolean(ENV.smtpHost && ENV.smtpPort && ENV.smtpUser && ENV.smtpPassword && ENV.smtpFrom);
}

function createSmtpTransport() {
  return nodemailer.createTransport({
    host: ENV.smtpHost,
    port: ENV.smtpPort,
    secure: ENV.smtpSecure,
    requireTLS: !ENV.smtpSecure,
    auth: {
      user: ENV.smtpUser,
      pass: ENV.smtpPassword,
    },
  });
}

export function buildPasswordResetEmail(input: PasswordResetEmailInput) {
  const safeName = escapeHtml(input.customerName);
  const resetUrl = `https://gorillagear.co.za/reset-password?token=${encodeURIComponent(input.resetToken)}`;
  const safeResetUrl = escapeHtml(resetUrl);

  return {
    from: ENV.smtpFrom,
    to: input.customerEmail,
    replyTo: ENV.smtpFrom,
    subject: "Reset your Gorilla Gear Nutrition password",
    text: `Hi ${input.customerName},\n\nWe received a request to reset your Gorilla Gear Nutrition password. Use the secure link below within 60 minutes:\n\n${resetUrl}\n\nIf you did not request this, you can safely ignore this email. Your password will not change.\n\nRegards,\nGorilla Gear Nutrition`,
    html: `<!doctype html><html><body style="margin:0;background:#f5f5f0;font-family:Arial,sans-serif;color:#111827;"><div style="max-width:620px;margin:0 auto;padding:32px 18px;"><div style="background:#111827;color:#fff;padding:22px 24px;"><div style="font-size:12px;letter-spacing:2px;font-weight:700;color:#ef654a;">GORILLA GEAR NUTRITION</div><h1 style="margin:10px 0 0;font-size:24px;">Reset your password</h1></div><div style="background:#fff;padding:26px 24px;"><p style="font-size:16px;">Hi ${safeName},</p><p>We received a request to reset your Gorilla Gear Nutrition password. This secure link expires in 60 minutes and can only be used once.</p><p><a href="${safeResetUrl}" style="display:inline-block;background:#111827;color:#fff;text-decoration:none;padding:13px 18px;font-weight:700;">Reset password</a></p><p style="font-size:13px;color:#6b7280;">If you did not request this, you can safely ignore this email. Your password will not change.</p></div><div style="padding:18px 24px;font-size:12px;color:#6b7280;">Gorilla Gear Nutrition · South Africa</div></div></body></html>`,
  };
}

export async function sendPasswordResetEmail(input: PasswordResetEmailInput): Promise<boolean> {
  if (!isSmtpConfigured()) {
    console.warn("[Email] Password reset skipped because SMTP is not configured");
    return false;
  }
  await createSmtpTransport().sendMail(buildPasswordResetEmail(input));
  return true;
}

export function buildQuoteConfirmationEmail(input: QuoteConfirmationInput) {
  const safeName = escapeHtml(input.customerName);
  const orderUrl = `https://gorillagear.co.za/orders/${input.quoteId}`;
  const itemRows = input.items
    .map(
      (item) =>
        `<tr><td style="padding:10px 0;border-bottom:1px solid #e5e7eb;color:#111827;">${escapeHtml(item.productName)} ×${item.quantity}</td><td style="padding:10px 0;border-bottom:1px solid #e5e7eb;text-align:right;color:#111827;">${formatZar(item.lineTotal)}</td></tr>`,
    )
    .join("");
  const itemText = input.items.map((item) => `${item.productName} ×${item.quantity}: ${formatZar(item.lineTotal)}`).join("\n");

  return {
    from: ENV.smtpFrom,
    to: input.customerEmail ?? undefined,
    replyTo: ENV.smtpFrom,
    subject: `Quote #${input.quoteId} received — Gorilla Gear Nutrition`,
    text: `Hi ${input.customerName},\n\nWe received your quote request with Gorilla Gear Nutrition. It is now pending review.\n\n${itemText}\n\nSubtotal: ${formatZar(input.subtotal)}\nNationwide delivery: ${formatZar(input.deliveryFee)}\nEstimated total: ${formatZar(input.total)}\n\nThe nationwide flat delivery rate is R140.00 for South African destinations.\n\nView your quote: ${orderUrl}\n\nRegards,\nGorilla Gear Nutrition`,
    html: `<!doctype html><html><body style="margin:0;background:#f5f5f0;font-family:Arial,sans-serif;color:#111827;"><div style="max-width:620px;margin:0 auto;padding:32px 18px;"><div style="background:#111827;color:#fff;padding:22px 24px;"><div style="font-size:12px;letter-spacing:2px;font-weight:700;color:#ef654a;">GORILLA GEAR NUTRITION</div><h1 style="margin:10px 0 0;font-size:24px;">Quote #${input.quoteId} received</h1></div><div style="background:#fff;padding:26px 24px;"><p style="font-size:16px;">Hi ${safeName},</p><p>We received your quote request. It is now pending review by our team.</p><table style="width:100%;border-collapse:collapse;margin:22px 0;">${itemRows}<tr><td style="padding:12px 0 4px;color:#6b7280;">Subtotal</td><td style="padding:12px 0 4px;text-align:right;">${formatZar(input.subtotal)}</td></tr><tr><td style="padding:4px 0;color:#6b7280;">Nationwide delivery</td><td style="padding:4px 0;text-align:right;">${formatZar(input.deliveryFee)}</td></tr><tr><td style="padding:14px 0 0;border-top:2px solid #111827;font-weight:700;font-size:17px;">Estimated total</td><td style="padding:14px 0 0;border-top:2px solid #111827;text-align:right;font-weight:700;font-size:17px;color:#d84d36;">${formatZar(input.total)}</td></tr></table><p style="padding:14px 16px;background:#fff5f2;border-left:3px solid #d84d36;"><strong>Nationwide flat delivery:</strong> R140.00 for South African destinations.</p><p><a href="${orderUrl}" style="display:inline-block;background:#111827;color:#fff;text-decoration:none;padding:13px 18px;font-weight:700;">View your quote</a></p><p style="font-size:13px;color:#6b7280;">We will contact you with the reviewed quote and next steps.</p></div><div style="padding:18px 24px;font-size:12px;color:#6b7280;">Gorilla Gear Nutrition · South Africa</div></div></body></html>`,
  };
}

export async function sendQuoteConfirmationEmail(input: QuoteConfirmationInput): Promise<boolean> {
  if (!input.customerEmail || !isSmtpConfigured()) {
    console.warn("[Email] Quote confirmation skipped because SMTP or customer email is not configured");
    return false;
  }

  await createSmtpTransport().sendMail(buildQuoteConfirmationEmail(input));
  return true;
}

export type OrderNotificationInput = {
  orderId: number;
  customerName: string;
  customerEmail: string | null | undefined;
  total: number;
  trackingNumber?: string | null;
  trackingCarrier?: string | null;
  trackingUrl?: string | null;
  waybillNumber?: string | null;
};

export function buildPaymentApprovedEmail(input: OrderNotificationInput) {
  const safeName = escapeHtml(input.customerName);
  const orderUrl = `https://gorillagear.co.za/orders/${input.orderId}`;
  return {
    from: ENV.smtpFrom,
    to: input.customerEmail ?? undefined,
    replyTo: ENV.smtpFrom,
    subject: `Payment Confirmed — Order #${input.orderId} | Gorilla Gear Nutrition`,
    text: `Hi ${input.customerName},\n\nYour payment of ${formatZar(input.total)} for Order #${input.orderId} has been confirmed.\n\nOur team is now processing and packing your items.\n\nView order status: ${orderUrl}\n\nRegards,\nGorilla Gear Nutrition`,
    html: `<!doctype html><html><body style="margin:0;background:#f5f5f0;font-family:Arial,sans-serif;color:#111827;"><div style="max-width:620px;margin:0 auto;padding:32px 18px;"><div style="background:#111827;color:#fff;padding:22px 24px;"><div style="font-size:12px;letter-spacing:2px;font-weight:700;color:#ef654a;">GORILLA GEAR NUTRITION</div><h1 style="margin:10px 0 0;font-size:24px;">Payment Confirmed</h1></div><div style="background:#fff;padding:26px 24px;"><p style="font-size:16px;">Hi ${safeName},</p><p>We have received and approved your payment of <strong>${formatZar(input.total)}</strong> for Order #${input.orderId}.</p><p>Your order is now in preparation for dispatch.</p><p><a href="${orderUrl}" style="display:inline-block;background:#111827;color:#fff;text-decoration:none;padding:13px 18px;font-weight:700;">View order timeline</a></p></div><div style="padding:18px 24px;font-size:12px;color:#6b7280;">Gorilla Gear Nutrition · South Africa</div></div></body></html>`,
  };
}

export function buildOrderPackedEmail(input: OrderNotificationInput) {
  const safeName = escapeHtml(input.customerName);
  const orderUrl = `https://gorillagear.co.za/orders/${input.orderId}`;
  const waybillText = input.waybillNumber ? `Waybill / Reference: ${input.waybillNumber}` : "";
  return {
    from: ENV.smtpFrom,
    to: input.customerEmail ?? undefined,
    replyTo: ENV.smtpFrom,
    subject: `Order Packed — Order #${input.orderId} | Gorilla Gear Nutrition`,
    text: `Hi ${input.customerName},\n\nYour order #${input.orderId} has been successfully packed and inspected, ready for courier collection.\n\n${waybillText}\n\nView order timeline: ${orderUrl}\n\nRegards,\nGorilla Gear Nutrition`,
    html: `<!doctype html><html><body style="margin:0;background:#f5f5f0;font-family:Arial,sans-serif;color:#111827;"><div style="max-width:620px;margin:0 auto;padding:32px 18px;"><div style="background:#111827;color:#fff;padding:22px 24px;"><div style="font-size:12px;letter-spacing:2px;font-weight:700;color:#ef654a;">GORILLA GEAR NUTRITION</div><h1 style="margin:10px 0 0;font-size:24px;">Order Packed</h1></div><div style="background:#fff;padding:26px 24px;"><p style="font-size:16px;">Hi ${safeName},</p><p>Your items for Order #${input.orderId} have been inspected, securely boxed, and marked as <strong>Packed</strong>.</p>${input.waybillNumber ? `<p style="padding:12px 16px;background:#f0fdf4;border-left:3px solid #22c55e;"><strong>Waybill Reference:</strong> ${escapeHtml(input.waybillNumber)}</p>` : ""}<p>Next, courier collection will be scheduled with The Courier Guy.</p><p><a href="${orderUrl}" style="display:inline-block;background:#111827;color:#fff;text-decoration:none;padding:13px 18px;font-weight:700;">View order timeline</a></p></div><div style="padding:18px 24px;font-size:12px;color:#6b7280;">Gorilla Gear Nutrition · South Africa</div></div></body></html>`,
  };
}

export function buildOrderDispatchedEmail(input: OrderNotificationInput) {
  const safeName = escapeHtml(input.customerName);
  const orderUrl = `https://gorillagear.co.za/orders/${input.orderId}`;
  const carrier = input.trackingCarrier || "The Courier Guy";
  const trackingNumber = input.trackingNumber || "Available soon";
  const candidateTrackingUrl = getTrackingUrl(carrier, input.trackingNumber ?? "", input.trackingUrl ?? "");
  let trackingUrl = orderUrl;
  try {
    const parsed = candidateTrackingUrl ? new URL(candidateTrackingUrl) : null;
    if (parsed && ["https:", "http:"].includes(parsed.protocol)) trackingUrl = parsed.toString();
  } catch {
    trackingUrl = orderUrl;
  }
  const safeTrackingUrl = escapeHtml(trackingUrl);
  const trackingAction = trackingUrl === orderUrl ? "View order timeline" : `Track with ${carrier}`;
  return {
    from: ENV.smtpFrom,
    to: input.customerEmail ?? undefined,
    replyTo: ENV.smtpFrom,
    subject: `Order Dispatched — Order #${input.orderId} | Gorilla Gear Nutrition`,
    text: `Hi ${input.customerName},\n\nYour order #${input.orderId} has been handed to ${carrier} for nationwide delivery.\n\nTracking Number: ${trackingNumber}\n\n${trackingAction}: ${trackingUrl}\n\nRegards,\nGorilla Gear Nutrition`,
    html: `<!doctype html><html><body style="margin:0;background:#f5f5f0;font-family:Arial,sans-serif;color:#111827;"><div style="max-width:620px;margin:0 auto;padding:32px 18px;"><div style="background:#111827;color:#fff;padding:22px 24px;"><div style="font-size:12px;letter-spacing:2px;font-weight:700;color:#ef654a;">GORILLA GEAR NUTRITION</div><h1 style="margin:10px 0 0;font-size:24px;">Order Dispatched</h1></div><div style="background:#fff;padding:26px 24px;"><p style="font-size:16px;">Hi ${safeName},</p><p>Great news! Your order #${input.orderId} has been handed to <strong>${escapeHtml(carrier)}</strong> and is now on its way.</p><p style="padding:14px 16px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:6px;"><strong>Tracking Number:</strong> ${escapeHtml(trackingNumber)}</p><p><a href="${safeTrackingUrl}" style="display:inline-block;background:#111827;color:#fff;text-decoration:none;padding:13px 18px;font-weight:700;">${escapeHtml(trackingAction)}</a></p><p style="font-size:13px;color:#6b7280;">If the courier tracking page is temporarily unavailable, you can view updates from your order timeline.</p></div><div style="padding:18px 24px;font-size:12px;color:#6b7280;">Gorilla Gear Nutrition · South Africa</div></div></body></html>`,
  };
}

export async function sendPaymentApprovedEmail(input: OrderNotificationInput): Promise<boolean> {
  if (!input.customerEmail || !isSmtpConfigured()) return false;
  try {
    await createSmtpTransport().sendMail(buildPaymentApprovedEmail(input));
    return true;
  } catch (err) {
    console.error("[Email] Failed to send payment approved email:", err);
    return false;
  }
}

export async function sendOrderPackedEmail(input: OrderNotificationInput): Promise<boolean> {
  if (!input.customerEmail || !isSmtpConfigured()) return false;
  try {
    await createSmtpTransport().sendMail(buildOrderPackedEmail(input));
    return true;
  } catch (err) {
    console.error("[Email] Failed to send order packed email:", err);
    return false;
  }
}

export async function sendOrderDispatchedEmail(input: OrderNotificationInput): Promise<boolean> {
  if (!input.customerEmail || !isSmtpConfigured()) return false;
  try {
    await createSmtpTransport().sendMail(buildOrderDispatchedEmail(input));
    return true;
  } catch (err) {
    console.error("[Email] Failed to send order dispatched email:", err);
    return false;
  }
}
