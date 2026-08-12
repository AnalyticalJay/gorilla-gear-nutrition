import fs from 'node:fs';
import { parse } from 'csv-parse/sync';
import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from '../drizzle/schema.ts';

async function main() {
  const connection = await mysql.createConnection(process.env.DATABASE_URL);
  const db = drizzle(connection, { schema, mode: 'default' });

  const csvPath = '/home/ubuntu/upload/GGN_Regulated_Internal_Inventory_with_Prices.csv';
  const content = fs.readFileSync(csvPath, 'utf-8');
  const records = parse(content, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  });

  console.log(`[CSV Import] Parsed ${records.length} records from CSV.`);

  const validRecords = [];

  for (const row of records) {
    const name = row.name?.trim();
    const priceRaw = row.price?.trim();
    if (!name || !priceRaw) continue;

    const priceClean = priceRaw.replace(/^R\s*/i, '').replace(/,/g, '');
    const priceNum = parseFloat(priceClean);
    if (isNaN(priceNum) || priceNum <= 0) {
      continue;
    }

    const categoryName = (row.category?.trim() || 'General').toLowerCase();
    validRecords.push({
      name,
      categoryName: row.category?.trim() || 'General',
      categorySlug: categoryName.replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
      dosageInfo: row.dosageInfo?.trim() || null,
      description: row.description?.trim() || null,
      price: priceNum.toFixed(2),
      brand: row.brand?.trim() || 'Gorilla Gear',
    });
  }

  console.log(`[CSV Import] Filtered down to ${validRecords.length} valid-priced products.`);

  await db.delete(schema.orderItems);
  await db.delete(schema.cartItems);
  await db.delete(schema.productImages);
  await db.delete(schema.products);
  await db.delete(schema.categories);
  console.log('[CSV Import] Cleared old products and categories.');

  const categoryMap = new Map();
  const uniqueCategories = Array.from(new Set(validRecords.map(r => r.categorySlug)));

  for (const slug of uniqueCategories) {
    const sample = validRecords.find(r => r.categorySlug === slug);
    const catName = sample ? sample.categoryName : slug;
    const [result] = await db.insert(schema.categories).values({
      name: catName,
      slug,
      description: `${catName} category catalogue items`,
      isActive: true,
    });
    categoryMap.set(slug, result.insertId);
  }
  console.log(`[CSV Import] Inserted ${categoryMap.size} categories.`);

  let inserted = 0;
  const batchSize = 100;
  for (let i = 0; i < validRecords.length; i += batchSize) {
    const batch = validRecords.slice(i, i + batchSize);
    const values = batch.map((r, idx) => {
      const slugBase = r.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      const slug = `${slugBase}-${i + idx}-${r.brand.toLowerCase()}`;
      return {
        name: `${r.brand} - ${r.name}`,
        slug,
        description: r.description,
        dosageInfo: r.dosageInfo,
        categoryId: categoryMap.get(r.categorySlug),
        price: r.price,
        stockQuantity: 100,
        isActive: true,
        isFeatured: (i + idx) < 8,
      };
    });

    await db.insert(schema.products).values(values);
    inserted += values.length;
  }

  console.log(`[CSV Import] Successfully imported ${inserted} products into database.`);
  await connection.end();
}

main().catch(err => {
  console.error('[CSV Import] Error:', err);
  process.exit(1);
});
