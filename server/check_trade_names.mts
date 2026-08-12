import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from '../drizzle/schema.ts';
import { or, like } from 'drizzle-orm';

async function main() {
  const connection = await mysql.createConnection(process.env.DATABASE_URL!);
  const db = drizzle(connection, { schema, mode: 'default' });

  const products = await db.select().from(schema.products).where(
    or(
      like(schema.products.name, '%Ceebis%'),
      like(schema.products.name, '%Provibolic%'),
      like(schema.products.name, '%Exemestane%'),
      like(schema.products.name, '%Clomifene%'),
      like(schema.products.name, '%Letrozole%'),
      like(schema.products.name, '%Nolvabolic%'),
      like(schema.products.name, '%Ratigra%'),
      like(schema.products.name, '%Caber%'),
      like(schema.products.name, '%PT 141%')
    )
  );

  console.log(`Found ${products.length} products matching trade names:`);
  for (const p of products) {
    console.log(`- ID: ${p.id}, Name: ${p.name}`);
  }

  await connection.end();
}

main().catch(console.error);
