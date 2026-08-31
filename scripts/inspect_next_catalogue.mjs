import fs from "node:fs/promises";
import mysql from "mysql2/promise";

const csvPath = "/tmp/next-import/THrIfVRBqbhbuqLO.csv";
const outputPath = "/tmp/next-import/next-catalogue-audit.json";

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];
    if (char === '"') {
      if (quoted && next === '"') {
        field += '"';
        i += 1;
      } else {
        quoted = !quoted;
      }
    } else if (char === "," && !quoted) {
      row.push(field.trim());
      field = "";
    } else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && next === "\n") i += 1;
      row.push(field.trim());
      if (row.some((value) => value !== "")) rows.push(row);
      row = [];
      field = "";
    } else {
      field += char;
    }
  }
  if (field !== "" || row.length) {
    row.push(field.trim());
    if (row.some((value) => value !== "")) rows.push(row);
  }
  return rows;
}

const csv = await fs.readFile(csvPath, "utf8");
const records = parseCsv(csv);
const headers = records.shift().map((value) => value.toLowerCase());
const rows = records.map((record, index) => {
  const raw = Object.fromEntries(headers.map((header, column) => [header, record[column] ?? ""]));
  return {
    name: raw.name ?? "",
    category: raw.category ?? "",
    dosageInfo: raw.dosageinfo ?? "",
    description: raw.description ?? "",
    brand: raw.brand ?? "",
    price: raw.price ?? "",
    row_number: index + 2,
  };
});

function normalize(value) {
  return String(value ?? "").toLowerCase().replace(/[^a-z0-9]+/g, "");
}
function normalizeProductName(value) {
  return normalize(value).replace(/^pharmaceuticals?/, "").replace(/^pharma/, "");
}

const connection = await mysql.createConnection(process.env.DATABASE_URL);
const [catalogue] = await connection.query(`
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

const comparisons = rows.map((row) => {
  const sameName = catalogue.filter((candidate) => normalizeProductName(candidate.name) === normalizeProductName(row.name));
  const sameIdentity = catalogue.filter((candidate) =>
    (normalizeProductName(candidate.name) === normalizeProductName(row.name)
      && normalize(candidate.dosageInfo) === normalize(row.dosageInfo))
    || (normalize(candidate.description) === normalize(row.description)
      && normalize(candidate.dosageInfo) === normalize(row.dosageInfo)
      && Number(candidate.price) === Number(row.price))
  );
  return {
    ...row,
    same_name_candidates: sameName.map((candidate) => ({ id: candidate.id, name: candidate.name, category: candidate.category, price: String(candidate.price), isActive: Boolean(candidate.isActive), image_count: Number(candidate.image_count ?? 0) })),
    same_identity_candidates: sameIdentity.map((candidate) => ({ id: candidate.id, name: candidate.name, category: candidate.category, price: String(candidate.price), isActive: Boolean(candidate.isActive), image_count: Number(candidate.image_count ?? 0) })),
  };
});

const output = {
  headers,
  workbook_rows: rows.length,
  priced_rows: rows.filter((row) => row.price !== "").length,
  missing_price_rows: rows.filter((row) => row.price === "").map((row) => row.row_number),
  brands: [...new Set(rows.map((row) => row.brand).filter(Boolean))],
  source_categories: [...new Set(rows.map((row) => row.category).filter(Boolean))],
  catalogue_count: catalogue.length,
  exact_name_rows: comparisons.filter((row) => row.same_name_candidates.length > 0).length,
  exact_identity_rows: comparisons.filter((row) => row.same_identity_candidates.length > 0).length,
  comparisons,
};
await fs.writeFile(outputPath, JSON.stringify(output, null, 2));
console.log(JSON.stringify({
  workbook_rows: output.workbook_rows,
  priced_rows: output.priced_rows,
  missing_price_rows: output.missing_price_rows,
  brands: output.brands,
  source_categories: output.source_categories,
  catalogue_count: output.catalogue_count,
  exact_name_rows: output.exact_name_rows,
  exact_identity_rows: output.exact_identity_rows,
}, null, 2));
await connection.end();
