import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "../drizzle/schema.ts";
import { and, eq } from "drizzle-orm";
import fs from "node:fs";
import path from "node:path";
import { storagePut } from "./storage.js";

const sourcePath = "/home/ubuntu/gorilla-gear-nutrition/hdlabs-injectables-source.json";
const reportPath = "/home/ubuntu/gorilla-gear-nutrition/hdlabs-injectable-import-report.txt";
const dryRun = !process.argv.includes("--apply");

function normalize(value: string) {
  return value.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "");
}

function safeKey(value: string) {
  return value.normalize("NFKD").replace(/[^\x00-\x7F]/g, "_").replace(/[^a-zA-Z0-9._-]+/g, "_").replace(/^_+|_+$/g, "") || "image";
}

function contentTypeFor(url: string, responseType: string | null) {
  if (responseType?.startsWith("image/")) return responseType;
  const extension = path.extname(new URL(url).pathname).toLowerCase();
  if (extension === ".png") return "image/png";
  if (extension === ".webp") return "image/webp";
  if (extension === ".avif") return "image/avif";
  return "image/jpeg";
}

function targetName(sourceName: string) {
  const aliases = new Map<string, string>([
    ["trestolonement", "testolonement"],
    ["testaject250", "testaject"],
    ["sustaject325", "sustaject"],
  ]);
  return aliases.get(normalize(sourceName)) ?? normalize(sourceName);
}

async function main() {
  const source = JSON.parse(fs.readFileSync(sourcePath, "utf8")) as {
    products: Array<{ name: string; imageUrl: string; productUrl: string }>;
  };
  const connection = await mysql.createConnection(process.env.DATABASE_URL!);
  const db = drizzle(connection, { schema, mode: "default" });
  const [products, categories] = await Promise.all([
    db.select().from(schema.products),
    db.select().from(schema.categories),
  ]);
  const categoryNames = new Map(categories.map((category) => [category.id, category.name]));
  const scopedProducts = products.filter((product) =>
    product.name.trim().toLowerCase().startsWith("hd -") &&
    (categoryNames.get(product.categoryId ?? -1) ?? "").toUpperCase() === "INJECTABLE OILS",
  );
  const report: string[] = [];
  let exactMatches = 0;
  let unmatched = 0;
  let ambiguous = 0;
  let linksCreated = 0;

  for (const sourceProduct of source.products) {
    const target = targetName(sourceProduct.name);
    const matches = scopedProducts.filter((product) => normalize(product.name.replace(/^HD\s*-\s*/i, "")) === target);
    if (matches.length === 0) {
      unmatched += 1;
      report.push(`${sourceProduct.name} | NO MATCH | ${sourceProduct.imageUrl}`);
      continue;
    }
    if (matches.length > 1) {
      ambiguous += 1;
      report.push(`${sourceProduct.name} | AMBIGUOUS ${matches.map((match) => `${match.id}:${match.name}`).join(" || ")} | ${sourceProduct.imageUrl}`);
      continue;
    }

    exactMatches += 1;
    const product = matches[0]!;
    const sourceFilename = path.basename(new URL(sourceProduct.imageUrl).pathname);
    const storageKey = `hdlabs_injectables/${product.id}_${safeKey(product.slug)}_${safeKey(sourceFilename)}`;
    const existing = await db.select({ id: schema.productImages.id })
      .from(schema.productImages)
      .where(and(eq(schema.productImages.productId, product.id), eq(schema.productImages.imageKey, storageKey)));
    if (existing.length > 0) {
      report.push(`${sourceProduct.name} | ${product.id}:${product.name} | ALREADY LINKED | ${sourceProduct.imageUrl}`);
      continue;
    }
    if (dryRun) {
      report.push(`${sourceProduct.name} | ${product.id}:${product.name} | READY | ${sourceProduct.imageUrl}`);
      continue;
    }

    const response = await fetch(sourceProduct.imageUrl);
    if (!response.ok) throw new Error(`Image fetch failed for ${sourceProduct.name}: ${response.status}`);
    const bytes = Buffer.from(await response.arrayBuffer());
    const { key, url } = await storagePut(storageKey, bytes, contentTypeFor(sourceProduct.imageUrl, response.headers.get("content-type")));
    const existingProductImages = await db.select({ id: schema.productImages.id })
      .from(schema.productImages)
      .where(eq(schema.productImages.productId, product.id));
    await db.insert(schema.productImages).values({
      productId: product.id,
      imageUrl: url,
      imageKey: key,
      isPrimary: existingProductImages.length === 0,
    });
    linksCreated += 1;
    report.push(`${sourceProduct.name} | ${product.id}:${product.name} | LINKED ${url} | ${sourceProduct.imageUrl}`);
  }

  fs.writeFileSync(reportPath, `${report.join("\n")}\n`);
  console.log(JSON.stringify({ dryRun, sourceCount: source.products.length, exactMatches, unmatched, ambiguous, linksCreated, reportPath }, null, 2));
  await connection.end();
}

void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
