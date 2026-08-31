import mysql from "mysql2/promise";
import fs from "node:fs/promises";

const workbook = JSON.parse(await fs.readFile("/tmp/upa-import/upa-workbook-summary.json", "utf8"));
const apply = process.argv.includes("--apply");
const connection = await mysql.createConnection(process.env.DATABASE_URL);

const [categoryRows] = await connection.query(`
  SELECT id, name, slug
  FROM categories
  WHERE isActive = 1
`);
const [productRows] = await connection.query(`
  SELECT p.id, p.name, p.description, p.dosageInfo, p.categoryId, p.price, p.isActive,
    c.name AS category,
    COUNT(DISTINCT ci.id) AS cart_references,
    COUNT(DISTINCT oi.id) AS order_item_references,
    COUNT(DISTINCT pi.id) AS image_count
  FROM products p
  LEFT JOIN categories c ON c.id = p.categoryId
  LEFT JOIN cart_items ci ON ci.productId = p.id
  LEFT JOIN order_items oi ON oi.productId = p.id
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
function categoryKey(value) {
  const key = String(value ?? "").toLowerCase().replace(/[^a-z]+/g, "");
  return key === "sarms" ? "sarms" : key === "oralsteroids" ? "orals" : key;
}
function slugify(value) {
  return String(value ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 220);
}
function asNumber(value) {
  return Number(value ?? 0);
}
function isUParserProduct(row) {
  return /^upa\s*[-:]/i.test(String(row.name ?? "")) || /upa labs/i.test(String(row.name ?? ""));
}
function isReferenceFree(row) {
  return Number(row.cart_references ?? 0) === 0 && Number(row.order_item_references ?? 0) === 0;
}

const categoryMap = new Map(categoryRows.map((row) => [categoryKey(row.name), row.id]));
const products = productRows.map((row) => ({
  ...row,
  category: String(row.category ?? ""),
  normalizedName: normalize(row.name),
  normalizedCategory: categoryKey(row.category),
  isUParserProduct: isUParserProduct(row),
  image_count: Number(row.image_count ?? 0),
  cart_references: Number(row.cart_references ?? 0),
  order_item_references: Number(row.order_item_references ?? 0),
}));

const aliasBase = new Map([
  ["anapolon", "anapolan"],
  ["andarines4", "anadrines4"],
  ["stenabolsr9009", "stenabolicsr9009"],
]);

const plans = [];
for (const row of workbook.rows) {
  if (!row.price) {
    plans.push({ row_number: row.row_number, imported_name: `UPA - ${row.name}`, action: "skip_missing_price", reason: "No price in workbook" });
    continue;
  }

  const desiredName = `UPA - ${row.name}`;
  const desiredBase = normalize(desiredName);
  const alternateBase = aliasBase.get(desiredBase);
  const desiredCategory = categoryKey(row.category);
  const categoryId = categoryMap.get(desiredCategory);
  if (!categoryId) throw new Error(`No active canonical category for ${row.category}`);

  const upaCandidates = products.filter((candidate) =>
    candidate.isUParserProduct
    && candidate.normalizedCategory === desiredCategory
    && (candidate.normalizedName === desiredBase || candidate.normalizedName === alternateBase)
  );
  const unbrandedCandidates = products.filter((candidate) =>
    !candidate.isUParserProduct
    && candidate.normalizedCategory === desiredCategory
    && candidate.normalizedName === desiredBase
  );

  let target = upaCandidates.find((candidate) => candidate.normalizedName === desiredBase);
  let matchType = target ? "existing_upa_exact" : null;
  if (!target && upaCandidates.length === 1) {
    target = upaCandidates[0];
    matchType = "existing_upa_alias";
  }
  if (!target && unbrandedCandidates.length === 1 && isReferenceFree(unbrandedCandidates[0])) {
    target = unbrandedCandidates[0];
    matchType = "adopt_unbranded_reference_free";
  }

  const duplicateIds = [];
  for (const candidate of [...upaCandidates, ...unbrandedCandidates]) {
    if (!target || candidate.id === target.id) continue;
    if (isReferenceFree(candidate)) duplicateIds.push(candidate.id);
  }

  if (target) {
    plans.push({
      row_number: row.row_number,
      imported_name: desiredName,
      action: "update_existing",
      match_type: matchType,
      target_id: target.id,
      target_name: target.name,
      target_image_count: target.image_count,
      target_has_references: !isReferenceFree(target),
      archive_duplicate_ids: duplicateIds,
      category_id: categoryId,
      category: row.category,
      description: row.description,
      dosageInfo: row.dosageInfo,
      price: Number(row.price).toFixed(2),
    });
  } else {
    const baseSlug = slugify(desiredName);
    const conflictingSlug = products.find((candidate) => candidate.slug === baseSlug);
    plans.push({
      row_number: row.row_number,
      imported_name: desiredName,
      action: "create_new",
      target_id: null,
      target_name: null,
      target_image_count: 0,
      target_has_references: false,
      archive_duplicate_ids: [],
      category_id: categoryId,
      category: row.category,
      description: row.description,
      dosageInfo: row.dosageInfo,
      price: Number(row.price).toFixed(2),
      base_slug: baseSlug,
      slug_conflict_id: conflictingSlug?.id ?? null,
    });
  }
}

const unsafeActions = plans.filter((plan) => plan.action === "create_new" && plan.slug_conflict_id);
if (unsafeActions.length > 0) {
  throw new Error(`Slug conflicts require manual review: ${unsafeActions.map((plan) => `${plan.imported_name} -> ${plan.slug_conflict_id}`).join(", ")}`);
}

const report = {
  mode: apply ? "apply" : "dry_run",
  workbook_rows: workbook.rows.length,
  priced_rows: plans.filter((plan) => plan.action !== "skip_missing_price").length,
  skipped_missing_price: plans.filter((plan) => plan.action === "skip_missing_price").length,
  update_existing: plans.filter((plan) => plan.action === "update_existing").length,
  create_new: plans.filter((plan) => plan.action === "create_new").length,
  archive_duplicates: [...new Set(plans.flatMap((plan) => plan.archive_duplicate_ids ?? []))].length,
  image_preserving_updates: plans.filter((plan) => plan.action === "update_existing" && plan.target_image_count > 0).length,
  plans,
};
await fs.writeFile("/tmp/upa-import/upa-reconciliation-plan.json", JSON.stringify(report, null, 2));
console.log(JSON.stringify({
  mode: report.mode,
  workbook_rows: report.workbook_rows,
  priced_rows: report.priced_rows,
  skipped_missing_price: report.skipped_missing_price,
  update_existing: report.update_existing,
  create_new: report.create_new,
  archive_duplicates: report.archive_duplicates,
  image_preserving_updates: report.image_preserving_updates,
  create_rows: plans.filter((plan) => plan.action === "create_new").map((plan) => ({ row_number: plan.row_number, imported_name: plan.imported_name, category: plan.category, price: plan.price })),
  alias_rows: plans.filter((plan) => plan.match_type === "existing_upa_alias").map((plan) => ({ row_number: plan.row_number, imported_name: plan.imported_name, target_id: plan.target_id, target_name: plan.target_name })),
  adopted_rows: plans.filter((plan) => plan.match_type === "adopt_unbranded_reference_free").map((plan) => ({ row_number: plan.row_number, imported_name: plan.imported_name, target_id: plan.target_id, target_name: plan.target_name })),
  archive_rows: plans.filter((plan) => (plan.archive_duplicate_ids ?? []).length > 0).map((plan) => ({ row_number: plan.row_number, imported_name: plan.imported_name, archive_duplicate_ids: plan.archive_duplicate_ids })),
}, null, 2));

if (apply) {
  await connection.beginTransaction();
  try {
    for (const plan of plans) {
      if (plan.action === "skip_missing_price") continue;
      if (plan.action === "update_existing") {
        await connection.query(
          `UPDATE products SET name = ?, description = ?, dosageInfo = ?, categoryId = ?, price = ?, isActive = 1 WHERE id = ?`,
          [plan.imported_name, plan.description || null, plan.dosageInfo || null, plan.category_id, plan.price, plan.target_id],
        );
        for (const duplicateId of plan.archive_duplicate_ids ?? []) {
          await connection.query(`UPDATE products SET isActive = 0 WHERE id = ?`, [duplicateId]);
        }
      } else if (plan.action === "create_new") {
        const [result] = await connection.query(
          `INSERT INTO products (name, slug, description, dosageInfo, categoryId, price, stockQuantity, isActive, isFeatured) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [plan.imported_name, plan.base_slug, plan.description || null, plan.dosageInfo || null, plan.category_id, plan.price, 100, 1, 0],
        );
        plan.created_id = result.insertId;
      }
    }
    await connection.commit();
    report.applied = true;
    await fs.writeFile("/tmp/upa-import/upa-reconciliation-plan.json", JSON.stringify(report, null, 2));
    console.log(JSON.stringify({ applied: true, created_ids: plans.filter((plan) => plan.created_id).map((plan) => ({ name: plan.imported_name, id: plan.created_id })) }));
  } catch (error) {
    await connection.rollback();
    throw error;
  }
}

await connection.end().catch(() => {});
process.exit(0);
