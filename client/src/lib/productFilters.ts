export type BrandFilter = 
  | "all" 
  | "Ouroboros Labs" 
  | "Keifei Pharmaceuticals" 
  | "UPA Labs" 
  | "Pharmaceuticals"
  | "Mactropin" 
  | "SP Laboratories" 
  | "HD Labs"
  | "BP Pharma"
  | "BodyPharm"
  | "iPharma"
  | "Pharmacom"
  | "Cooper Pharmaceuticals"
  | "Noventra Pharm"
  | "DEX Pharma"
  | "Nova Labs"
  | "XLR"
  | "Peptide Pens — Unbranded / P Range"
  | "OralTec"
  | "Psytech"
  | "Kohoh"
  | "Healthy U"
  | "Creme Supreme"
  | "Nutritech"
  | "DoughBro Cookies"
  | "Other";

export type ProductSearchRecord = {
  name?: string | null;
  slug?: string | null;
  description?: string | null;
  price?: number | string | null;
};

export const AVAILABLE_BRANDS: BrandFilter[] = [
  "all",
  "Ouroboros Labs",
  "Keifei Pharmaceuticals",
  "UPA Labs",
  "Pharmaceuticals",
  "Mactropin",
  "SP Laboratories",
  "HD Labs",
  "BP Pharma",
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
  "DoughBro Cookies"
];

export function getProductBrand(product: ProductSearchRecord): BrandFilter {
  const text = [product.name, product.slug, product.description]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  if (text.includes("hd labs") || /\bhd\b/.test(text)) return "HD Labs";
  if (text.includes("bp pharma") || /\bbp\b/.test(text)) return "BP Pharma";
  if (text.includes("ouroboros") || text.includes("ol ")) return "Ouroboros Labs";
  if (text.includes("keifei")) return "Keifei Pharmaceuticals";
  if (text.includes("upa") || text.includes("upa labs")) return "UPA Labs";
  if (text.includes("bodypharm")) return "BodyPharm";
  if (text.includes("ipharma") || text.includes("i pharma")) return "iPharma";
  if (text.includes("pharmacom")) return "Pharmacom";
  if (text.includes("cooper pharmaceuticals") || text.includes("cooper")) return "Cooper Pharmaceuticals";
  if (text.includes("noventra")) return "Noventra Pharm";
  if (text.includes("dex pharma") || text.includes("dex")) return "DEX Pharma";
  if (text.includes("nova labs") || text.includes("nova")) return "Nova Labs";
  if (text.includes("xlr")) return "XLR";
  if (text.includes("oraltec") || text.includes("ot ")) return "OralTec";
  if (text.includes("psytech") || text.includes("psy ")) return "Psytech";
  if (text.includes("kohoh") || text.includes("kh ")) return "Kohoh";
  if (text.includes("healthy u")) return "Healthy U";
  if (text.includes("creme supreme")) return "Creme Supreme";
  if (text.includes("nutritech")) return "Nutritech";
  if (text.includes("doughbro")) return "DoughBro Cookies";
  if (text.includes("mactropin") || text.includes("mac ")) return "Mactropin";
  if (text.includes("sp laboratories") || text.includes("sp ")) return "SP Laboratories";
  if (text.includes("pharma")) return "Pharmaceuticals";
  
  return "Other";
}

export function matchesBrand(product: ProductSearchRecord, selectedBrand: BrandFilter): boolean {
  return selectedBrand === "all" || getProductBrand(product) === selectedBrand;
}

export function matchesPriceRange(product: ProductSearchRecord, maxPrice: number): boolean {
  if (maxPrice <= 0) return true;
  const rawPrice = product.price;
  const priceNum = typeof rawPrice === 'number' ? rawPrice : Number(rawPrice ?? 0);
  return priceNum <= maxPrice;
}
