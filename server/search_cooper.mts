import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from '../drizzle/schema.ts';
import { like } from 'drizzle-orm';

async function main() {
  const connection = await mysql.createConnection(process.env.DATABASE_URL!);
  const db = drizzle(connection, { schema, mode: 'default' });

  const cooperProducts = await db.select().from(schema.products).where(like(schema.products.name, '%Cooper%'));
  console.log(`Found ${cooperProducts.length} Cooper products in DB.`);
  for (const p of cooperProducts) {
    console.log(`- ID: ${p.id}, Name: ${p.name}`);
  }

  // Let's also check distinct brands in our product names (e.g., prefix before ' - ')
  const allProds = await db.select({ name: schema.products.name }).from(schema.products);
  const brands = new Set();
  for (const pr of allProds) {
    const parts = pr.name.split(' - ');
    if (parts.length > 1) brands.add(parts[0]);
  }
  console.log("Brands found in DB names:", Array.from(brands));

  await connection.end();
}

main().catch(console.error);
