export type BrandFilter = "all" | "HD Labs" | "BP Pharma";

export type ProductSearchRecord = {
  name?: string | null;
  slug?: string | null;
  description?: string | null;
};

export function getProductBrand(product: ProductSearchRecord) {
  const text = [product.name, product.slug, product.description]
    .filter(Boolean)
    .join(" ")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ");

  if (text.includes("bp pharma") || /\bbp\b/.test(text)) return "BP Pharma" as const;
  if (text.includes("hd labs") || /\bhd\b/.test(text)) return "HD Labs" as const;
  return "Other" as const;
}

export function matchesBrand(product: ProductSearchRecord, selectedBrand: BrandFilter) {
  return selectedBrand === "all" || getProductBrand(product) === selectedBrand;
}
