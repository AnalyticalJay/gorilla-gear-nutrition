export type ProofStatus = "not_submitted" | "pending" | "approved" | "rejected";

export const proofStatusMeta: Record<ProofStatus, { label: string; description: string; className: string }> = {
  not_submitted: {
    label: "Not submitted",
    description: "Upload your proof of payment after completing the EFT transfer.",
    className: "bg-slate-500/15 text-slate-300 border-slate-500/30",
  },
  pending: {
    label: "Pending review",
    description: "Your proof of payment is with the Gorilla Gear Nutrition team for verification.",
    className: "bg-yellow-500/15 text-yellow-300 border-yellow-500/30",
  },
  approved: {
    label: "Approved",
    description: "Your proof of payment has been verified and your order can proceed.",
    className: "bg-green-500/15 text-green-300 border-green-500/30",
  },
  rejected: {
    label: "Rejected",
    description: "Your proof of payment needs attention. Review the note and upload a corrected document.",
    className: "bg-red-500/15 text-red-300 border-red-500/30",
  },
};

export function resolveProofStatus(input: {
  proofStatus?: ProofStatus | null;
  proofOfPaymentUrl?: string | null;
  paymentStatus?: string | null;
}): ProofStatus {
  if (input.proofStatus && input.proofStatus !== "not_submitted") return input.proofStatus;
  if (input.proofOfPaymentUrl || input.paymentStatus === "proof_uploaded") return "pending";
  return "not_submitted";
}
