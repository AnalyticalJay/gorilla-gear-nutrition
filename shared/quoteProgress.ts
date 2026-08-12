export type QuoteProgressState = "complete" | "current" | "upcoming" | "rejected";

export type QuoteProgressStep = {
  key: "submitted" | "review" | "approved" | "payment" | "paid";
  label: string;
  description: string;
  state: QuoteProgressState;
};

const stepOrder = ["submitted", "review", "approved", "payment", "paid"] as const;
type StepKey = (typeof stepOrder)[number];

export function getQuoteProgress(status: string, paymentStatus?: string): QuoteProgressStep[] {
  const isRejected = status === "quote_rejected";
  const paid = status === "paid" || paymentStatus === "paid";
  const currentIndex = paid
    ? 4
    : status === "awaiting_payment"
      ? 3
      : status === "quote_approved"
        ? 2
        : isRejected
          ? 1
          : 1;

  const metadata: Record<StepKey, Pick<QuoteProgressStep, "label" | "description">> = {
    submitted: { label: "Submitted", description: "Your quote request was received." },
    review: { label: "Under Review", description: "An admin is reviewing your request." },
    approved: { label: "Approved", description: "Your quote has been approved for payment." },
    payment: { label: "Payment", description: "Choose EFT or PayFast to settle the quote." },
    paid: { label: "Paid", description: "Payment received and order confirmed." },
  };

  return stepOrder.map((key, index) => ({
    key,
    ...metadata[key],
    state: isRejected && key === "review"
      ? "rejected"
      : index < currentIndex
        ? "complete"
        : index === currentIndex
          ? "current"
          : "upcoming",
  }));
}
