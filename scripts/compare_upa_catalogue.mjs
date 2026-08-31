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
  WHERE LOWER(p.name) LIKE 'upa -%' OR LOWER(p.name) LIKE '%upa labs%'
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

function normalizeCategory(value) {
  const key = String(value ?? "").toLowerCase().replace(/[^a-z]+/g, "");
  return key === "sarms" ? "sarms" : key === "oralsteroids" ? "orals" : key;
}

function levenshtein(a, b) {
  const previous = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i += 1) {
    let diagonal = previous[0];
    previous[0] = i;
    for (let j = 1; j <= b.length; j += 1) {
      const saved = previous[j];
      previous[j] = Math.min(
        previous[j] + 1,
        previous[j - 1] + 1,
        diagonal + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
      diagonal = saved;
    }
  }
  return previous[b.length];
}

const existing = rows.map((row) => ({
  ...row,
  category: String(row.category ?? ""),
  image_count: Number(row.image_count ?? 0),
  normalizedName: normalize(row.name),
  normalizedCategory: normalizeCategory(row.category),
}));

const comparisons = summary.rows.map((row) => {
  const importedName = `UPA - ${row.name}`;
  const normalizedName = normalize(importedName);
  const normalizedCategory = normalizeCategory(row.category);
  const exact = existing.filter((candidate) => candidate.normalizedName === normalizedName);
  const sameCategory = existing.filter((candidate) => candidate.normalizedCategory === normalizedCategory);
  const fuzzy = sameCategory
    .map((candidate) => ({
      id: candidate.id,
      name: candidate.name,
      distance: levenshtein(normalizedName, candidate.normalizedName),
      price: String(candidate.price),
      category: candidate.category,
      image_count: candidate.image_count,
    }))
    .filter((candidate) => candidate.distance <= 3)
    .sort((a, b) => a.distance - b.distance);
  return {
    row_number: row.row_number,
    imported_name: importedName,
    category: row.category,
    dosageInfo: row.dosageInfo,
    description: row.description,
    price: row.price,
    exact_matches: exact.map((candidate) => ({ id: candidate.id, name: candidate.name, price: String(candidate.price), image_count: candidate.image_count, category: candidate.category })),
    fuzzy_candidates: fuzzy.slice(0, 3),
  };
});

const output = {
  workbook: {
    row_count: summary.row_count,
    priced_row_count: summary.rows.filter((row) => row.price).length,
    missing_price_rows: summary.missing_price_rows,
  },
  existing_upa_count: existing.length,
  existing_with_images: existing.filter((row) => row.image_count > 0).length,
  comparisons,
};
await fs.writeFile("/tmp/upa-import/upa-comparison.json", JSON.stringify(output, null, 2));
console.log(JSON.stringify({
  workbook_rows: output.workbook.row_count,
  priced_rows: output.workbook.priced_row_count,
  missing_price_rows: output.workbook.missing_price_rows,
  existing_upa_count: output.existing_upa_count,
  existing_with_images: output.existing_with_images,
  exact_match_rows: comparisons.filter((row) => row.exact_matches.length > 0).length,
  unmatched_rows: comparisons.filter((row) => row.exact_matches.length === 0 && row.price).length,
  fuzzy_only_rows: comparisons.filter((row) => row.exact_matches.length === 0 && row.fuzzy_candidates.length > 0 && row.price).map((row) => ({ row_number: row.row_number, imported_name: row.imported_name, candidates: row.fuzzy_candidates })),
}, null, 2));
await connection.end();
