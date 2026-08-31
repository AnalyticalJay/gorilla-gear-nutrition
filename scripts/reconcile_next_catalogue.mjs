import mysql from "mysql2/promise";
import fs from "node:fs/promises";

const csvPath = "/tmp/next-import/THrIfVRBqbhbuqLO.csv";
const reportPath = "/tmp/next-import/next-reconciliation-plan.json";
const apply = process.argv.includes("--apply");

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

function normalize(value) {
  return String(value ?? "").toLowerCase().replace(/[^a-z0-9]+/g, "");
}
function productNameKey(value) {
  return normalize(value).replace(/^pharmaceuticals?/, "").replace(/^pharma/, "");
}
function fieldKey(value) {
  return normalize(value);
}
function slugify(value) {
  return String(value ?? "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 220);
}
function money(value) {
  const numeric = Number(String(value ?? "").replace(/[^0-9.-]/g, ""));
  if (!Number.isFinite(numeric) || numeric < 0) throw new Error(`Invalid price: ${value}`);
  return numeric.toFixed(2);
}
function isPharmaName(value) {
  return /^pharma\s*[-:]/i.test(String(value ?? ""));
}

const aliases = new Map([
  ["brazepam", "brazapem"],
  ["dopalquel300", "dopaquel300"],
  ["genotropingh", "gentropingh"],
  ["minoxidolspray", "minoxidelspray"],
  ["orforglipon", "orforglipron"],
  ["mounjarokwikpenlilly", "mounjarpkwikpenlilly"],
]);
const manualCategories = new Map([
  ["pethidine", "Injectables"],
  ["purate", "Orals"],
  ["mounjarokwikpenlilly", "Fat Loss"],
  ["ozempicpennovanordisk", "Fat Loss"],
]);

const rawRecords = parseCsv(await fs.readFile(csvPath, "utf8"));
const headers = rawRecords.shift().map((value) => value.toLowerCase());
const rows = rawRecords.map((record, index) => {
  const raw = Object.fromEntries(headers.map((header, column) => [header, record[column] ?? ""]));
  return {
    row_number: index + 2,
    name: raw.name ?? "",
    category: raw.category ?? "",
    dosageInfo: raw.dosageinfo ?? "",
    description: raw.description ?? "",
    brand: raw.brand ?? "",
    price: raw.price ?? "",
  };
});

const connection = await mysql.createConnection(process.env.DATABASE_URL);
const [categories] = await connection.query(`SELECT id, name, slug FROM categories WHERE isActive = 1`);
const [products] = await connection.query(`
  SELECT p.id, p.name, p.description, p.dosageInfo, p.categoryId, p.price, p.slug, p.isActive,
    c.name AS category,
    COUNT(DISTINCT ci.id) AS cart_references,
    COUNT(DISTINCT oi.id) AS order_item_references,
    COUNT(DISTINCT pi.id) AS image_count
  FROM products p
  LEFT JOIN categories c ON c.id = p.categoryId
  LEFT JOIN cart_items ci ON ci.productId = p.id
  LEFT JOIN order_items oi ON oi.productId = p.id
  LEFT JOIN product_images pi ON pi.productId = p.id
  GROUP BY p.id, p.name, p.description, p.dosageInfo, p.categoryId, p.price, p.slug, p.isActive, c.name
  ORDER BY p.id
`);

const categoryMap = new Map(categories.map((category) => [String(category.name).toLowerCase(), category]));
const activeProducts = products.filter((product) => Boolean(product.isActive));
const usedTargets = new Set();
const seenKeys = new Set();
const plans = [];

for (const row of rows) {
  const desiredName = `Pharma - ${row.name}`;
  const baseKey = productNameKey(row.name);
  const aliasKey = aliases.get(baseKey);
  const allowedNameKeys = new Set([baseKey, aliasKey].filter(Boolean));
  const desiredPrice = money(row.price);
  const manualCategory = manualCategories.get(baseKey);
  const nameCandidates = activeProducts.filter((candidate) => allowedNameKeys.has(productNameKey(candidate.name)) && !usedTargets.has(candidate.id));
  const exactDosageCandidates = nameCandidates.filter((candidate) => fieldKey(candidate.dosageInfo) === fieldKey(row.dosageInfo));
  const describedCandidates = nameCandidates.filter((candidate) => fieldKey(candidate.description) === fieldKey(row.description) && Number(candidate.price) === Number(desiredPrice));
  const candidate = exactDosageCandidates[0] ?? describedCandidates[0] ?? (nameCandidates.length === 1 ? nameCandidates[0] : undefined);
  let categoryName = candidate?.category ?? manualCategory;
  if (!categoryName) {
    throw new Error(`Row ${row.row_number} (${row.name}) needs manual category review`);
  }
  const category = categoryMap.get(String(categoryName).toLowerCase());
  if (!category) throw new Error(`No active canonical category for ${categoryName}`);

  const key = `${category.id}:${productNameKey(row.name)}:${fieldKey(row.dosageInfo)}`;
  if (seenKeys.has(key)) throw new Error(`Duplicate workbook identity at row ${row.row_number}: ${row.name} / ${row.dosageInfo}`);
  seenKeys.add(key);

  if (candidate && !usedTargets.has(candidate.id)) {
    usedTargets.add(candidate.id);
    const canonicalName = productNameKey(candidate.name) === baseKey ? desiredName : candidate.name;
    plans.push({
      row_number: row.row_number,
      action: "update_existing",
      match_type: productNameKey(candidate.name) === baseKey ? "exact_name_dosage" : "alias_name_dosage",
      target_id: candidate.id,
      target_name: candidate.name,
      target_image_count: Number(candidate.image_count ?? 0),
      target_has_references: Number(candidate.cart_references ?? 0) > 0 || Number(candidate.order_item_references ?? 0) > 0,
      name: canonicalName,
      category_id: category.id,
      category: category.name,
      description: row.description,
      dosageInfo: row.dosageInfo,
      price: desiredPrice,
    });
  } else {
    const slug = slugify(desiredName);
    const slugConflict = activeProducts.find((entry) => entry.slug === slug);
    plans.push({
      row_number: row.row_number,
      action: "create_new",
      match_type: "new_product",
      target_id: null,
      target_name: null,
      target_image_count: 0,
      target_has_references: false,
      name: desiredName,
      category_id: category.id,
      category: category.name,
      description: row.description,
      dosageInfo: row.dosageInfo,
      price: desiredPrice,
      slug,
      slug_conflict_id: slugConflict?.id ?? null,
    });
  }
}

const unsafeSlugPlans = plans.filter((plan) => plan.action === "create_new" && plan.slug_conflict_id);
if (unsafeSlugPlans.length) throw new Error(`Slug conflicts require review: ${unsafeSlugPlans.map((plan) => `${plan.name} -> ${plan.slug_conflict_id}`).join(", ")}`);

const report = {
  mode: apply ? "apply" : "dry_run",
  workbook_rows: rows.length,
  priced_rows: rows.filter((row) => row.price !== "").length,
  update_existing: plans.filter((plan) => plan.action === "update_existing").length,
  create_new: plans.filter((plan) => plan.action === "create_new").length,
  image_preserving_updates: plans.filter((plan) => plan.action === "update_existing" && plan.target_image_count > 0).length,
  plans,
};
await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
console.log(JSON.stringify({
  mode: report.mode,
  workbook_rows: report.workbook_rows,
  priced_rows: report.priced_rows,
  update_existing: report.update_existing,
  create_new: report.create_new,
  image_preserving_updates: report.image_preserving_updates,
  create_rows: plans.filter((plan) => plan.action === "create_new").map((plan) => ({ row_number: plan.row_number, name: plan.name, category: plan.category, price: plan.price })),
  alias_rows: plans.filter((plan) => plan.match_type === "alias_name_dosage").map((plan) => ({ row_number: plan.row_number, name: plan.name, target_id: plan.target_id, target_name: plan.target_name })),
}, null, 2));

if (apply) {
  await connection.beginTransaction();
  try {
    const created = [];
    for (const plan of plans) {
      if (plan.action === "update_existing") {
        await connection.query(
          `UPDATE products SET name = ?, description = ?, dosageInfo = ?, categoryId = ?, price = ?, isActive = 1 WHERE id = ?`,
          [plan.name, plan.description || null, plan.dosageInfo || null, plan.category_id, plan.price, plan.target_id],
        );
      } else {
        const [result] = await connection.query(
          `INSERT INTO products (name, slug, description, dosageInfo, categoryId, price, stockQuantity, isActive, isFeatured) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [plan.name, plan.slug, plan.description || null, plan.dosageInfo || null, plan.category_id, plan.price, 100, 1, 0],
        );
        created.push({ id: result.insertId, name: plan.name });
      }
    }
    await connection.commit();
    report.applied = true;
    report.created = created;
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
    console.log(JSON.stringify({ applied: true, created }, null, 2));
  } catch (error) {
    await connection.rollback();
    throw error;
  }
}

await connection.end();
process.exit(0);
