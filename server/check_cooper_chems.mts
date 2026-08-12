import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from '../drizzle/schema.ts';
import { or, like } from 'drizzle-orm';

async function main() {
  const connection = await mysql.createConnection(process.env.DATABASE_URL!);
  const db = drizzle(connection, { schema, mode: 'default' });

  const products = await db.select().from(schema.products).where(
    or(
      like(schema.products.name, '%Cooper%Ceebis%'),
      like(schema.products.name, '%Cooper%Exemestane%'),
      like(schema.products.name, '%Cooper%Clomifene%'),
      like(schema.products.name, '%Cooper%Caber%'),
      like(schema.products.name, '%Cooper%Letrozole%'),
      like(schema.products.name, '%Cooper%Nolvabolic%'),
      like(schema.products.name, '%Cooper%Provibolic%'),
      like(schema.products.name, '%Cooper%Ratigra%')
    )
  );

  console.log(`Found ${products.length} matching Cooper chem products:`);
  for (const p of products) {
    console.log(`- ID: ${p.id}, Name: ${p.name}`);
  }

  await connection.end();
}

main().catch(console.error);
