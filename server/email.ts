import nodemailer from "nodemailer";
import { ENV } from "./_core/env";
import { getTrackingUrl } from "../shared/orderTracking";

const BRAND = {
  charcoal: "#171717",
  charcoalSoft: "#2b2b2b",
  gold: "#c9972b",
  goldSoft: "#f5e8c5",
  cream: "#f7f4ec",
  ink: "#242424",
  muted: "#6d6a63",
  border: "#e5dfd1",
  white: "#ffffff",
};

// Absolute, cacheable URL so email clients can load the logo outside the app.
const LOGO_URL = "https://gorillagear.co.za/api/media/ggn-logo-transparent_bf4fb645.png";
const SITE_URL = "https://gorillagear.co.za";

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

export type AdminNotificationInput = {
  subject: string;
  title: string;
  content: string;
};

export type CustomerStatusEmailInput = {
  customerName: string;
  customerEmail: string | null | undefined;
  subject: string;
  heading: string;
  message: string;
  actionLabel?: string;
  actionUrl?: string;
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

function emailShell(title: string, content: string, footer = "Gorilla Gear Nutrition · South Africa"): string {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(title)}</title></head><body style="margin:0;background:${BRAND.cream};font-family:Arial,Helvetica,sans-serif;color:${BRAND.ink};"><div style="width:100%;background:${BRAND.cream};padding:24px 12px;"><div style="max-width:640px;margin:0 auto;background:${BRAND.white};box-shadow:0 6px 24px rgba(23,23,23,.08);"><div style="background:${BRAND.charcoal};padding:26px 24px 22px;text-align:center;border-bottom:4px solid ${BRAND.gold};"><img src="${LOGO_URL}" alt="Gorilla Gear Nutrition" width="210" style="display:block;width:210px;max-width:80%;height:auto;margin:0 auto 18px;border:0;outline:none;text-decoration:none;"><div style="font-size:11px;letter-spacing:2.5px;font-weight:700;color:${BRAND.gold};">GORILLA GEAR NUTRITION</div><h1 style="margin:10px 0 0;color:${BRAND.white};font-size:25px;line-height:1.2;font-weight:700;">${escapeHtml(title)}</h1></div><div style="padding:30px 28px;line-height:1.6;">${content}</div><div style="padding:18px 24px;background:${BRAND.charcoalSoft};text-align:center;font-size:12px;line-height:1.5;color:#ded8ca;">${footer}</div></div></div></body></html>`;
}

function actionButton(label: string, url: string): string {
  return `<p style="margin:24px 0 8px;"><a href="${escapeHtml(url)}" style="display:inline-block;background:${BRAND.gold};color:${BRAND.charcoal};text-decoration:none;padding:13px 20px;font-weight:700;border-radius:3px;">${escapeHtml(label)}</a></p>`;
}

function infoPanel(content: string): string {
  return `<div style="margin:20px 0;padding:14px 16px;background:${BRAND.goldSoft};border-left:4px solid ${BRAND.gold};">${content}</div>`;
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
    tls: ENV.smtpTlsServername ? { servername: ENV.smtpTlsServername, rejectUnauthorized: true } : undefined,
    auth: { user: ENV.smtpUser, pass: ENV.smtpPassword },
  });
}

export function buildPasswordResetEmail(input: PasswordResetEmailInput) {
  const safeName = escapeHtml(input.customerName);
  const resetUrl = `${SITE_URL}/reset-password?token=${encodeURIComponent(input.resetToken)}`;
  return {
    from: ENV.smtpFrom,
    to: input.customerEmail,
    replyTo: ENV.smtpFrom,
    subject: "Reset your Gorilla Gear Nutrition password",
    text: `Hi ${input.customerName},\n\nWe received a request to reset your Gorilla Gear Nutrition password. Use the secure link below within 60 minutes:\n\n${resetUrl}\n\nIf you did not request this, you can safely ignore this email. Your password will not change.\n\nRegards,\nGorilla Gear Nutrition`,
    html: emailShell("Reset your password", `<p style="font-size:16px;margin-top:0;">Hi ${safeName},</p><p>We received a request to reset your Gorilla Gear Nutrition password. This secure link expires in 60 minutes and can only be used once.</p>${actionButton("Reset password", resetUrl)}<p style="font-size:13px;color:${BRAND.muted};">If you did not request this, you can safely ignore this email. Your password will not change.</p>`),
  };
}

export function buildAdminNotificationEmail(input: AdminNotificationInput) {
  const safeTitle = escapeHtml(input.title);
  const safeContent = escapeHtml(input.content).replace(/\\n/g, "<br />");
  return {
    from: ENV.smtpFrom,
    to: ENV.adminNotificationEmail,
    replyTo: ENV.smtpFrom,
    subject: input.subject,
    text: `${input.title}\n\n${input.content}\n\nGorilla Gear Nutrition`,
    html: emailShell(input.title, `<p style="margin-top:0;line-height:1.7;">${safeContent}</p>`, "Automated administrator notification · Gorilla Gear Nutrition"),
  };
}

export function buildCustomerStatusEmail(input: CustomerStatusEmailInput) {
  const safeName = escapeHtml(input.customerName);
  const safeMessage = escapeHtml(input.message).replace(/\\n/g, "<br />");
  const action = input.actionUrl && input.actionLabel ? actionButton(input.actionLabel, input.actionUrl) : "";
  return {
    from: ENV.smtpFrom,
    to: input.customerEmail ?? undefined,
    replyTo: ENV.smtpFrom,
    subject: input.subject,
    text: `Hi ${input.customerName},\n\n${input.message}${input.actionUrl ? `\n\n${input.actionLabel ?? "View details"}: ${input.actionUrl}` : ""}\n\nRegards,\nGorilla Gear Nutrition`,
    html: emailShell(input.heading, `<p style="font-size:16px;margin-top:0;">Hi ${safeName},</p><p style="line-height:1.7;">${safeMessage}</p>${action}`),
  };
}

async function sendMail(message: { from: string; to?: string; replyTo: string; subject: string; text: string; html: string }): Promise<boolean> {
  if (!isSmtpConfigured() || !message.to) return false;
  try {
    await createSmtpTransport().sendMail(message);
    return true;
  } catch (error) {
    console.error("[Email] SMTP delivery failed:", error);
    return false;
  }
}

export async function sendAdminNotificationEmail(input: AdminNotificationInput): Promise<boolean> {
  if (!ENV.adminNotificationEmail) return false;
  return sendMail(buildAdminNotificationEmail(input));
}

export async function sendCustomerStatusEmail(input: CustomerStatusEmailInput): Promise<boolean> {
  if (!input.customerEmail) return false;
  return sendMail(buildCustomerStatusEmail(input));
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
  const orderUrl = `${SITE_URL}/orders/${input.quoteId}`;
  const itemRows = input.items.map((item) => `<tr><td style="padding:10px 0;border-bottom:1px solid ${BRAND.border};color:${BRAND.ink};">${escapeHtml(item.productName)} ×${item.quantity}</td><td style="padding:10px 0;border-bottom:1px solid ${BRAND.border};text-align:right;color:${BRAND.ink};white-space:nowrap;">${formatZar(item.lineTotal)}</td></tr>`).join("");
  const itemText = input.items.map((item) => `${item.productName} ×${item.quantity}: ${formatZar(item.lineTotal)}`).join("\n");
  return {
    from: ENV.smtpFrom,
    to: input.customerEmail ?? undefined,
    replyTo: ENV.smtpFrom,
    subject: `Quote #${input.quoteId} received — Gorilla Gear Nutrition`,
    text: `Hi ${input.customerName},\n\nWe received your quote request with Gorilla Gear Nutrition. It is now pending review.\n\n${itemText}\n\nSubtotal: ${formatZar(input.subtotal)}\nNationwide delivery: ${formatZar(input.deliveryFee)}\nEstimated total: ${formatZar(input.total)}\n\nThe nationwide flat delivery rate is R140.00 for South African destinations.\n\nView your quote: ${orderUrl}\n\nRegards,\nGorilla Gear Nutrition`,
    html: emailShell(`Quote #${input.quoteId} received`, `<p style="font-size:16px;margin-top:0;">Hi ${safeName},</p><p>We received your quote request. It is now pending review by our team.</p><table role="presentation" style="width:100%;border-collapse:collapse;margin:22px 0;">${itemRows}<tr><td style="padding:12px 0 4px;color:${BRAND.muted};">Subtotal</td><td style="padding:12px 0 4px;text-align:right;">${formatZar(input.subtotal)}</td></tr><tr><td style="padding:4px 0;color:${BRAND.muted};">Nationwide delivery</td><td style="padding:4px 0;text-align:right;">${formatZar(input.deliveryFee)}</td></tr><tr><td style="padding:14px 0 0;border-top:2px solid ${BRAND.charcoal};font-weight:700;font-size:17px;">Estimated total</td><td style="padding:14px 0 0;border-top:2px solid ${BRAND.charcoal};text-align:right;font-weight:700;font-size:17px;color:${BRAND.gold};">${formatZar(input.total)}</td></tr></table>${infoPanel("<strong>Nationwide flat delivery:</strong> R140.00 for South African destinations.")}${actionButton("View your quote", orderUrl)}<p style="font-size:13px;color:${BRAND.muted};">We will contact you with the reviewed quote and next steps.</p>`),
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
  const orderUrl = `${SITE_URL}/orders/${input.orderId}`;
  return {
    from: ENV.smtpFrom,
    to: input.customerEmail ?? undefined,
    replyTo: ENV.smtpFrom,
    subject: `Payment Confirmed — Order #${input.orderId} | Gorilla Gear Nutrition`,
    text: `Hi ${input.customerName},\n\nYour payment of ${formatZar(input.total)} for Order #${input.orderId} has been confirmed.\n\nOur team is now processing and packing your items.\n\nView order status: ${orderUrl}\n\nRegards,\nGorilla Gear Nutrition`,
    html: emailShell("Payment Confirmed", `<p style="font-size:16px;margin-top:0;">Hi ${safeName},</p><p>We have received and approved your payment of <strong>${formatZar(input.total)}</strong> for Order #${input.orderId}.</p><p>Your order is now in preparation for dispatch.</p>${actionButton("View order timeline", orderUrl)}`),
  };
}

export function buildOrderPackedEmail(input: OrderNotificationInput) {
  const safeName = escapeHtml(input.customerName);
  const orderUrl = `${SITE_URL}/orders/${input.orderId}`;
  const waybillText = input.waybillNumber ? `Waybill / Reference: ${input.waybillNumber}` : "";
  return {
    from: ENV.smtpFrom,
    to: input.customerEmail ?? undefined,
    replyTo: ENV.smtpFrom,
    subject: `Order Packed — Order #${input.orderId} | Gorilla Gear Nutrition`,
    text: `Hi ${input.customerName},\n\nYour order #${input.orderId} has been successfully packed and inspected, ready for courier collection.\n\n${waybillText}\n\nView order timeline: ${orderUrl}\n\nRegards,\nGorilla Gear Nutrition`,
    html: emailShell("Order Packed", `<p style="font-size:16px;margin-top:0;">Hi ${safeName},</p><p>Your items for Order #${input.orderId} have been inspected, securely boxed, and marked as <strong>Packed</strong>.</p>${input.waybillNumber ? infoPanel(`<strong>Waybill Reference:</strong> ${escapeHtml(input.waybillNumber)}`) : ""}<p>Next, courier collection will be scheduled with The Courier Guy.</p>${actionButton("View order timeline", orderUrl)}`),
  };
}

export function buildOrderDispatchedEmail(input: OrderNotificationInput) {
  const safeName = escapeHtml(input.customerName);
  const orderUrl = `${SITE_URL}/orders/${input.orderId}`;
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
    html: emailShell("Order Dispatched", `<p style="font-size:16px;margin-top:0;">Hi ${safeName},</p><p>Great news! Your order #${input.orderId} has been handed to <strong>${escapeHtml(carrier)}</strong> and is now on its way.</p>${infoPanel(`<strong>Tracking Number:</strong> ${escapeHtml(trackingNumber)}`)}${actionButton(trackingAction, trackingUrl)}<p style="font-size:13px;color:${BRAND.muted};">If the courier tracking page is temporarily unavailable, you can view updates from your order timeline.</p>`),
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
