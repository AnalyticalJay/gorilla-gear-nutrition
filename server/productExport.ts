import { BULK_IMPORT_HEADERS } from "./bulkImport";

export type ExportableProduct = {
  name: string;
  categoryName?: string | null;
  dosageInfo?: string | null;
  description?: string | null;
  brand?: string | null;
  price?: string | number | null;
};

function escapeCsvField(value: unknown): string {
  const text = value == null ? "" : String(value);
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function formatPrice(value: ExportableProduct["price"]): string {
  if (value == null || value === "") return "0.00";
  const amount = Number(value);
  return Number.isFinite(amount) ? amount.toFixed(2) : "0.00";
}

export function buildProductsCsv(products: readonly ExportableProduct[]): string {
  const header = BULK_IMPORT_HEADERS.join(",");
  const rows = products.map((product) => [
    product.name,
    product.categoryName ?? "",
    product.dosageInfo ?? "",
    product.description ?? "",
    product.brand ?? "",
    formatPrice(product.price),
  ].map(escapeCsvField).join(","));

  return [header, ...rows].join("\r\n") + "\r\n";
}
