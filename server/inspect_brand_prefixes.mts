import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from '../drizzle/schema.ts';

async function main() {
  const connection = await mysql.createConnection(process.env.DATABASE_URL!);
  const db = drizzle(connection, { schema, mode: 'default' });
  const products = await db.select().from(schema.products);
  const prefixes = ['NP -', 'BP -', 'P -', 'HU -', 'Ipharma -', 'PC -'];
  for (const prefix of prefixes) {
    const rows = products.filter((p) => p.name.toLowerCase().startsWith(prefix.toLowerCase()));
    console.log(`\\n=== ${prefix} (${rows.length}) ===`);
    for (const p of rows) console.log(`${p.id} | ${p.name}`);
  }
  await connection.end();
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
