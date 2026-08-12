import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from '../drizzle/schema.ts';

async function main() {
  const connection = await mysql.createConnection(process.env.DATABASE_URL!);
  const db = drizzle(connection, { schema, mode: 'default' });
  const products = await db.select().from(schema.products);
  const categories = await db.select().from(schema.categories);
  const ids = [2051, 2052, 2085, 2137];
  for (const product of products.filter((row) => ids.includes(row.id))) {
    const category = categories.find((row) => row.id === product.categoryId);
    console.log(JSON.stringify({ id: product.id, name: product.name, categoryId: product.categoryId, category: category?.name, description: product.description, dosageInfo: product.dosageInfo, price: product.price, stockQuantity: product.stockQuantity }));
  }
  await connection.end();
  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
