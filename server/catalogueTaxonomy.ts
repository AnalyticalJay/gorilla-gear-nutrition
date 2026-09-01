import { and, eq, inArray } from "drizzle-orm";
import {
  catalogueBrandAliases,
  catalogueBrands,
  catalogueProductTaxonomy,
  catalogueShopCollections,
  catalogueSubcategories,
} from "../drizzle/schema";
import { getDb } from "./db";

export async function getCatalogueTaxonomy(options: { activeOnly?: boolean } = {}) {
  const db = await getDb();
  if (!db) return { brands: [], subcategories: [], collections: [], aliases: [] };
  const activeOnly = options.activeOnly !== false;
  const active = <T extends { isActive: unknown }>(table: T) => activeOnly ? eq(table.isActive as any, true) : undefined;

  const [brands, subcategories, collections, aliases] = await Promise.all([
    db.select().from(catalogueBrands).where(active(catalogueBrands)).orderBy(catalogueBrands.sortOrder, catalogueBrands.name),
    db.select().from(catalogueSubcategories).where(active(catalogueSubcategories)).orderBy(catalogueSubcategories.sortOrder, catalogueSubcategories.name),
    db.select().from(catalogueShopCollections).where(active(catalogueShopCollections)).orderBy(catalogueShopCollections.sortOrder, catalogueShopCollections.name),
    db.select().from(catalogueBrandAliases).orderBy(catalogueBrandAliases.alias),
  ]);

  return { brands, subcategories, collections, aliases };
}

export async function upsertProductTaxonomy(data: {
  productId: number;
  brandId: number;
  subcategoryId?: number | null;
  shopCollectionId?: number | null;
  sourceLabel?: string | null;
  reviewStatus?: "confirmed" | "needs_review" | "unmapped";
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(catalogueProductTaxonomy).values({
    productId: data.productId,
    brandId: data.brandId,
    subcategoryId: data.subcategoryId ?? null,
    shopCollectionId: data.shopCollectionId ?? null,
    sourceLabel: data.sourceLabel ?? null,
    reviewStatus: data.reviewStatus ?? "needs_review",
  }).onDuplicateKeyUpdate({
    set: {
      brandId: data.brandId,
      subcategoryId: data.subcategoryId ?? null,
      shopCollectionId: data.shopCollectionId ?? null,
      sourceLabel: data.sourceLabel ?? null,
      reviewStatus: data.reviewStatus ?? "needs_review",
    },
  });
}

export async function getProductTaxonomy(productId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const [row] = await db
    .select({ taxonomy: catalogueProductTaxonomy, brand: catalogueBrands, subcategory: catalogueSubcategories, collection: catalogueShopCollections })
    .from(catalogueProductTaxonomy)
    .leftJoin(catalogueBrands, eq(catalogueProductTaxonomy.brandId, catalogueBrands.id))
    .leftJoin(catalogueSubcategories, eq(catalogueProductTaxonomy.subcategoryId, catalogueSubcategories.id))
    .leftJoin(catalogueShopCollections, eq(catalogueProductTaxonomy.shopCollectionId, catalogueShopCollections.id))
    .where(eq(catalogueProductTaxonomy.productId, productId))
    .limit(1);
  return row;
}

export async function getProductTaxonomyByProductIds(productIds: number[]) {
  const db = await getDb();
  if (!db || productIds.length === 0) return [];
  return db
    .select({ taxonomy: catalogueProductTaxonomy, brand: catalogueBrands, subcategory: catalogueSubcategories, collection: catalogueShopCollections })
    .from(catalogueProductTaxonomy)
    .leftJoin(catalogueBrands, eq(catalogueProductTaxonomy.brandId, catalogueBrands.id))
    .leftJoin(catalogueSubcategories, eq(catalogueProductTaxonomy.subcategoryId, catalogueSubcategories.id))
    .leftJoin(catalogueShopCollections, eq(catalogueProductTaxonomy.shopCollectionId, catalogueShopCollections.id))
    .where(inArray(catalogueProductTaxonomy.productId, productIds));
}

export async function getProductTaxonomyCoverage() {
  const db = await getDb();
  if (!db) return { assigned: 0, confirmed: 0, needsReview: 0, unmapped: 0 };
  const rows = await db.select({ status: catalogueProductTaxonomy.reviewStatus }).from(catalogueProductTaxonomy);
  return rows.reduce((summary, row) => {
    summary.assigned += 1;
    if (row.status === "confirmed") summary.confirmed += 1;
    else if (row.status === "unmapped") summary.unmapped += 1;
    else summary.needsReview += 1;
    return summary;
  }, { assigned: 0, confirmed: 0, needsReview: 0, unmapped: 0 });
}
