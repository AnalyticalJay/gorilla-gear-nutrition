export const BULK_IMPORT_HEADERS = ["name", "category", "dosageInfo", "description", "brand", "price"] as const;

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
