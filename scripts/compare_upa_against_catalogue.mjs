import mysql from "mysql2/promise";
import fs from "node:fs/promises";

const summary = JSON.parse(await fs.readFile("/tmp/upa-import/upa-workbook-summary.json", "utf8"));
const connection = await mysql.createConnection(process.env.DATABASE_URL);
const [rows] = await connection.query(`
  SELECT p.id, p.name, p.description, p.dosageInfo, p.categoryId, p.price, p.isActive,
    c.name AS category,
    COUNT(pi.id) AS image_count,
    MAX(CASE WHEN pi.isPrimary = 1 THEN pi.imageUrl ELSE NULL END) AS primary_image
  FROM products p
  LEFT JOIN categories c ON c.id = p.categoryId
  LEFT JOIN product_images pi ON pi.productId = p.id
  GROUP BY p.id, p.name, p.description, p.dosageInfo, p.categoryId, p.price, p.isActive, c.name
  ORDER BY p.id
`);

function normalize(value) {
  return String(value ?? "")
    .toLowerCase()
    .replace(/^upa\s*[-:]\s*/i, "")
    .replace(/[^a-z0-9]+/g, "")
    .trim();
}
function normalizeField(value) {
  return String(value ?? "").toLowerCase().replace(/[^a-z0-9]+/g, "");
}
function categoryKey(value) {
  const key = normalizeField(value);
  return key === "sarms" ? "sarms" : key === "oralsteroids" ? "orals" : key;
}

const candidates = summary.rows.map((row) => {
  const desiredName = `UPA - ${row.name}`;
  const desiredBase = normalize(desiredName);
  const desiredCategory = categoryKey(row.category);
  const desiredPrice = row.price ? Number(row.price) : null;
  const sameName = rows.filter((candidate) => normalize(candidate.name) === desiredBase);
  const sameIdentity = rows.filter((candidate) =>
    normalize(candidate.name) === desiredBase
    || (
      categoryKey(candidate.category) === desiredCategory
      && normalizeField(candidate.description) === normalizeField(row.description)
      && normalizeField(candidate.dosageInfo) === normalizeField(row.dosageInfo)
      && desiredPrice !== null
      && Number(candidate.price) === desiredPrice
    )
  );
  return {
    row_number: row.row_number,
    desired_name: desiredName,
    category: row.category,
    dosageInfo: row.dosageInfo,
    description: row.description,
    price: row.price,
    same_name_candidates: sameName.map((candidate) => ({ id: candidate.id, name: candidate.name, category: candidate.category, price: String(candidate.price), image_count: Number(candidate.image_count ?? 0), isActive: Boolean(candidate.isActive) })),
    same_identity_candidates: sameIdentity.map((candidate) => ({ id: candidate.id, name: candidate.name, category: candidate.category, price: String(candidate.price), description: candidate.description, dosageInfo: candidate.dosageInfo, image_count: Number(candidate.image_count ?? 0), isActive: Boolean(candidate.isActive) })),
  };
});

const output = {
  workbook_rows: summary.rows.length,
  priced_rows: summary.rows.filter((row) => row.price).length,
  all_product_count: rows.length,
  upa_product_count: rows.filter((row) => normalize(row.name).startsWith("upa")).length,
  rows: candidates,
};
await fs.writeFile("/tmp/upa-import/upa-catalogue-comparison.json", JSON.stringify(output, null, 2));
console.log(JSON.stringify({
  workbook_rows: output.workbook_rows,
  priced_rows: output.priced_rows,
  all_product_count: output.all_product_count,
  same_name_rows: candidates.filter((row) => row.same_name_candidates.length > 0 && row.price).length,
  same_identity_rows: candidates.filter((row) => row.same_identity_candidates.length > 0 && row.price).length,
  rows_with_identity_candidates: candidates.filter((row) => row.same_identity_candidates.length > 0 && row.price).map((row) => ({ row_number: row.row_number, desired_name: row.desired_name, candidates: row.same_identity_candidates })),
}, null, 2));
await connection.end().catch(() => {});
process.exit(0);
