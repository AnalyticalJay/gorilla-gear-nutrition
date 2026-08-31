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

const BRAND_ALIASES: Record<string, string> = {
  upa: "UPA Labs",
  "upa labs": "UPA Labs",
  "upa laboratories": "UPA Labs",
  pharmaceuticals: "Pharmaceuticals",
  pharmacuticals: "Pharmaceuticals",
  pharma: "Pharmaceuticals",
};

export function normalizeBulkImportBrand(rawValue: string | undefined): string {
  const value = (rawValue ?? "").trim().replace(/\s+/g, " ");
  if (!value) return "";
  const key = value.toLowerCase();
  return BRAND_ALIASES[key] ?? value;
}

export function formatBulkImportProductName(name: string, brand: string): string {
  const cleanName = name.trim();
  const cleanBrand = normalizeBulkImportBrand(brand);
  if (!cleanBrand) return cleanName;
  if (cleanBrand === "UPA Labs") {
    return /^upa\s*[-:]/i.test(cleanName) ? cleanName : `UPA - ${cleanName}`;
  }
  if (cleanBrand === "Pharmaceuticals") {
    return /^pharma\s*[-:]/i.test(cleanName) ? cleanName : `Pharma - ${cleanName}`;
  }
  return cleanName;
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

export function parseBulkImportCsv(csv: string): string[][] {
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
