import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from '../drizzle/schema.ts';

async function main() {
  const connection = await mysql.createConnection(process.env.DATABASE_URL!);
  const db = drizzle(connection, { schema, mode: 'default' });
  const products = await db.select().from(schema.products);
  const terms = ['pharma', 'pharmacom', 'noventra', 'noventra pharm', 'iph​​arma', 'iph​​', 'i pharma', 'cooper', ' PC ', ' PC-', 'PC -', 'NOVA -'];
  for (const term of terms) {
    const rows = products.filter((p) => p.name.toLowerCase().includes(term.toLowerCase()));
    console.log(`\\n=== ${JSON.stringify(term)} (${rows.length}) ===`);
    for (const p of rows.slice(0, 120)) console.log(`${p.id} | ${p.name}`);
  }
  await connection.end();
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
