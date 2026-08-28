import fs from 'fs';
import mysql from 'mysql2/promise';

async function run() {
  const connection = await mysql.createConnection(process.env.DATABASE_URL);
  
  console.log("Clearing existing products and categories...");
  await connection.execute("DELETE FROM products");
  await connection.execute("DELETE FROM categories");

  const text = fs.readFileSync('/home/ubuntu/gorilla-gear-nutrition/server/extracted_pdf.txt', 'utf8');
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);

  let currentBrand = "Ouroboros Labs";
  let currentCategory = "Peptides";

  const categoriesCache = {};

  async function getOrCreateCategory(catName) {
    if (categoriesCache[catName]) return categoriesCache[catName];
    const slug = catName.toLowerCase().replace(/\s+/g, '-');
    const [rows] = await connection.execute("SELECT id FROM categories WHERE slug = ?", [slug]);
    if (rows.length > 0) {
      categoriesCache[catName] = rows[0].id;
      return rows[0].id;
    }
    const [result] = await connection.execute(
      "INSERT INTO categories (name, slug, description, isActive) VALUES (?, ?, ?, 1)",
      [catName, slug, `Gorilla Gear Nutrition ${catName} category`]
    );
    categoriesCache[catName] = result.insertId;
    return result.insertId;
  }

  let insertedCount = 0;

  const tokens = [" 1 Vial", " 10ml Vial", " 50 Tabs", " 100 Tabs", " 30 Tabs", " 28 Tabs", " 3 vials", " 10 vials", " 30ml", " 1.3ml", " 1.1ml"];

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

      const strengthMatch = cleanRest.match(/(\d+(?:\.\d+)?\s*(?:mg|ml|iu|mcg|Tabs|Vial|Pen|Caps|g|ml\/1ml))/i);
      const strength = strengthMatch ? strengthMatch[1] : 'Standard';

      let name = cleanRest;
      for (let t = 0; t < tokens.length; t++) {
        const token = tokens[t];
        if (cleanRest.includes(token)) {
          name = cleanRest.split(token)[0].trim();
          break;
        }
      }
      if (strengthMatch) {
        const idx = cleanRest.indexOf(strengthMatch[1]);
        if (idx > 3) {
          name = cleanRest.substring(0, idx).trim();
        }
      }

      if (!name || name.length < 2) {
        name = cleanRest.split(' ')[0];
      }

      const displayName = `${currentBrand} - ${name} (${strength})`;
      const slug = displayName.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + (insertedCount + 1);
      const catId = await getOrCreateCategory(currentCategory);

      await connection.execute(`
        INSERT INTO products (name, slug, description, dosageInfo, categoryId, price, stockQuantity, isActive, isFeatured, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?, NOW(), NOW())
      `, [
        displayName,
        slug,
        cleanRest,
        strength,
        catId,
        price.toString(),
        price > 0 && !line.toUpperCase().includes('OUT OF STOCK') && !line.toUpperCase().includes('NO STOCK') ? 100 : 0,
        insertedCount < 6 ? 1 : 0
      ]);

      insertedCount++;
    }
  }

  console.log(`Successfully reloaded ${insertedCount} products with correct names, descriptions, strengths, and prices!`);
  await connection.end();
}

run().catch(console.error);
