import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from '../drizzle/schema.ts';
import { like } from 'drizzle-orm';

async function main() {
  const connection = await mysql.createConnection(process.env.DATABASE_URL!);
  const db = drizzle(connection, { schema, mode: 'default' });
  const rows = await db.select().from(schema.productImages).where(like(schema.productImages.imageKey, 'new_brand_images/%'));
  const byProduct = new Map<number, typeof rows>();
  for (const row of rows) byProduct.set(row.productId, [...(byProduct.get(row.productId) ?? []), row]);
  const duplicates = Array.from(byProduct.entries()).filter(([, items]) => items.length > 1);
  console.log(`new_brand_rows=${rows.length} products_with_multiple_rows=${duplicates.length}`);
  for (const [productId, items] of duplicates.slice(0, 12)) {
    console.log(`PRODUCT ${productId}`);
    for (const item of items) console.log(`  ${item.id} | primary=${item.isPrimary} | ${item.imageKey}`);
  }
  const clen = rows.filter((row) => row.productId === 2052 && row.imageKey?.includes('Clenbuterol_40'));
  console.log(`wrong_clenbuterol_rows_for_2052=${clen.length}`);
  for (const row of clen) console.log(`  ${row.id} | ${row.imageKey}`);
  await connection.end();
  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
