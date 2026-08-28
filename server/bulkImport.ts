export const BULK_IMPORT_HEADERS = ["name", "category", "dosageInfo", "description", "brand", "price"] as const;

const CATEGORY_ALIASES: Record<string, string> = {
  peptide: "Peptides",
  peptides: "Peptides",
  injectable: "Injectables",
  injectables: "Injectables",
  "injectable oils": "Injectables",
  amp: "Injectables",
  amps: "Injectables",
  pens: "Injectables",
  oral: "Orals",
  orals: "Orals",
  "oral steroids": "Orals",
  sarm: "SARMs",
  sarms: "SARMs",
  "fat loss": "Fat Loss",
  "weight loss": "Fat Loss",
  healthcare: "Healthcare",
  health: "Healthcare",
  supplement: "Supplements",
  supplements: "Supplements",
  clothing: "Clothing",
  apparel: "Clothing",
};

export function normalizeBulkImportCategory(rawValue: string | undefined): string {
  const value = (rawValue ?? "").trim();
  if (!value) return "";
  const key = value.toLowerCase().replace(/[\s_-]+/g, " ");
  return CATEGORY_ALIASES[key] ?? value;
}

export function parseBulkImportPrice(rawValue: string | undefined): string {
  const raw = (rawValue ?? "").trim();
  if (!raw) return "0.00";

  const normalized = raw.replace(/^R\s*/i, "").replace(/\s/g, "");
  if (!/^\d+(?:\.\d{1,2})?$/.test(normalized)) {
    throw new Error("Price must be a non-negative amount with up to two decimal places, for example 450 or 450.00");
  }

  const amount = Number(normalized);
  if (!Number.isFinite(amount) || amount > 99999999.99) {
    throw new Error("Price is outside the supported range");
  }

  return amount.toFixed(2);
}
