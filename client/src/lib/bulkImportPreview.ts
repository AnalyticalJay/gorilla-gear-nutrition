export const BULK_IMPORT_CATEGORY_NAMES = [
  "Injectables",
  "Orals",
  "SARMs",
  "Peptides",
  "Fat Loss",
  "Healthcare",
  "Supplements",
  "Clothing",
] as const;

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

export type BulkImportPreviewRow = {
  rowNumber: number;
  name: string;
  category: string;
  originalCategory: string;
  dosageInfo: string;
  description: string;
  brand: string;
  price: string;
  subcategory: string;
  shopCollection: string;
  issue?: string;
};

export type BulkImportPreview = {
  rows: BulkImportPreviewRow[];
  categoryCounts: Record<string, number>;
  errors: string[];
  warnings: string[];
  ready: boolean;
};

export function normalizePreviewCategory(rawValue: string | undefined): string {
  const value = (rawValue ?? "").trim();
  if (!value) return "";
  const key = value.toLowerCase().replace(/[\s_-]+/g, " ");
  return CATEGORY_ALIASES[key] ?? value;
}

function parseCsvRecords(csv: string): string[][] {
  const records: string[][] = [];
  let record: string[] = [];
  let field = "";
  let quoted = false;

  for (let index = 0; index < csv.length; index += 1) {
    const character = csv[index];
    const next = csv[index + 1];
    if (character === '"') {
      if (quoted && next === '"') {
        field += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }
    } else if (character === "," && !quoted) {
      record.push(field.trim());
      field = "";
    } else if ((character === "\n" || character === "\r") && !quoted) {
      if (character === "\r" && next === "\n") index += 1;
      record.push(field.trim());
      field = "";
      if (record.some((value) => value !== "")) records.push(record);
      record = [];
    } else {
      field += character;
    }
  }

  record.push(field.trim());
  if (record.some((value) => value !== "")) records.push(record);
  return records;
}

function normalizePrice(rawValue: string): { value: string; issue?: string } {
  const raw = rawValue.trim();
  if (!raw) return { value: "0.00" };
  const normalized = raw.replace(/^R\s*/i, "").replace(/\s/g, "");
  if (!/^\d+(?:\.\d{1,2})?$/.test(normalized)) return { value: normalized, issue: "Price must be a non-negative ZAR amount with up to two decimals" };
  return { value: Number(normalized).toFixed(2) };
}

export function previewBulkImport(csv: string): BulkImportPreview {
  const records = parseCsvRecords(csv);
  if (records.length < 2) return { rows: [], categoryCounts: {}, errors: ["CSV must contain a header row and at least one product row"], warnings: [], ready: false };

  const headers = records[0].map((header) => header.toLowerCase().trim());
  const indexOf = (header: string) => headers.indexOf(header);
  const nameIndex = indexOf("name");
  const categoryIndex = indexOf("category");
  const dosageIndex = indexOf("dosageinfo");
  const descriptionIndex = indexOf("description");
  const brandIndex = indexOf("brand");
  const priceIndex = indexOf("price");
  const subcategoryIndex = indexOf("subcategory");
  const shopCollectionIndex = indexOf("shopcollection");
  const errors: string[] = [];
  const warnings: string[] = [];
  if (nameIndex < 0 || categoryIndex < 0) return { rows: [], categoryCounts: {}, errors: ["CSV needs name and category columns"], warnings: [], ready: false };

  const categoryCounts: Record<string, number> = {};
  const rows = records.slice(1).map((record, offset) => {
    const rowNumber = offset + 2;
    const name = record[nameIndex] ?? "";
    const originalCategory = record[categoryIndex] ?? "";
    const category = normalizePreviewCategory(originalCategory);
    const priceResult = normalizePrice(priceIndex >= 0 ? record[priceIndex] ?? "" : "");
    const issue = !name ? "Product name is required" : !category ? "Category is required" : priceResult.issue;
    if (issue) errors.push(`Row ${rowNumber}: ${issue}`);
    if (category && !BULK_IMPORT_CATEGORY_NAMES.includes(category as (typeof BULK_IMPORT_CATEGORY_NAMES)[number])) {
      warnings.push(`Row ${rowNumber}: “${originalCategory}” is not one of the active categories`);
    }
    if (category) categoryCounts[category] = (categoryCounts[category] ?? 0) + 1;
    return { rowNumber, name, category, originalCategory, dosageInfo: record[dosageIndex] ?? "", description: record[descriptionIndex] ?? "", brand: record[brandIndex] ?? "", price: priceResult.value, subcategory: record[subcategoryIndex] ?? "", shopCollection: record[shopCollectionIndex] ?? "", issue };
  });

  return { rows, categoryCounts, errors, warnings, ready: rows.length > 0 && errors.length === 0 };
}
