import fs from "node:fs/promises";
import { and, eq, like } from "drizzle-orm";
import { getDb } from "./db.js";
import { categories, products, productImages } from "../drizzle/schema.js";

type SourceProduct = { name: string; imageUrl: string; productUrl: string };

async function main() {
  const source = JSON.parse(await fs.readFile("/home/ubuntu/gorilla-gear-nutrition/hdlabs-injectables-source.json", "utf8")) as { products: SourceProduct[] };
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");

  const rows = await db
    .select({
      id: products.id,
      name: products.name,
      slug: products.slug,
      category: categories.name,
      imageCount: productImages.id,
    })
    .from(products)
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .leftJoin(productImages, and(eq(productImages.productId, products.id), eq(productImages.isPrimary, true)))
    .where(like(products.name, "%HD Labs%"));

  const allRows = await db
    .select({ id: products.id, name: products.name, slug: products.slug, category: categories.name, imageCount: productImages.id })
    .from(products)
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .leftJoin(productImages, and(eq(productImages.productId, products.id), eq(productImages.isPrimary, true)))
    .where(like(categories.name, "%Inject%"));

  const normalize = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, "").replace(/^hdlabs/, "");
  const candidates = allRows.filter((candidate) => candidate.name.trim().toLowerCase().startsWith("hd -"));
  const matches = source.products.map((sourceProduct) => {
    const sourceKey = normalize(sourceProduct.name);
    const exact = candidates.filter((candidate) => {
      const candidateKey = normalize(candidate.name);
      return candidateKey === sourceKey || candidateKey === `hdlabs${sourceKey}` || candidateKey.includes(sourceKey) || sourceKey.includes(candidateKey);
    });
    return { source: sourceProduct, matches: exact };
  });

  console.log(JSON.stringify({ sourceCount: source.products.length, catalogRows: candidates, matches }, null, 2));
}

void main();
