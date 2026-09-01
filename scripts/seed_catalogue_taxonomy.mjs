import { and, eq } from "drizzle-orm";
import { getDb } from "../server/db.ts";
import {
  catalogueBrandAliases,
  catalogueBrands,
  catalogueProductTaxonomy,
  catalogueShopCollections,
  catalogueSubcategories,
  categories,
  products,
} from "../drizzle/schema.ts";
import {
  BRAND_ALIASES,
  INTERNAL_REVIEW_BRAND,
  PDF_BRANDS,
  PDF_SHOP_COLLECTIONS,
  PDF_SUBCATEGORIES,
  normalizeBrandLabel,
  normalizeTaxonomyLabel,
  slugifyTaxonomy,
} from "../shared/catalogueTaxonomy.ts";

const db = await getDb();
if (!db) throw new Error("Database unavailable");

const unique = (values) => [...new Set(values)];
const allBrands = unique([...PDF_BRANDS, INTERNAL_REVIEW_BRAND]);

for (const [index, name] of allBrands.entries()) {
  const slug = slugifyTaxonomy(name);
  await db.insert(catalogueBrands).values({ name, slug, sortOrder: index, isActive: name !== INTERNAL_REVIEW_BRAND }).onDuplicateKeyUpdate({
    set: { name, sortOrder: index, isActive: name !== INTERNAL_REVIEW_BRAND },
  });
}

for (const name of PDF_SUBCATEGORIES) {
  await db.insert(catalogueSubcategories).values({ name, slug: slugifyTaxonomy(name), sortOrder: PDF_SUBCATEGORIES.indexOf(name), isActive: true }).onDuplicateKeyUpdate({
    set: { name, sortOrder: PDF_SUBCATEGORIES.indexOf(name), isActive: true },
  });
}

for (const [index, collection] of PDF_SHOP_COLLECTIONS.entries()) {
  await db.insert(catalogueShopCollections).values({ ...collection, sortOrder: index, description: null, isActive: true }).onDuplicateKeyUpdate({
    set: { name: collection.name, sortOrder: index, isPublic: collection.isPublic, isActive: true },
  });
}

const brandRows = await db.select().from(catalogueBrands);
const subcategoryRows = await db.select().from(catalogueSubcategories);
const collectionRows = await db.select().from(catalogueShopCollections);
const brandByName = new Map(brandRows.map((row) => [row.name, row]));
const subcategoryByName = new Map(subcategoryRows.map((row) => [row.name, row]));
const collectionBySlug = new Map(collectionRows.map((row) => [row.slug, row]));
const categoryRows = await db.select().from(categories);
const categoryByName = new Map(categoryRows.map((row) => [row.name.toLowerCase(), row]));
const reviewBrand = brandByName.get(INTERNAL_REVIEW_BRAND);
if (!reviewBrand) throw new Error("Review brand seed failed");

const acceptedBrands = new Set(PDF_BRANDS);
const explicitPrefixAliases = new Map(Object.entries(BRAND_ALIASES));
const prefixFromProductName = (name) => {
  const match = String(name ?? "").trim().match(/^([^\-–—]+?)\s*[-–—]\s*/);
  return match ? match[1].trim() : "";
};

function resolveBrand(name) {
  const prefix = prefixFromProductName(name);
  const normalizedPrefix = normalizeTaxonomyLabel(prefix);
  const alias = explicitPrefixAliases.get(normalizedPrefix);
  if (alias && acceptedBrands.has(alias)) return { brand: brandByName.get(alias), sourceLabel: prefix, mapped: true };
  const normalizedName = normalizeTaxonomyLabel(name);
  if (normalizedName.includes("ouroboros")) return { brand: brandByName.get("Ouroboros Laboratories"), sourceLabel: "name:ouroboros", mapped: true };
  if (normalizedName.includes("keifei")) return { brand: brandByName.get("Keifei Pharmaceuticals"), sourceLabel: "name:keifei", mapped: true };
  if (normalizedName.includes("upa")) return { brand: brandByName.get("UPA Labs"), sourceLabel: "name:upa", mapped: true };
  if (normalizedName.includes("hd labs")) return { brand: brandByName.get("HD Labs"), sourceLabel: "name:hd labs", mapped: true };
  return { brand: reviewBrand, sourceLabel: prefix || "unprefixed", mapped: false };
}

function resolveSubcategory(categoryName, productName) {
  const category = String(categoryName ?? "").toLowerCase();
  const name = String(productName ?? "").toLowerCase();
  if (category === "clothing") return "Merchandise";
  if (category === "supplements") return "Supplements & Wellness";
  if (category === "healthcare") return "Healthcare";
  if (category === "fat loss") return name.includes("pen") ? "Weight Loss Pens" : "Weight Loss Vials";
  if (category === "peptides") return name.includes("pen") ? "Peptide Pens" : "Peptides";
  if (category === "sarms") return "SARMs";
  if (category === "orals") return "Orals";
  if (category === "injectables") {
    return /\b(blend|mix|max\s+cut|max\s+size|max\s+bulk|superbulk|supersize|supertest)\b/i.test(productName)
      ? "Hybrid Injectables"
      : "Injectable Oils";
  }
  return null;
}

function resolveCollection(categoryName, productName, brandName, subcategoryName) {
  const category = String(categoryName ?? "").toLowerCase();
  const name = String(productName ?? "").toLowerCase();
  if (category === "clothing") return "clothing";
  if (brandName === "DoughBro Cookies") return "treats";
  if (brandName === "Nutritech" || brandName === "Creme Supreme") return "nutrition";
  if (category === "supplements") return "supplements";
  if (subcategoryName === "Peptide Pens" || subcategoryName === "Weight Loss Pens" || /\bpen\b/i.test(name) && category === "peptides") return "peptide-pens";
  if (subcategoryName === "Peptides" || subcategoryName === "Weight Loss Vials") return "peptides-wellness";
  return null;
}

const productRows = await db
  .select({ id: products.id, name: products.name, categoryName: categories.name })
  .from(products)
  .leftJoin(categories, eq(products.categoryId, categories.id));

let confirmed = 0;
let needsReview = 0;
let unmapped = 0;
for (const product of productRows) {
  const resolved = resolveBrand(product.name);
  const brand = resolved.brand ?? reviewBrand;
  const subcategoryName = resolveSubcategory(product.categoryName, product.name);
  const subcategory = subcategoryName ? subcategoryByName.get(subcategoryName) : undefined;
  const collectionSlug = resolveCollection(product.categoryName, product.name, brand.name, subcategoryName);
  const collection = collectionSlug ? collectionBySlug.get(collectionSlug) : undefined;
  const status = resolved.mapped && subcategory ? "confirmed" : resolved.mapped ? "needs_review" : "unmapped";
  await db.insert(catalogueProductTaxonomy).values({
    productId: product.id,
    brandId: brand.id,
    subcategoryId: subcategory?.id ?? null,
    shopCollectionId: collection?.id ?? null,
    sourceLabel: resolved.sourceLabel,
    reviewStatus: status,
  }).onDuplicateKeyUpdate({
    set: {
      brandId: brand.id,
      subcategoryId: subcategory?.id ?? null,
      shopCollectionId: collection?.id ?? null,
      sourceLabel: resolved.sourceLabel,
      reviewStatus: status,
    },
  });
  if (status === "confirmed") confirmed += 1;
  else if (status === "unmapped") unmapped += 1;
  else needsReview += 1;
}

for (const [alias, canonical] of Object.entries(BRAND_ALIASES)) {
  const brand = brandByName.get(canonical);
  if (!brand) continue;
  await db.insert(catalogueBrandAliases).values({ alias, normalizedAlias: normalizeTaxonomyLabel(alias), brandId: brand.id }).onDuplicateKeyUpdate({
    set: { alias, brandId: brand.id },
  });
}

console.log(JSON.stringify({
  brands: allBrands.length,
  subcategories: PDF_SUBCATEGORIES.length,
  collections: PDF_SHOP_COLLECTIONS.length,
  productsAssigned: productRows.length,
  confirmed,
  needsReview,
  unmapped,
}, null, 2));
