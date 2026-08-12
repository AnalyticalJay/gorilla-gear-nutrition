import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();

const IMAGE_URL = "https://d2xsxph8kpxj0f.cloudfront.net/310519663346956907/FvmUKtCArzHrDxzDLkoErh/test-e-250-hd-labs-JDc9kQ4nct7m2hRPhJNoQJ.webp";

async function seed() {
  const conn = await mysql.createConnection(process.env.DATABASE_URL);
  const db = drizzle(conn);

  // 1. Ensure "Injectables" category exists
  const [catRows] = await conn.execute(
    "SELECT id FROM categories WHERE slug = 'injectables' LIMIT 1"
  );
  let categoryId;
  if (catRows.length === 0) {
    const [result] = await conn.execute(
      "INSERT INTO categories (name, slug, description, isActive) VALUES (?, ?, ?, ?)",
      ["Injectables", "injectables", "Injectable anabolic compounds by HD Labs", 1]
    );
    categoryId = result.insertId;
    console.log("Created category: Injectables (id=" + categoryId + ")");
  } else {
    categoryId = catRows[0].id;
    console.log("Found existing category: Injectables (id=" + categoryId + ")");
  }

  // 2. Check if product already exists
  const [existingRows] = await conn.execute(
    "SELECT id FROM products WHERE slug = 'testosterone-enanthate-250mg-hd-labs' LIMIT 1"
  );
  let productId;
  if (existingRows.length > 0) {
    productId = existingRows[0].id;
    console.log("Product already exists (id=" + productId + "), updating...");
    await conn.execute(
      `UPDATE products SET
        name = ?, description = ?, dosageInfo = ?, price = ?,
        stockQuantity = ?, categoryId = ?, isActive = ?, isFeatured = ?
       WHERE id = ?`,
      [
        "Testosterone Enanthate 250mg — HD Labs",
        "HD Labs Testosterone Enanthate 250mg/ml is a long-acting testosterone ester, one of the most widely used anabolic steroids for bulking and strength cycles. Each 10ml vial contains 250mg/ml of Testosterone Enanthate in a sterile oil-based solution. Ideal for both beginner and advanced users seeking sustained testosterone release over 7–10 days per injection.",
        "Recommended dosage: 250–500mg per week, administered via intramuscular injection. Beginners typically start at 250mg/week (single injection or split into two). Advanced users may run 500–750mg/week. Cycle length: 10–16 weeks. Always use with appropriate PCT (Post Cycle Therapy) after cycle completion.",
        "450.00",
        100,
        categoryId,
        1,
        1,
        productId
      ]
    );
  } else {
    const [result] = await conn.execute(
      `INSERT INTO products
        (name, slug, description, dosageInfo, price, stockQuantity, categoryId, isActive, isFeatured)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        "Testosterone Enanthate 250mg — HD Labs",
        "testosterone-enanthate-250mg-hd-labs",
        "HD Labs Testosterone Enanthate 250mg/ml is a long-acting testosterone ester, one of the most widely used anabolic steroids for bulking and strength cycles. Each 10ml vial contains 250mg/ml of Testosterone Enanthate in a sterile oil-based solution. Ideal for both beginner and advanced users seeking sustained testosterone release over 7–10 days per injection.",
        "Recommended dosage: 250–500mg per week, administered via intramuscular injection. Beginners typically start at 250mg/week (single injection or split into two). Advanced users may run 500–750mg/week. Cycle length: 10–16 weeks. Always use with appropriate PCT (Post Cycle Therapy) after cycle completion.",
        "450.00",
        100,
        categoryId,
        1,
        1
      ]
    );
    productId = result.insertId;
    console.log("Created product: Testosterone Enanthate 250mg (id=" + productId + ")");
  }

  // 3. Remove old images for this product and insert the new one as primary
  await conn.execute("DELETE FROM product_images WHERE productId = ?", [productId]);
  await conn.execute(
    `INSERT INTO product_images (productId, imageUrl, imageKey, isPrimary)
     VALUES (?, ?, ?, ?)`,
    [productId, IMAGE_URL, "test-e-250-hd-labs-JDc9kQ4nct7m2hRPhJNoQJ.webp", 1]
  );
  console.log("Attached product image.");

  await conn.end();
  console.log("Done! Product seeded successfully.");
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
