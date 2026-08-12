import fs from "node:fs";
import path from "node:path";
import mysql from "mysql2/promise";
import { drizzle } from "drizzle-orm/mysql2";
import { and, eq } from "drizzle-orm";
import * as schema from "../drizzle/schema.ts";
import { storagePut } from "./storage.js";

const sourcePath = "/home/ubuntu/gorilla-gear-nutrition/hdlabs-oral-source.json";
const reportPath = "/home/ubuntu/gorilla-gear-nutrition/hdlabs-oral-import-report.txt";
const dryRun = !process.argv.includes("--apply");

type SourceItem = {
  source_name: string;
  image_url: string;
  product_url: string;
  card_text?: string;
  prices?: string[];
};

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
    ["anadrol50", "anaps"],
    ["anabolicumlgd4033", "lgd4033anabolicum"],
    ["andarines4", "anderine"],
    ["cardarinegw501516", "gw501516cardarine"],
    ["nutrobalmk677", "mk677nutrobol"],
    ["ostarinemk2866", "ostarinemk2866"],
    ["stenabolicsr9009", "sr9009stenabolic"],
    ["testolonerad140", "rad140testolone"],
    ["anapolanoxymetholone", "anaps"],
    ["anavaroxandrolone", "anavar"],
    ["winstrolstanozolol", "winstrol"],
    ["arimidexanastrozole", "arimidex"],
    ["clomidclomipheneCitrate".toLowerCase(), "clomid"],
    ["halotestfluoxymesterone", "halotest"],
  ]);
  return aliases.get(normalize(sourceName)) ?? normalize(sourceName);
}

function isOralCategory(categoryName: string) {
  const normalized = categoryName.trim().toLowerCase();
  return normalized === "orals" || normalized === "sarms";
}

async function main() {
  const source = JSON.parse(fs.readFileSync(sourcePath, "utf8")) as { items: SourceItem[] };
  const connection = await mysql.createConnection(process.env.DATABASE_URL!);
  const db = drizzle(connection, { schema, mode: "default" });
  const [products, categories] = await Promise.all([
    db.select().from(schema.products),
    db.select().from(schema.categories),
  ]);
  const categoryNames = new Map(categories.map((category) => [category.id, category.name]));
  const scopedProducts = products.filter((product) => {
    const categoryName = categoryNames.get(product.categoryId ?? -1) ?? "";
    return product.name.trim().toLowerCase().startsWith("hd -") && isOralCategory(categoryName);
  });
  const report: string[] = [];
  let exactMatches = 0;
  let unmatched = 0;
  let ambiguous = 0;
  let linksCreated = 0;
  for (const sourceItem of source.items) {
    const target = targetName(sourceItem.source_name);
    const matches = scopedProducts.filter((product) => normalize(product.name.replace(/^HD\s*-\s*/i, "")) === target);
    if (matches.length === 0) {
      unmatched += 1;
      report.push(`${sourceItem.source_name} | NO MATCH | ${sourceItem.image_url}`);
      continue;
    }
    if (matches.length > 1) {
      ambiguous += 1;
      report.push(`${sourceItem.source_name} | AMBIGUOUS ${matches.map((match) => `${match.id}:${match.name}:${match.dosageInfo ?? ""}`).join(" || ")} | ${sourceItem.image_url}`);
      continue;
    }
    exactMatches += 1;
    const product = matches[0]!;
    const sourceFilename = path.basename(new URL(sourceItem.image_url).pathname);
    const storageKey = `hdlabs_orals/${product.id}_${safeKey(product.slug)}_${safeKey(sourceFilename)}`;
    const existing = await db.select({ id: schema.productImages.id })
      .from(schema.productImages)
      .where(and(eq(schema.productImages.productId, product.id), eq(schema.productImages.imageKey, storageKey)));
    if (existing.length > 0) {
      report.push(`${sourceItem.source_name} | ${product.id}:${product.name}:${product.dosageInfo ?? ""} | ALREADY LINKED | ${sourceItem.image_url}`);
      continue;
    }
    if (dryRun) {
      report.push(`${sourceItem.source_name} | ${product.id}:${product.name}:${product.dosageInfo ?? ""} | READY | ${sourceItem.image_url}`);
      continue;
    }
    const response = await fetch(sourceItem.image_url);
    if (!response.ok) throw new Error(`Image fetch failed for ${sourceItem.source_name}: ${response.status}`);
    const bytes = Buffer.from(await response.arrayBuffer());
    const { key, url } = await storagePut(storageKey, bytes, contentTypeFor(sourceItem.image_url, response.headers.get("content-type")));
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
    report.push(`${sourceItem.source_name} | ${product.id}:${product.name}:${product.dosageInfo ?? ""} | LINKED ${url} | ${sourceItem.image_url}`);
  }
  fs.writeFileSync(reportPath, `${report.join("\n")}\n`);
  console.log(JSON.stringify({ dryRun, sourceCount: source.items.length, exactMatches, unmatched, ambiguous, linksCreated, reportPath }, null, 2));
  await connection.end();
}

void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
