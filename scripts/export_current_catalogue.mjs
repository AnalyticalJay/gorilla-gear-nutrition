import fs from "node:fs/promises";
import mysql from "mysql2/promise";

const outputPath = "/home/ubuntu/gorilla-gear-nutrition/products-current-populated-dual-taxonomy.csv";
const headers = [
  "name",
  "category",
  "dosageInfo",
  "description",
  "brand",
  "price",
  "subcategory",
  "shopCollection",
];

function escapeCsv(value) {
  const text = value == null ? "" : String(value);
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function formatPrice(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number.toFixed(2) : "0.00";
}

const connection = await mysql.createConnection(process.env.DATABASE_URL);
try {
  const [rows] = await connection.query(`
    SELECT
      p.id,
      p.name,
      p.dosageInfo,
      p.description,
      p.price,
      c.name AS categoryName,
      b.name AS brandName,
      sc.name AS shopCollectionName,
      sc.slug AS shopCollectionSlug,
      sub.name AS subcategoryName
    FROM products p
    LEFT JOIN categories c ON c.id = p.categoryId
    LEFT JOIN catalogue_product_taxonomy pt ON pt.productId = p.id
    LEFT JOIN catalogue_brands b ON b.id = pt.brandId
    LEFT JOIN catalogue_subcategories sub ON sub.id = pt.subcategoryId
    LEFT JOIN catalogue_shop_collections sc ON sc.id = pt.shopCollectionId
    WHERE p.isActive = 1
    ORDER BY p.id ASC
  `);

  const csvRows = rows.map((product) => [
    product.name,
    product.categoryName,
    product.dosageInfo,
    product.description,
    product.brandName,
    formatPrice(product.price),
    product.subcategoryName,
    product.shopCollectionSlug ?? product.shopCollectionName,
  ].map(escapeCsv).join(","));

  await fs.writeFile(outputPath, `${headers.join(",")}\r\n${csvRows.join("\r\n")}\r\n`, "utf8");

  const summary = {
    outputPath,
    activeProductRows: rows.length,
    rowsMissingName: rows.filter((row) => !String(row.name ?? "").trim()).length,
    rowsMissingCategory: rows.filter((row) => !String(row.categoryName ?? "").trim()).length,
    rowsMissingBrand: rows.filter((row) => !String(row.brandName ?? "").trim()).length,
    rowsMissingPrice: rows.filter((row) => row.price == null || row.price === "").length,
    duplicateIdentityKeys: new Set(rows.map((row) => [row.brandName, row.name, row.dosageInfo, row.categoryName].map((value) => String(value ?? "").trim().toLowerCase()).join("|"))).size,
    categories: Object.fromEntries([...new Set(rows.map((row) => row.categoryName).filter(Boolean))].map((category) => [category, rows.filter((row) => row.categoryName === category).length])),
  };
  summary.duplicateIdentityRows = rows.length - summary.duplicateIdentityKeys;
  console.log(JSON.stringify(summary, null, 2));
} finally {
  await connection.end();
}
