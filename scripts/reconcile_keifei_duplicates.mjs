import fs from "node:fs/promises";
import mysql from "mysql2/promise";

const outputPath = "/tmp/keifei-duplicate-audit.json";
const connection = await mysql.createConnection(process.env.DATABASE_URL);
const [rows] = await connection.query(`
  SELECT
    p.id,
    p.name,
    p.dosageInfo,
    p.price,
    p.isActive,
    COUNT(DISTINCT ci.id) AS cartReferences,
    COUNT(DISTINCT oi.id) AS orderItemReferences,
    COUNT(DISTINCT pi.id) AS imageCount,
    MAX(CASE WHEN pi.isPrimary = 1 THEN pi.imageUrl END) AS primaryImageUrl
  FROM products p
  JOIN catalogue_product_taxonomy t ON t.productId = p.id
  JOIN catalogue_brands b ON b.id = t.brandId
  LEFT JOIN cart_items ci ON ci.productId = p.id
  LEFT JOIN order_items oi ON oi.productId = p.id
  LEFT JOIN product_images pi ON pi.productId = p.id
  WHERE p.isActive = 1 AND b.name = 'Keifei Pharmaceuticals'
  GROUP BY p.id, p.name, p.dosageInfo, p.price, p.isActive
  ORDER BY p.id
`);
await connection.end();

function normalize(value) {
  return String(value ?? "")
    .toLowerCase()
    .replace(/^keifei\s*[-:]?\s*/i, "")
    .replace(/^pharma\s*[-:]?\s*/i, "")
    .replace(/[^a-z0-9]+/g, "")
    .replace(/anapolan/g, "anapolon")
    .replace(/tamoxofine/g, "tamoxifen")
    .replace(/primobolin/g, "primobolin")
    .replace(/m1tesbol/g, "m1tesbol")
    .replace(/aromasin\(exemestic\)/g, "aromasin")
    .replace(/aromasinexemestic/g, "aromasin")
    .replace(/\d+(?:\.\d+)?(?:mg|mcg|iu|ml)/g, "")
    .replace(/hghfragment/g, "hghfragment")
    .trim();
}

function strengthKey(value) {
  const matches = String(value ?? "").toLowerCase().match(/\d+(?:\.\d+)?\s*(?:mg|mcg|iu|ml)/g) ?? [];
  return matches.map((match) => match.replace(/\s+/g, "")).join("|");
}

const byKey = new Map();
for (const row of rows) {
  const key = `${normalize(row.name)}|${strengthKey(row.dosageInfo)}`;
  if (!byKey.has(key)) byKey.set(key, []);
  byKey.get(key).push({
    id: Number(row.id),
    name: row.name,
    dosageInfo: row.dosageInfo,
    price: row.price,
    cartReferences: Number(row.cartReferences),
    orderItemReferences: Number(row.orderItemReferences),
    imageCount: Number(row.imageCount),
    primaryImageUrl: row.primaryImageUrl,
  });
}

const duplicateGroups = [...byKey.values()].filter((group) => group.length > 1);
const candidates = duplicateGroups.flatMap((group) => {
  const canonical = [...group].sort((a, b) => Number(b.imageCount > 0) - Number(a.imageCount > 0) || a.id - b.id)[0];
  return group.filter((entry) => entry.id !== canonical.id).map((duplicate) => ({
    canonical,
    duplicate,
    safeToArchive: duplicate.cartReferences === 0 && duplicate.orderItemReferences === 0 && canonical.imageCount > 0,
  }));
});

const result = { generatedAt: new Date().toISOString(), activeProductCount: rows.length, duplicateGroups, candidates };
await fs.writeFile(outputPath, JSON.stringify(result, null, 2));
console.log(JSON.stringify({ outputPath, activeProductCount: rows.length, duplicateGroups: duplicateGroups.length, candidates: candidates.length, safeCandidates: candidates.filter((candidate) => candidate.safeToArchive).length }, null, 2));
