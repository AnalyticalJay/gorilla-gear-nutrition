import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from '../drizzle/schema.ts';
import { and, eq, like } from 'drizzle-orm';

async function main() {
  const connection = await mysql.createConnection(process.env.DATABASE_URL!);
  const db = drizzle(connection, { schema, mode: 'default' });
  const prefixes = ['NP - ', 'Ipharma - ', 'PC - ', 'NOVA - '];
  for (const prefix of prefixes) {
    const rows = await db
      .select({ id: schema.products.id, name: schema.products.name, slug: schema.products.slug, imageUrl: schema.productImages.imageUrl, imageKey: schema.productImages.imageKey })
      .from(schema.products)
      .leftJoin(schema.productImages, and(eq(schema.productImages.productId, schema.products.id), eq(schema.productImages.isPrimary, true)))
      .where(like(schema.products.name, `${prefix}%`));
    const linked = rows.filter((row) => row.imageUrl);
    console.log(`${prefix.trim()} | products=${rows.length} | primary_images=${linked.length}`);
    for (const row of linked.slice(0, 3)) console.log(`  ${row.id} | ${row.name} | ${row.slug} | ${row.imageUrl}`);
  }
  await connection.end();
  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
