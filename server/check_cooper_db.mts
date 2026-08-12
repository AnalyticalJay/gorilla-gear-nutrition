import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from '../drizzle/schema.ts';

async function main() {
  const connection = await mysql.createConnection(process.env.DATABASE_URL!);
  const db = drizzle(connection, { schema, mode: 'default' });

  const allProducts = await db.select().from(schema.products);
  console.log(`Total products in DB: ${allProducts.length}`);

  const sample = allProducts.slice(0, 15);
  for (const s of sample) {
    console.log(`- ${s.name} (ID: ${s.id}, Slug: ${s.slug})`);
  }

  await connection.end();
}

main().catch(console.error);
