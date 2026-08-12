import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from '../drizzle/schema.ts';
import { like } from 'drizzle-orm';

async function main() {
  const connection = await mysql.createConnection(process.env.DATABASE_URL!);
  const db = drizzle(connection, { schema, mode: 'default' });

  const cats = await db.select().from(schema.categories);
  console.log("Categories:", cats.map(c => c.name));

  const allProds = await db.select({ id: schema.products.id, name: schema.products.name, catId: schema.products.categoryId }).from(schema.products);
  for (const p of allProds) {
    if (/Cialis|Aromasin|Clomid|Dostinex|Femara|Nolvadex|Proviron|Ratigra|Viagra/i.test(p.name)) {
      console.log(`- ID: ${p.id}, Name: ${p.name}`);
    }
  }

  await connection.end();
}

main().catch(console.error);
