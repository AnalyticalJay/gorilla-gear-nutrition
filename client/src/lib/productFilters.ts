export type BrandFilter = 
  | "all" 
  | "Ouroboros Labs" 
  | "Keifei Pharmaceuticals" 
  | "UPA Labs" 
  | "Genesis" 
  | "Biolab" 
  | "Mactropin" 
  | "SP Laboratories" 
  | "HD Labs"
  | "BP Pharma"
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
  "Genesis",
  "Biolab",
  "Mactropin",
  "SP Laboratories",
  "HD Labs",
  "BP Pharma"
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
  if (text.includes("genesis") || text.includes("gen ")) return "Genesis";
  if (text.includes("biolab") || text.includes("bio ")) return "Biolab";
  if (text.includes("mactropin") || text.includes("mac ")) return "Mactropin";
  if (text.includes("sp laboratories") || text.includes("sp ")) return "SP Laboratories";
  
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
