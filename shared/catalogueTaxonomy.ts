export const PDF_BRANDS = [
  "Ouroboros Laboratories",
  "Keifei Pharmaceuticals",
  "UPA Labs",
  "Vmed",
  "HD Labs",
  "BodyPharm",
  "iPharma",
  "Pharmacom",
  "Cooper Pharmaceuticals",
  "Noventra Pharm",
  "DEX Pharma",
  "Nova Labs",
  "XLR",
  "Peptide Pens — Unbranded / P Range",
  "OralTec",
  "Psytech",
  "Kohoh",
  "Healthy U",
  "Creme Supreme",
  "Nutritech",
  "DoughBro Cookies",
] as const;

export const INTERNAL_REVIEW_BRAND = "Unmapped / Review" as const;

export const PDF_SUBCATEGORIES = [
  "Peptides & Wellness",
  "Peptide Pens",
  "Merchandise",
  "Injectable Oils",
  "Peptides / Growth Hormone",
  "Orals",
  "SARMs",
  "Hybrid Injectables",
  "Peptides",
  "Black Series",
  "Weight Loss Vials",
  "Weight Loss Pens",
  "Oral Anabolics",
  "Anti-E / Sex Aid",
  "Healthcare",
  "Pens / Peptides",
  "Pens & Blends",
  "Injectable / Wellness",
  "Pens & Vials",
  "Injectables",
  "Orals / SARMs",
  "Orals / Wellness",
  "Supplements & Wellness",
  "Cream of Rice / Complex Carb Hot Cereal",
  "Protein",
  "Treats",
] as const;

export const PDF_SHOP_COLLECTIONS = [
  { name: "Supplements", slug: "supplements", isPublic: true },
  { name: "Nutrition", slug: "nutrition", isPublic: true },
  { name: "Peptides & Wellness", slug: "peptides-wellness", isPublic: false },
  { name: "Peptide Pens", slug: "peptide-pens", isPublic: false },
  { name: "Accessories", slug: "accessories", isPublic: true },
  { name: "Clothing", slug: "clothing", isPublic: true },
  { name: "Treats", slug: "treats", isPublic: true },
] as const;

export const BRAND_ALIASES: Record<string, string> = {
  "ouroboros laboratories": "Ouroboros Laboratories",
  ouroboros: "Ouroboros Laboratories",
  ol: "Ouroboros Laboratories",
  keifei: "Keifei Pharmaceuticals",
  "keifei pharmaceuticals": "Keifei Pharmaceuticals",
  upa: "UPA Labs",
  "upa labs": "UPA Labs",
  vmed: "Vmed",
  hd: "HD Labs",
  "hd labs": "HD Labs",
  bodypharm: "BodyPharm",
  ipharma: "iPharma",
  "i pharma": "iPharma",
  pharmacom: "Pharmacom",
  pc: "Pharmacom",
  "cooper pharmaceuticals": "Cooper Pharmaceuticals",
  cooper: "Cooper Pharmaceuticals",
  noventra: "Noventra Pharm",
  "noventra pharm": "Noventra Pharm",
  np: "Noventra Pharm",
  dex: "DEX Pharma",
  dp: "DEX Pharma",
  "nova labs": "Nova Labs",
  nova: "Nova Labs",
  xlr: "XLR",
  oraltec: "OralTec",
  ot: "OralTec",
  psytech: "Psytech",
  psy: "Psytech",
  kohoh: "Kohoh",
  kh: "Kohoh",
  "healthy u": "Healthy U",
  hu: "Healthy U",
  "creme supreme": "Creme Supreme",
  nutritech: "Nutritech",
  doughbro: "DoughBro Cookies",
  "doughbro cookies": "DoughBro Cookies",
};

export function normalizeTaxonomyLabel(value: string | null | undefined): string {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[–—]/g, "-")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function slugifyTaxonomy(value: string): string {
  return normalizeTaxonomyLabel(value).replace(/\s+/g, "-");
}

export function normalizeBrandLabel(value: string | null | undefined): string {
  const normalized = normalizeTaxonomyLabel(value);
  return BRAND_ALIASES[normalized] ?? (value ?? "").trim();
}
