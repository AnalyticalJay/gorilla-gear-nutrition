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
      like(schema.products.name, '%Ceebis%'),
      like(schema.products.name, '%Aromasin%'),
      like(schema.products.name, '%Exemestane%'),
      like(schema.products.name, '%Clomid%'),
      like(schema.products.name, '%Clomifene%'),
      like(schema.products.name, '%Dostinex%'),
      like(schema.products.name, '%Caber%'),
      like(schema.products.name, '%Femara%'),
      like(schema.products.name, '%Letrozol%'),
      like(schema.products.name, '%Nolvadex%'),
      like(schema.products.name, '%Nolvabolic%'),
      like(schema.products.name, '%Proviron%'),
      like(schema.products.name, '%Provibolic%'),
      like(schema.products.name, '%Ratigra%'),
      like(schema.products.name, '%Viagra%'),
      like(schema.products.name, '%PT 141%'),
      like(schema.products.name, '%PT141%')
    )
  );

  console.log(`Found ${products.length} matching products for Sex Aid images:`);
  for (const p of products) {
    console.log(`- ID: ${p.id}, Name: ${p.name}`);
  }

  await connection.end();
}

main().catch(console.error);
