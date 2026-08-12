import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from '../drizzle/schema.ts';

async function main() {
  const connection = await mysql.createConnection(process.env.DATABASE_URL!);
  const db = drizzle(connection, { schema, mode: 'default' });
  const products = await db.select().from(schema.products);
  for (const p of products.filter((row) => row.name.startsWith('NP - Retatrutide') || row.name.startsWith('NP - Tirzepatide'))) {
    console.log(JSON.stringify({ id: p.id, name: p.name, description: p.description, dosageInfo: p.dosageInfo, price: p.price, stockQuantity: p.stockQuantity }));
  }
  await connection.end();
  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
