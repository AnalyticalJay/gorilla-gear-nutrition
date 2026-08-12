export const quoteStatuses = [
  "quote_pending",
  "quote_approved",
  "quote_rejected",
  "awaiting_payment",
  "paid",
  "processing",
  "shipped",
  "completed",
  "cancelled",
] as const;

export type QuoteStatus = (typeof quoteStatuses)[number];

export function canChooseQuotePayment(status: string) {
  return status === "quote_approved";
}

export function quoteStatusLabel(status: string) {
  return status
    .replaceAll("_", " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

export function paymentStatusLabel(status: string) {
  return status
    .replaceAll("_", " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}
