import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from '../drizzle/schema.ts';
import { and, eq, like, or } from 'drizzle-orm';
import fs from 'node:fs';
import path from 'node:path';
import { storagePut } from './storage.js';

const work = '/home/ubuntu/ggn-image-import-20260812';
const groups = [
  { key: 'noventra', dir: path.join(work, 'Noventra'), prefix: 'NP - ' },
  { key: 'ipharma', dir: path.join(work, 'IPharma'), prefix: 'Ipharma - ' },
  { key: 'pharmacom', dir: path.join(work, 'Pharmacom'), prefix: 'PC - ' },
  { key: 'nova', dir: path.join(work, 'NOVA'), prefix: 'NOVA - ' },
] as const;

type Product = typeof schema.products.$inferSelect;
type Group = (typeof groups)[number];
type ProductRecord = Product & { categoryName: string };

function normalize(value: string) {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '');
}

function productCore(name: string, prefix: string) {
  return normalize(name.slice(prefix.length).replace(/\(no stock\)/gi, ' '));
}

function filenameCore(filePath: string) {
  return normalize(path.basename(filePath, path.extname(filePath)));
}

function filesUnder(dir: string): string[] {
  const out: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...filesUnder(fullPath));
    else if (/\.(png|jpg|jpeg|webp|jfif|avif)$/i.test(entry.name)) out.push(fullPath);
  }
  return out.sort();
}

function contentTypeFor(filePath: string) {
  switch (path.extname(filePath).toLowerCase()) {
    case '.png': return 'image/png';
    case '.webp': return 'image/webp';
    case '.avif': return 'image/avif';
    default: return 'image/jpeg';
  }
}

function safeKey(value: string) {
  return value
    .normalize('NFKD')
    .replace(/[^\x00-\x7F]/g, '_')
    .replace(/[^a-zA-Z0-9._-]+/g, '_')
    .replace(/^_+|_+$/g, '') || 'image';
}

function findMatches(group: Group, filePath: string, products: ProductRecord[]) {
  const scopedProducts = products.filter((product) => product.name.startsWith(group.prefix));
  const fileCore = filenameCore(filePath);
  const relativePath = path.relative(group.dir, filePath).toLowerCase();

  if (group.key === 'noventra' && /^retatrutide(32|64)$/.test(fileCore)) {
    const strength = fileCore.match(/(32|64)$/)?.[1];
    return scopedProducts.filter((product) =>
      productCore(product.name, group.prefix) === 'retatrutide' &&
      product.dosageInfo?.replace(/\s+/g, '').includes(`${strength}mg`),
    );
  }

  if (group.key === 'noventra' && /^tirzepatide(30|60)$/.test(fileCore)) {
    const strength = fileCore.match(/(30|60)$/)?.[1];
    return scopedProducts.filter((product) =>
      productCore(product.name, group.prefix) === 'tirzepatide' &&
      product.dosageInfo?.replace(/\s+/g, '').includes(`${strength}mg`),
    );
  }

  const aliases = new Map<string, string>();
  if (group.key === 'noventra') aliases.set('tirreta', 'terreta');
  if (group.key === 'nova') {
    aliases.set('methyltest1', 'methyl1test');
    aliases.set('dianabol50', 'dianabol50extrastrength');
    aliases.set('novaslim', 'novaslimappetitesuppressant');
    aliases.set('cialis20', 'cialisonceoff20');
    aliases.set('cialis5', 'cialisdaily5');
  }

  const targetCore = aliases.get(fileCore) ?? fileCore;
  let matches = scopedProducts.filter((product) => productCore(product.name, group.prefix) === targetCore);

  if (group.key === 'nova' && targetCore === 'clenbuterol40') {
    matches = matches.filter((product) => product.dosageInfo?.replace(/\s+/g, '').includes('100Tablets'));
  }

  if (group.key === 'nova' && targetCore === 'shredded20') {
    const category = relativePath.includes('peptide') ? 'PEPTIDES' : 'ORAL ANABOLICS';
    matches = matches.filter((product) => product.categoryName.toUpperCase() === category);
  }

  return matches;
}

async function main() {
  const dryRun = process.argv.includes('--dry-run');
  const connection = await mysql.createConnection(process.env.DATABASE_URL!);
  const db = drizzle(connection, { schema, mode: 'default' });
  const [products, categories] = await Promise.all([
    db.select().from(schema.products),
    db.select().from(schema.categories),
  ]);
  const categoryNames = new Map(categories.map((category) => [category.id, category.name]));
  const productRecords: ProductRecord[] = products.map((product) => ({
    ...product,
    categoryName: categoryNames.get(product.categoryId ?? -1) ?? '',
  }));

  let matchedFiles = 0;
  let unmatchedFiles = 0;
  let ambiguousFiles = 0;
  let linksCreated = 0;
  const report: string[] = [];

  for (const group of groups) {
    const files = filesUnder(group.dir);
    const scopedCount = productRecords.filter((product) => product.name.startsWith(group.prefix)).length;
    console.log(`\n=== ${group.key}: ${files.length} images; ${scopedCount} products scoped to ${group.prefix.trim()} ===`);

    for (const filePath of files) {
      const relativePath = path.relative(group.dir, filePath);
      const matches = findMatches(group, filePath, productRecords);
      if (matches.length === 0) {
        unmatchedFiles++;
        const line = `${group.key} | ${relativePath} | NO MATCH`;
        report.push(line);
        console.log(line);
        continue;
      }

      matchedFiles++;
      if (matches.length > 1) ambiguousFiles++;
      const matchSummary = matches.map((product) => `${product.id}:${product.name}`).join(' || ');
      const line = `${group.key} | ${relativePath} | ${matchSummary}`;
      report.push(line);
      console.log(line);
      if (dryRun) continue;

      const storageKey = `new_brand_images/${group.key}/${safeKey(relativePath.replaceAll(path.sep, '__'))}`;
      const existingByProduct = new Map<number, boolean>();
      for (const product of matches) {
        const existing = await db.select({ id: schema.productImages.id })
          .from(schema.productImages)
          .where(and(
            eq(schema.productImages.productId, product.id),
            or(
              eq(schema.productImages.imageKey, storageKey),
              like(schema.productImages.imageKey, `${storageKey}_%`),
            ),
          ));
        existingByProduct.set(product.id, existing.length > 0);
      }
      const productsNeedingUpload = matches.filter((product) => !existingByProduct.get(product.id));
      if (productsNeedingUpload.length === 0) continue;

      const { url, key } = await storagePut(storageKey, fs.readFileSync(filePath), contentTypeFor(filePath));
      for (const product of productsNeedingUpload) {

        const existingForProduct = await db.select({ id: schema.productImages.id })
          .from(schema.productImages)
          .where(eq(schema.productImages.productId, product.id));
        await db.insert(schema.productImages).values({
          productId: product.id,
          imageUrl: url,
          imageKey: key,
          isPrimary: existingForProduct.length === 0,
        });
        linksCreated++;
      }
    }
  }

  const reportPath = path.join(work, dryRun ? 'new-brand-match-report.dry-run.txt' : 'new-brand-match-report.txt');
  fs.writeFileSync(reportPath, report.join('\n') + '\n');
  console.log(`\nSummary: matched files ${matchedFiles}; unmatched files ${unmatchedFiles}; ambiguous files ${ambiguousFiles}; links created ${linksCreated}; dry-run ${dryRun}`);
  console.log(`Report: ${reportPath}`);
  await connection.end();
  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
