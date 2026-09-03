import fs from "node:fs/promises";
import mysql from "mysql2/promise";

const outputPath = "/tmp/hd-labs-catalogue-audit.json";
const connection = await mysql.createConnection(process.env.DATABASE_URL);
const [rows] = await connection.query(`
  SELECT
    p.id,
    p.name,
    p.slug,
    p.description,
    p.dosageInfo,
    p.price,
    c.name AS familyCategory,
    sc.name AS subcategory,
    b.name AS brandName,
    pi.id AS imageId,
    pi.imageUrl,
    pi.isPrimary
  FROM products p
  JOIN catalogue_product_taxonomy t ON t.productId = p.id
  JOIN catalogue_brands b ON b.id = t.brandId
  LEFT JOIN categories c ON c.id = p.categoryId
  LEFT JOIN catalogue_subcategories sc ON sc.id = t.subcategoryId
  LEFT JOIN product_images pi ON pi.productId = p.id
  WHERE p.isActive = 1 AND b.name = 'HD Labs'
  ORDER BY p.id, pi.isPrimary DESC, pi.id
`);
await connection.end();

const products = new Map();
for (const row of rows) {
  const key = String(row.id);
  if (!products.has(key)) {
    products.set(key, {
      id: Number(row.id),
      name: row.name,
      slug: row.slug,
      description: row.description,
      dosageInfo: row.dosageInfo,
      price: row.price,
      familyCategory: row.familyCategory,
      subcategory: row.subcategory,
      brandName: row.brandName,
      images: [],
    });
  }
  if (row.imageId !== null) {
    products.get(key).images.push({
      id: Number(row.imageId),
      imageUrl: row.imageUrl,
      isPrimary: Boolean(row.isPrimary),
    });
  }
}

const result = { generatedAt: new Date().toISOString(), productCount: products.size, products: [...products.values()] };
await fs.writeFile(outputPath, JSON.stringify(result, null, 2));
console.log(JSON.stringify({
  outputPath,
  productCount: result.productCount,
  productsWithImages: result.products.filter((product) => product.images.some((image) => image.isPrimary)).length,
  productsWithoutPrimary: result.products.filter((product) => !product.images.some((image) => image.isPrimary)).length,
  cooperFolderLinks: result.products.filter((product) => product.images.some((image) => image.isPrimary && image.imageUrl.includes("cooper_images"))).length,
}, null, 2));
