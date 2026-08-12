import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from '../drizzle/schema.ts';
import { eq, and } from 'drizzle-orm';
import fs from 'node:fs';
import path from 'node:path';
import { storagePut } from './storage.js';

async function main() {
  const connection = await mysql.createConnection(process.env.DATABASE_URL!);
  const db = drizzle(connection, { schema, mode: 'default' });

  const allProducts = await db.select().from(schema.products);
  const sexAidDir = '/home/ubuntu/gorilla-gear-nutrition/extracted_cooper_images/Sex  Aid';

  if (!fs.existsSync(sexAidDir)) {
    console.log("Sex Aid directory not found");
    await connection.end();
    return;
  }

  const files = fs.readdirSync(sexAidDir).filter(f => /\.(png|jpg|jpeg|webp|jfif)$/i.test(f));
  console.log(`Found ${files.length} Sex Aid images.`);

  for (const filename of files) {
    const imgPath = path.join(sexAidDir, filename);
    const baseName = path.basename(filename, path.extname(filename)).trim();
    // e.g. "Cialis - Ceebis" -> keyword "Cialis" or "Ceebis"
    const keyword = baseName.split(/[\-\–]/)[0].trim().toLowerCase();

    const matched = allProducts.filter(p => p.name.toLowerCase().includes(keyword));
    console.log(`[SEXAID] "${filename}" (keyword: "${keyword}") -> matched ${matched.length} products`);

    if (matched.length > 0) {
      try {
        const fileBuffer = fs.readFileSync(imgPath);
        let contentType = 'image/jpeg';
        if (filename.toLowerCase().endsWith('.png')) contentType = 'image/png';
        else if (filename.toLowerCase().endsWith('.webp')) contentType = 'image/webp';
        else if (filename.toLowerCase().endsWith('.jfif')) contentType = 'image/jpeg';

        const asciiFilename = filename.replace(/[^\x00-\x7F]/g, '_').replace(/[\s–—]+/g, '_');
        const storageKey = `cooper_images/${asciiFilename}`;
        const { url } = await storagePut(storageKey, fileBuffer, contentType);

        for (const prod of matched) {
          const existing = await db.select().from(schema.productImages).where(and(
            eq(schema.productImages.productId, prod.id),
            eq(schema.productImages.imageUrl, url)
          ));

          if (existing.length === 0) {
            await db.insert(schema.productImages).values({
              productId: prod.id,
              imageUrl: url,
              isPrimary: true,
            });
            console.log(`  [LINKED TO ID ${prod.id}: ${prod.name}]`);
          }
        }
      } catch (err) {
        console.error(`  [ERROR] Failed for ${filename}:`, err);
      }
    }
  }

  await connection.end();
}

main().catch(console.error);
