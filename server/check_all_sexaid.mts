import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from '../drizzle/schema.ts';
import { or, like } from 'drizzle-orm';

async function main() {
  const connection = await mysql.createConnection(process.env.DATABASE_URL!);
  const db = drizzle(connection, { schema, mode: 'default' });

  const products = await db.select().from(schema.products).where(
    or(
      like(schema.products.name, '%Cialis%'),
      like(schema.products.name, '%Aromasin%'),
      like(schema.products.name, '%Clomid%'),
      like(schema.products.name, '%Dostinex%'),
      like(schema.products.name, '%Femara%'),
      like(schema.products.name, '%Nolvadex%'),
      like(schema.products.name, '%Proviron%'),
      like(schema.products.name, '%Ratigra%'),
      like(schema.products.name, '%Viagra%')
    )
  );
  console.log(`Found ${products.length} Sex Aid matching products:`);
  for (const p of products) {
    console.log(`- ID: ${p.id}, Name: ${p.name}`);
  }

  await connection.end();
}

main().catch(console.error);
