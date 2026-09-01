# Gorilla Gear Nutrition — Complete Product Menu Structure Implementation Plan

**Status:** Review and approval required before implementation

**Source document:** `GGN_Complete_Brand_Category_Product_Structure_260901_073418.pdf` supplied by the project owner.[1]

## 1. Executive assessment

The supplied document defines a target catalogue that is materially richer than the current website model. It specifies **21 brand groups**, brand-specific subcategories, and individual products, while also recommending a main navigation built around Shop, Brands, Coaching, About, and Contact. The document explicitly expects every product to carry both a Brand and a Category/Sub-category tag so customers can browse by either dimension without duplicate inventory records.[1]

The current database is not yet capable of representing this structure faithfully. Each product currently has one `categoryId`, but there is no first-class relational brand or subcategory assignment. The customer brand filter is inferred from product name, slug, and description prefixes. This has already produced ambiguous prefixes such as `NOVA`, `PC`, `OT`, `P`, `KH`, `HU`, `NP`, `DP`, `WP`, and unprefixed records, which cannot be safely treated as final brand identities without explicit mapping.

The recommended approach is a **dual taxonomy**: retain a canonical product-family category for existing catalogue and access rules, add first-class Brand and Sub-category relations from the PDF, and add a Shop Collection field for the PDF’s top-level navigation groupings. This avoids losing product meaning where one brand spans injectable oils, orals, SARMs, peptides, pens, wellness, nutrition, merchandise, and treats.

## 2. Target structure extracted from the PDF

The document contains the following named brand groups:

| # | Target brand | Subcategory families shown |
|---:|---|---|
| 1 | Ouroboros Laboratories | Peptides & Wellness; Peptide Pens; Merchandise |
| 2 | Keifei Pharmaceuticals | Injectable Oils; Peptides / Growth Hormone; Orals; SARMs |
| 3 | UPA Labs | Injectable Oils; Hybrid Injectables; Orals; SARMs; Peptides |
| 4 | Vmed | Peptides; Orals; Injectables |
| 5 | HD Labs | Orals; Injectable Oils; Black Series; SARMs; Weight Loss Vials; Weight Loss Pens |
| 6 | BodyPharm | Peptide Pens |
| 7 | iPharma | Pens & Vials |
| 8 | Pharmacom | Injectable Oils; Orals; Peptides |
| 9 | Cooper Pharmaceuticals | Injectable Oils; Oral Anabolics; Anti-E / Sex Aid; SARMs; Healthcare |
| 10 | Noventra Pharm | Pens / Peptides |
| 11 | DEX Pharma | Pens & Blends |
| 12 | Nova Labs | Injectable Oils; Orals / SARMs; Peptides |
| 13 | XLR | Injectable / Wellness |
| 14 | Peptide Pens — Unbranded / P Range | Peptide Pens |
| 15 | OralTec | Injectables; Orals; Peptides |
| 16 | Psytech | Orals / Wellness |
| 17 | Kohoh | Injectables; Orals; SARMs |
| 18 | Healthy U | Supplements & Wellness |
| 19 | Creme Supreme | Cream of Rice / Complex Carb Hot Cereal |
| 20 | Nutritech | Protein |
| 21 | DoughBro Cookies | Treats |

The PDF’s proposed Shop navigation additionally contains **Supplements, Nutrition, Peptides & Wellness, Peptide Pens, Accessories, Clothing, and Treats**. These are broader customer-facing collections and should not be forced into the same field as technical product subcategories such as Injectable Oils, Orals, SARMs, and Weight Loss Pens.[1]

## 3. Current-state comparison

| Area | Current website/database | Required target state | Gap severity |
|---|---|---|---|
| Brand storage | Brand inferred from text prefixes; no `brandId` | Relational brand records with canonical names and aliases | Critical |
| Subcategories | No product subcategory field or relation | Brand-specific subcategory records with product assignments | Critical |
| Shop collections | Existing eight active categories: Clothing, Fat Loss, Healthcare, Injectables, Orals, Peptides, SARMs, Supplements | PDF-aligned customer collections plus retained canonical family mapping | Major |
| Active categories | Exactly eight active canonical categories; legacy categories are inactive | Keep only approved canonical family categories active, archive non-fitting legacy rows safely | Moderate |
| Brand filter | Covers only a limited set of readable brands, with text inference | Filter all 21 PDF brands, including an explicit Unbranded / P Range entry | Major |
| Product naming | Mixed prefixes, abbreviations, unprefixed rows, and aliases | Preserve approved display names but store brand separately; normalize aliases without duplication | Critical |
| Image ownership | Images linked by `productId`, but product identity is currently name-driven | Keep image links on reconciled product IDs; never cross-brand or guess | Major |
| Historical data | Orders and carts reference product IDs | Preserve historical references; archive rather than delete products/categories with dependencies | Critical |

The current active catalogue contains 781 products across the eight active categories. The inferred name-prefix audit found both PDF-aligned groups and ambiguous or abbreviated groups, including 52 unprefixed products. This confirms that a direct string replacement of prefixes would be unsafe and would not satisfy the PDF’s Brand → Sub-category → Product structure.

## 4. Proposed data model

### 4.1 Brand

Create a `brands` table with a stable ID, canonical display name, slug, description, active flag, and sort order. Seed the 21 PDF brand groups exactly as written, with a separate `Unbranded / P Range` record for the peptide-pen range. Store aliases such as `NOVA`, `Nova`, `Pharma`, `Ipharma`, `OL`, `PC`, and `P` in a `brand_aliases` table rather than encoding them permanently into product names.

### 4.2 Sub-category

Create a `product_subcategories` table with a stable ID, canonical name, slug, active flag, and optional parent/type metadata. Create `product_brand_subcategories` or a direct `productSubcategoryId` depending on whether the same subcategory label is intended to be shared across brands. The safer initial design is a shared subcategory vocabulary with optional brand-specific display ordering, because labels such as Orals, Peptides, Injectables, and SARMs recur across multiple brands.

### 4.3 Shop collection

Create a `shop_collections` table or controlled enum for the PDF’s customer-facing collections: Supplements, Nutrition, Peptides & Wellness, Peptide Pens, Accessories, Clothing, and Treats. Products may belong to one primary collection and optionally several secondary collections where the PDF explicitly indicates overlap, such as a product listed under Orals / SARMs.

### 4.4 Product extensions

Add nullable foreign keys for `brandId`, `subcategoryId`, and `shopCollectionId` to products, or use join tables if multi-collection membership is required. Keep the existing canonical `categoryId` during migration. Do not remove the existing category relation until all products, order snapshots, carts, and admin workflows have been reconciled.

## 5. Product reconciliation rules

The importer must use a deterministic identity key composed of canonical Brand, normalized Product name, Strength/Dosage, and Sub-category. Description and price should be treated as updateable attributes, not identity fields. A rerun of the same source file must produce zero new products.

The reconciliation order should be:

1. Match exact canonical brand + normalized name + dosage/strength.
2. Match an approved brand alias or spelling alias only when the dosage/strength also matches.
3. Match a unique existing product whose name, dosage, category, and description establish the same identity.
4. Create a new product only when no safe match exists and its slug is not already occupied.
5. Preserve existing `productId` values when images, carts, or order history are attached.
6. Do not merge distinct strengths, package sizes, or delivery forms merely because the product names are similar.

Products listed in the PDF but absent from the current inventory should be created only when the source provides sufficient fields. Missing price should remain a review state rather than silently creating a purchasable product. Missing image should retain the safe initials fallback until an exact verified asset is supplied.

## 6. Category and retirement policy

The current eight active canonical product-family categories should remain the controlled internal baseline until the new dual taxonomy is approved. The PDF’s subcategories should be added as a separate layer rather than replacing the eight categories blindly.

After reconciliation, any category that is not part of the approved final model should be marked inactive, not hard-deleted, unless it has no products, images, carts, orders, or historical references. Products must be reassigned before a category is deactivated. Existing historical order and cart records must never be altered merely to make the filter list look cleaner.

The current inactive legacy categories—including BLACK SERIES, GH & Peptides, HYBRID INJECTABLES, INJECTABLE OILS, ORAL ANABOLICS, Pens, WEIGHTLOSS P, and ORAL STEROIDS—should be treated as migration evidence. Their labels can become subcategories or aliases where the PDF supports them, but they should not be reactivated as duplicate top-level categories.

## 7. Storefront filter and navigation changes

Replace prefix-derived filtering with database-backed brand and subcategory fields. The Shop filter should expose the 21 approved brands, the approved Shop Collections, and the approved technical subcategories. The UI should show the same canonical names in desktop filters, mobile filter drawers, admin product forms, bulk-import previews, and product exports.

The customer-facing private catalogue gate must remain unchanged for restricted product families. Public Supplements, Clothing, Nutrition, and Treats access should follow the approved collection policy. Customer views must continue to hide stock quantities and must retain the current white, charcoal, and gold brand palette.

## 8. Implementation sequence after approval

### Phase A — Schema and controlled vocabularies

Create the brand, subcategory, and shop-collection tables; add indexes and foreign keys; seed only the PDF-approved vocabulary; and add alias tables. No products should be deleted in this phase.

### Phase B — Read-only reconciliation report

Parse the PDF into a machine-readable manifest, compare it against all active products, and generate classifications for exact matches, approved aliases, ambiguous matches, missing products, out-of-structure products, missing prices, and image coverage. The report must include product IDs and dependency counts.

### Phase C — Admin review tools

Add an admin structure-review screen showing the proposed brand, category, subcategory, collection, identity key, image status, and action. Require explicit review for ambiguous or destructive classifications. Extend the bulk-import preview to display these fields before finalization.

### Phase D — Controlled migration

Apply only approved exact and alias matches. Create missing brand/subcategory assignments and genuinely missing products. Archive only dependency-free duplicates or categories. Preserve image links and existing product IDs wherever possible.

### Phase E — Filter and storefront verification

Verify all approved brands and subcategories in desktop and mobile filters, confirm private/public access boundaries, confirm product detail rendering and price visibility, confirm stock quantities remain hidden, and run the full type, test, build, and database integrity gates.

## 9. Approval decisions required

Before implementation begins, please confirm the following choices:

| Decision | Recommended default |
|---|---|
| Use dual taxonomy rather than replacing the current eight canonical categories | Approve |
| Add all 21 PDF brand groups to the brand filter | Approve |
| Treat `Unbranded / P Range` as a controlled brand entry | Approve |
| Preserve legacy records and archive instead of destructive deletion | Approve |
| Require exact brand + name + dosage matching for automatic reconciliation | Approve |
| Keep products with missing prices out of the purchasable inventory | Approve |
| Keep unmatched product images unlinked until exact provenance is confirmed | Approve |
| Add an admin review screen for ambiguous mappings | Approve |

No database changes, product deletions, category deactivations, or filter replacements should be applied until these structural decisions are approved.

## References

[1] **Gorilla Gear Nutrition Complete Product Menu Structure**, supplied PDF: `GGN_Complete_Brand_Category_Product_Structure_260901_073418.pdf`.
