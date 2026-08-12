import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from '../drizzle/schema.ts';
import { eq } from 'drizzle-orm';
import fs from 'node:fs';

function classifyBrand(name: string) {
  const text = name.toLowerCase();
  if (text.startsWith('ol -') || text.includes('ouroboros')) return 'Ouroboros Labs';
  if (text.startsWith('keifei')) return 'Keifei Pharmaceuticals';
  if (text.startsWith('upa -')) return 'UPA Labs';
  if (text.startsWith('gen -')) return 'Genesis';
  if (text.startsWith('bio -')) return 'Biolab';
  if (text.startsWith('mac -')) return 'Mactropin';
  if (text.startsWith('sp -')) return 'SP Laboratories';
  if (text.startsWith('hd -')) return 'HD Labs';
  if (text.startsWith('bp -')) return 'BP Pharma';
  if (text.startsWith('np -')) return 'Noventra Pharm Pens';
  if (text.startsWith('ipharma -')) return 'IPharma';
  if (text.startsWith('pc -')) return 'Pharmacom';
  if (text.startsWith('nova -')) return 'NOVA Labs';
  if (text.startsWith('cooper -')) return 'Cooper Pharmaceuticals';
  return 'Other';
}

async function main() {
  const connection = await mysql.createConnection(process.env.DATABASE_URL!);
  const db = drizzle(connection, { schema, mode: 'default' });
  const products = await db.select({
    id: schema.products.id,
    name: schema.products.name,
    slug: schema.products.slug,
    categoryName: schema.categories.name,
  }).from(schema.products).leftJoin(schema.categories, eq(schema.products.categoryId, schema.categories.id)).where(eq(schema.products.isActive, true));
  const images = await db.select({ productId: schema.productImages.productId, isPrimary: schema.productImages.isPrimary }).from(schema.productImages);
  const imageIds = new Set(images.map((image) => image.productId));
  const primaryIds = new Set(images.filter((image) => image.isPrimary).map((image) => image.productId));
  const missing = products.filter((product) => !imageIds.has(product.id));
  const stats = new Map<string, { total: number; withImage: number; missing: number; primary: number }>();
  for (const product of products) {
    const brand = classifyBrand(product.name);
    const current = stats.get(brand) ?? { total: 0, withImage: 0, missing: 0, primary: 0 };
    current.total++;
    if (imageIds.has(product.id)) current.withImage++;
    else current.missing++;
    if (primaryIds.has(product.id)) current.primary++;
    stats.set(brand, current);
  }

  const lines = [
    '# Gorilla Gear Nutrition Product Image Coverage',
    '',
    `Generated: ${new Date().toISOString()}`,
    '',
    `Active products: ${products.length}`,
    `Products with at least one image: ${products.length - missing.length}`,
    `Products without an image: ${missing.length}`,
    `Products with a primary image: ${primaryIds.size}`,
    '',
    '## Coverage by inferred brand',
    '',
    '| Brand | Products | With Image | Missing | Primary |',
    '|---|---:|---:|---:|---:|',
    ...Array.from(stats.entries()).sort(([a], [b]) => a.localeCompare(b)).map(([brand, value]) => `| ${brand} | ${value.total} | ${value.withImage} | ${value.missing} | ${value.primary} |`),
    '',
    '## Products without an image',
    '',
    '| ID | Brand | Category | Product | Slug |',
    '|---:|---|---|---|---|',
    ...missing.sort((a, b) => a.name.localeCompare(b.name)).map((product) => `| ${product.id} | ${classifyBrand(product.name)} | ${product.categoryName ?? 'Uncategorised'} | ${product.name.replace(/\|/g, '\\|')} | ${product.slug} |`),
    '',
    'This is an audit only. No image or product associations are changed by this script.',
  ];
  const reportPath = '/home/ubuntu/ggn-image-import-20260812/product-image-coverage.md';
  fs.writeFileSync(reportPath, `${lines.join('\n')}\n`);
  console.log(`Report: ${reportPath}`);
  console.log(`Active products: ${products.length}; with image: ${products.length - missing.length}; missing: ${missing.length}; primary: ${primaryIds.size}`);
  await connection.end();
  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
