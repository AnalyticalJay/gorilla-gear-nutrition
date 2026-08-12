# Gorilla Gear Nutrition — Project TODO

## Active Implementation — New Brand Image Archives & Pagination
- [x] Extract Noventra, IPharma, Pharmacom, and NOVA Labs ZIP archives.
- [x] Build strict brand-matched image importer script for Noventra, IPharma, Pharmacom, and NOVA Labs.
- [x] Upload matched images to S3 storage and link strictly to matching products by brand + name.
- [x] Implement server-side pagination (limit/offset) in tRPC product router.
- [x] Update storefront UI with pagination controls and reset on filter change.
- [x] Run test suite and verify UI rendering.

## Source Project History

- [x] Complete the gated commerce foundation, approval workflow, product catalogue, quote cart, admin review, EFT, PayFast flow, and S3-backed image management.
- [x] Complete responsive storefront, mobile navigation, quote progress tracking, customer-admin comments, bulk product import, and bulk image matching.
- [x] Complete the source Anabolics Africa / HD Labs rebrand and admin dashboard alert work.
- [ ] Source PayFast merchant credentials, production notification URL, and final source checkpoint remain historical follow-up items.

## Active Copy Session — Gorilla Gear Nutrition

- [x] Review the provided Gorilla Gear Nutrition reference site, current homepage, and available brand assets.
- [x] Stage the Gorilla Gear Nutrition logo and category artwork in managed static storage.
- [x] Define and implement the new homepage structure, copy direction, palette, and responsive layout.
- [x] Rebrand the global navigation and footer for Gorilla Gear Nutrition.
- [x] Remove fabricated testimonials and ratings from the homepage.
- [x] Keep the empty catalogue state ready for the user’s later Gorilla Gear Nutrition product and image re-upload.
- [x] Update copied-project validation for the Gorilla Gear Nutrition title and empty catalogue.
- [x] Run TypeScript checks and the Vitest suite: 56 tests passed across 13 files.
- [x] Replace remaining legacy customer-facing brand references on account, quote, approval, login, register, and checkout screens.
- [x] Re-run validation after the broader customer-facing rebrand.
- [x] Perform desktop and mobile browser verification after the broader rebrand.
- [x] Save a checkpoint for the completed redesign.

## Future User-Requested Work

- [ ] Re-upload and fully populate the Gorilla Gear Nutrition product catalogue and product images.
- [ ] Configure new-project PayFast credentials and the production notification URL when ready.
- [ ] Reconnect GitHub or bind a custom domain if required.
- [ ] Implement further storefront or homepage polish requested by the user.

## Active Implementation — Registration and Approval Dashboard

- [x] Inspect the existing registration, authentication, admin dashboard, and DashboardLayout components before modifying them.
- [x] Implement the Gorilla Gear Nutrition customer registration experience with validation, age confirmation, pending approval messaging, and authentication-compatible submission.
- [x] Implement the responsive admin approval dashboard with status filters, applicant search, detail review, approve/reject actions, notes, loading states, empty states, and error feedback.
- [x] Preserve server-side authorization and existing tRPC contracts while wiring the React components.
- [x] Add or update Vitest coverage for registration and approval dashboard behavior.
- [x] Run TypeScript checks and Vitest tests, then verify desktop and mobile layouts.
- [x] Save a checkpoint for the completed implementation.
- [x] Refine the approval status filters so all options remain visible without horizontal clipping on small screens.
- [x] Replace the stale Anabolics Africa document title with Gorilla Gear Nutrition.

## Active Implementation — Product and Image Import

- [x] Inspect uploaded catalogue files and image assets for Gorilla Gear Nutrition.
- [x] Normalize product names, categories, pricing, and descriptions.
- [x] Import categories and products into the database.
- [x] Upload product images and match them by filename/SKU.
- [x] Validate populated storefront display and quote flow.

## Active Implementation — Storefront Sidebar Filters

- [x] Inspect existing storefront product query and list components.
- [x] Implement filter sidebar for brand, category, price range, and search.
- [x] Add mobile filter drawer support.
- [x] Verify filter logic and test storefront layouts.
- [x] Add unit test coverage for price-range filtering and filter reset behavior.
- [x] Visually verify storefront filter sidebar and mobile filter drawer via screenshot.
- [x] Add unit test coverage for filter state reset behavior.
- [x] Take screenshots of the products catalogue and mobile filter drawer for visual verification.
- [x] Add component test for Products page filter reset and selection.
- [x] Take mobile screenshot with filter drawer open for visual verification.
- [x] Add true React component test rendering Products page with filter interactions.
- [x] Take mobile screenshot with filter drawer open.

## Active Implementation — Fix Admin 404 Routing
- [x] Trace App.tsx routes for admin paths.
- [x] Implement admin route definitions in App.tsx.
- [x] Verify admin dashboard loads successfully.
- [x] Add route/component test asserting `/admin/dashboard` renders successfully.
- [x] Add true route-level integration test rendering App at `/admin/dashboard`.

## Active Implementation — CSV Catalogue Import
- [x] Inspect uploaded CSV structure.
- [x] Parse and import CSV products into database.
- [x] Verify storefront and admin product lists reflect CSV data.
- [x] Visually verify storefront and admin product lists reflect the newly imported CSV inventory via browser screenshot.
- [x] Visually verify admin products page via screenshot.
- [x] Capture screenshot of `/admin/products` to verify imported CSV rows in the admin management table.
- [x] Verify authenticated admin products table renders 703 products correctly.
- [x] Add unit test verifying admin product list query and table rendering in `AdminProducts.tsx`.

## Active Implementation — Storefront Pagination
- [x] Add limit and offset parameters to product list tRPC procedure.
- [x] Update Products.tsx with pagination controls (page size 24, previous/next, page numbers).
- [x] Reset page to 1 when filters or search change.
- [x] Add unit test for pagination query and component behavior.

## Active Implementation — Cooper Pharmaceuticals Image Import
- [x] Extract uploaded ZIP archives for Cooper Pharmaceuticals.
- [x] Match extracted images with Cooper products by name/brand.
- [x] Upload matched images to storage and link in database.
- [x] Verify image display on storefront and admin product pages.

## New Brand Import Audit
- [x] Confirm six remaining NOVA archive files have no safe exact NOVA product record and leave them unlinked rather than cross-branding or guessing.
- [x] Disambiguate NOVA Clenbuterol 40 to the 100-tablet product using the package image and remove the incorrect 50-tablet link.
- [x] Remove duplicate re-import image rows and make the importer idempotent for future reruns.
- [x] Re-run the strict matcher with zero ambiguous associations; retain the six documented no-match records for catalog follow-up.

## Image Coverage Audit
- [x] Audit all 703 active products and document image coverage by inferred brand.
- [x] Confirm remaining image gaps require additional source archives or verified product records; do not fabricate or cross-brand image associations.

## Active Implementation — Homepage Polish and Responsive Optimization
- [x] Refine the homepage visual hierarchy, spacing, CTA presentation, and responsive behavior.
- [x] Verify the homepage at desktop, tablet, and phone widths and address any overflow or clipping.
- [x] Add or update homepage component tests for the polished responsive structure.
