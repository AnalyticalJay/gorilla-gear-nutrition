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
  console.log(`Total products in DB: ${allProducts.length}`);

  const extractDir = '/home/ubuntu/gorilla-gear-nutrition/extracted_cooper_images';
  
  function getImages(dir: string, fileList: string[] = []) {
    if (!fs.existsSync(dir)) return fileList;
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        getImages(fullPath, fileList);
      } else if (/\.(png|jpg|jpeg|webp|jfif)$/i.test(file)) {
        fileList.push(fullPath);
      }
    }
    return fileList;
  }

  const imageFiles = getImages(extractDir);
  console.log(`Found ${imageFiles.length} extracted image files.`);

  let matchedCount = 0;
  let uploadedCount = 0;

  for (const imgPath of imageFiles) {
    const filename = path.basename(imgPath);
    const baseName = path.basename(filename, path.extname(filename)).trim();
    
    const cleanBase = baseName.replace(/[\s\-\(\)\.\–\—\‘\'\,]+/g, '').toLowerCase();

    // Find all matching products
    const matchedProducts = allProducts.filter(prod => {
      const prodNameClean = prod.name.replace(/[\s\-\(\)\.\–\—\‘\'\,]+/g, '').toLowerCase();
      return prodNameClean.includes(cleanBase) || cleanBase.includes(prodNameClean);
    });

    if (matchedProducts.length > 0) {
      matchedCount++;
      console.log(`[MATCH] "${filename}" -> Matched ${matchedProducts.length} products (e.g. "${matchedProducts[0].name}")`);

      try {
        const fileBuffer = fs.readFileSync(imgPath);
        let contentType = 'image/jpeg';
        if (filename.toLowerCase().endsWith('.png')) contentType = 'image/png';
        else if (filename.toLowerCase().endsWith('.webp')) contentType = 'image/webp';
        else if (filename.toLowerCase().endsWith('.jfif')) contentType = 'image/jpeg';

        const asciiFilename = filename.replace(/[^\x00-\x7F]/g, '_').replace(/[\s–—]+/g, '_');
        const storageKey = `cooper_images/${asciiFilename}`;
        const { url } = await storagePut(storageKey, fileBuffer, contentType);

        // Link to all matched products (or top 5 if too many)
        for (const prod of matchedProducts.slice(0, 5)) {
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
            uploadedCount++;
            console.log(`  [LINKED TO ID ${prod.id}: ${prod.name}]`);
          }
        }
      } catch (err) {
        console.error(`  [ERROR] Failed to upload/link ${filename}:`, err);
      }
    } else {
      console.log(`[NO MATCH] Could not find product for image: "${filename}"`);
    }
  }

  console.log(`Finished! Matched: ${matchedCount}/${imageFiles.length}, Total Links Created: ${uploadedCount}`);
  await connection.end();
}

main().catch(console.error);
