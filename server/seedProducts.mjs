import fs from 'fs';
import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from '../drizzle/schema.ts';

async function seed() {
  const connection = await mysql.createConnection(process.env.DATABASE_URL);
  const db = drizzle(connection, { schema, mode: 'default' });

  console.log("Connected to database for product seeding...");

  const rawText = fs.readFileSync('/home/ubuntu/gorilla-gear-nutrition/server/extracted_pdf.txt', 'utf8');
  const lines = rawText.split('\n').map(l => l.trim()).filter(Boolean);

  let currentBrand = "Ouroboros Labs";
  let currentCategory = "Peptides";

  let insertedCount = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const upper = line.toUpperCase();
    if (upper.includes("OUROBOROS LABS")) { currentBrand = "Ouroboros Labs"; continue; }
    if (upper.includes("KEIFEI")) { currentBrand = "Keifei Pharmaceuticals"; continue; }
    if (upper.includes("UPA LABS")) { currentBrand = "UPA Labs"; continue; }
    if (upper.includes("GENESIS") || upper.includes("BIOLAB")) { currentBrand = null; continue; }
    if (upper.includes("MACTROPIN")) { currentBrand = "Mactropin"; continue; }
    if (upper.includes("SP LABORATORIES")) { currentBrand = "SP Laboratories"; continue; }

    if (["PEPTIDES", "INJECTABLE OILS", "ORALS", "SARMS", "HYBRID INJECTABLES", "GROWTH HORMONE"].includes(upper)) {
      currentCategory = line.charAt(0) + line.slice(1).toLowerCase();
      continue;
    }

    if (upper.includes("PRODUCT") && upper.includes("PRICE")) continue;

    const match = line.match(/(R\s*[\d,]+|NA)$/);
    if (match) {
      if (!currentBrand) continue;
      const priceStr = match[1].replace(/\s+/g, '');
      const price = priceStr === 'NA' ? 0 : parseInt(priceStr.replace('R', '').replace(/,/g, ''), 10);
      const rest = line.substring(0, line.length - match[0].length).trim();
      const cleanRest = rest.replace(/^(OL|Keifei|UPA|Mac|SP)\s+/i, '');

      if (!cleanRest || cleanRest.length < 2) continue;

      const strengthMatch = cleanRest.match(/(\d+(?:\.\d+)?\s*(?:mg|ml|iu|mcg|Tabs|Vial|Pen|Caps|g))/i);
      const strength = strengthMatch ? strengthMatch[1] : 'Standard';

      const name = cleanRest.split('  ')[0].substring(0, 200);
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Math.random().toString(36).substring(2, 7);

      try {
        // Check if products table has brand/strength columns or if we store them in description/dosageInfo
        // Let's insert into schema.products with name, slug, description, dosageInfo, price, stockQuantity
        await db.insert(schema.products).values({
          name: `${currentBrand} - ${name}`,
          slug: slug,
          description: `${cleanRest} [Brand: ${currentBrand}] [Category: ${currentCategory}]`,
          dosageInfo: strength,
          price: price.toString(),
          stockQuantity: price > 0 && !line.toUpperCase().includes('OUT OF STOCK') && !line.toUpperCase().includes('NO STOCK') ? 100 : 0,
          isActive: true,
          isFeatured: insertedCount < 6
        });
        insertedCount++;
      } catch (err) {
        console.error("Error inserting product:", name, err.message);
      }
    }
  }

  console.log(`Successfully seeded ${insertedCount} products into database!`);
  await connection.end();
}

seed().catch(console.error);
