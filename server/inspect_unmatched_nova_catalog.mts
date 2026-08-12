import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from '../drizzle/schema.ts';

const terms = ['B12', 'Testosterone Suspension', 'Anavar 50', 'Methyl', 'NovaDroxen', 'Hexarelin', 'MOTS'];

async function main() {
  const connection = await mysql.createConnection(process.env.DATABASE_URL!);
  const db = drizzle(connection, { schema, mode: 'default' });
  const products = await db.select().from(schema.products);
  for (const term of terms) {
    const rows = products.filter((product) => product.name.toLowerCase().includes(term.toLowerCase()));
    console.log(`\\n=== ${term} (${rows.length}) ===`);
    for (const product of rows) console.log(`${product.id} | ${product.name} | ${product.dosageInfo ?? ''}`);
  }
  await connection.end();
  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
