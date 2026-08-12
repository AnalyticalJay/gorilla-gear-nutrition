import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from '../drizzle/schema.ts';
import { like } from 'drizzle-orm';

async function main() {
  const connection = await mysql.createConnection(process.env.DATABASE_URL!);
  const db = drizzle(connection, { schema, mode: 'default' });

  const products = await db.select().from(schema.products).where(like(schema.products.name, 'Cooper - %'));
  console.log(`Total Cooper products: ${products.length}`);
  for (const p of products) {
    console.log(`- ID: ${p.id}, Name: ${p.name}`);
  }

  await connection.end();
}

main().catch(console.error);
