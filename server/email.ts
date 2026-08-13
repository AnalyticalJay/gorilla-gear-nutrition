import nodemailer from "nodemailer";
import { ENV } from "./_core/env";

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

  const transporter = nodemailer.createTransport({
    host: ENV.smtpHost,
    port: ENV.smtpPort,
    secure: ENV.smtpSecure,
    requireTLS: !ENV.smtpSecure,
    auth: {
      user: ENV.smtpUser,
      pass: ENV.smtpPassword,
    },
  });

  await transporter.sendMail(buildQuoteConfirmationEmail(input));
  return true;
}
