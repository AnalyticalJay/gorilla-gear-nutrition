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
- [x] Source PayFast merchant credentials, production notification URL, and final source checkpoint remain historical follow-up items.

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

- [x] Defer the remaining product-image uploads until the user provides the outstanding image archives at a later stage.
- [x] Configure new-project PayFast credentials and the production notification URL when ready.
- [x] Keep GitHub export and custom-domain binding deferred unless explicitly requested.
- [x] Implement further storefront or homepage polish requested by the user.

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

## Active Implementation — Admin Dashboard Analytics and Responsive UX
- [x] Refine the admin dashboard overview layout, hierarchy, navigation, and responsive behavior.
- [x] Add real database-backed overview analytics for users, approvals, products, images, and quote activity.
- [x] Add tests for analytics data and responsive admin overview rendering.
- [x] Verify the admin dashboard at desktop, tablet, and phone widths and save a checkpoint.

## Active Implementation — Order Tracking Timeline and Courier Integration
- [x] Inspect the current order lifecycle, admin order detail, customer order pages, and Courier Guy API requirements.
- [x] Add tracking number and shipment metadata to orders with admin update workflow.
- [x] Build a responsive customer-facing order tracking timeline from placement through payment and dispatch.
- [x] Add Courier Guy integration if supported by available API credentials; otherwise provide a reliable external tracking fallback.
- [x] Add tests and verify admin/customer tracking flows across desktop and mobile.

## Order Tracking Verification Follow-up
- [x] Add Vitest coverage for the admin tracking workflow, including tracking fields and status-transition timestamps.
- [x] Add customer order-detail regression coverage for tracking number, note, and timeline progression.
- [x] Verify customer order-detail payment layout at desktop, tablet, and phone widths; live order #1 has no stored order_items, so populated product/POP variants are covered by component tests rather than seeded live data.

## Active Implementation — Customer Order Details and Payment Proof
- [x] Fix customer order details to display quoted products, quantities, strengths, and line totals.
- [x] Add customer payment actions for approved quotes with PayFast readiness and EFT selection.
- [x] Add secure EFT proof-of-payment upload with storage metadata and customer status feedback.
- [x] Add admin proof-of-payment review and approve/reject workflow.
- [x] Add regression tests and verify the customer/admin payment workflow on mobile and desktop.

## Payment and Order Detail Refinement Follow-up
- [x] Add historical product-name and strength snapshots with left-join fallbacks; audit existing order_items and confirm the database currently contains zero historical rows requiring backfill.
- [x] Add server-side validation for EFT proof-of-payment uploads (MIME type, size limits, state validation).
- [x] Add admin POP rejection workflow with rejection reason and customer re-upload support.
- [x] Add component coverage for approved-quote payment CTAs and customer POP upload/re-upload states, plus AdminOrderDetail POP approve/reject actions.

## Active Implementation — Customer Proof-of-Payment Status Badge
- [x] Add explicit pending, approved, and rejected proof-of-payment states to the customer order detail.
- [x] Show clear badge styling and state-specific guidance, including re-upload guidance for rejected proof.
- [x] Add regression coverage and verify the status badge on responsive customer views.

## Active Implementation — PayFast Credential Setup
- [x] Securely configure the supplied PayFast Merchant ID and Merchant Key through project secrets.
- [x] Configure production notification URL and secret verification for PayFast ITN callbacks.
- [x] Validate PayFast credential presence and network reachability with Vitest specs.

## Active Implementation — Mobile Optimization Across Customer Surfaces
- [x] Audit Add to Quote, customer dashboard, account, order detail, quote detail, and shared navigation at phone and tablet widths.
- [x] Fix responsive layout, overflow, spacing, typography, and touch-target issues across the customer surfaces.
- [x] Add responsive regression coverage and verify phone and tablet screenshots for the critical flows.

## Active Verification — Mobile Checkout and EFT Upload
- [x] Audit checkout and customer EFT proof-of-payment states at phone and tablet widths.
- [x] Fix any responsive overflow, spacing, or touch-target issues found in checkout or EFT upload.
- [x] Add or update regression coverage and save a verification checkpoint.

## Active Verification — Order #1 Tracking Number
- [x] Confirm the real tracking number or an explicitly authorized temporary test value.
- [x] Add the authorized tracking number to Order #1 without changing payment approval state.
- [x] Verify the customer timeline and responsive tracking display after shipment-state correction.

## Active Implementation — HD Labs Injectable Image Collection
- [x] Browse the supplied HD Labs links page and inventory injectable product image URLs.
- [x] Match injectable images strictly to existing HD Labs injectable catalogue products.
- [x] Upload verified images to managed storage and link them to the correct products.
- [x] Verify representative injectable product rendering and save a checkpoint.

## Active Implementation — HD Labs Oral Image Collection
- [x] Browse the supplied HD Labs oral page and inventory product image URLs.
- [x] Match oral images strictly to existing HD Labs oral catalogue products by brand and strength.
- [x] Upload verified oral images to managed storage and link them to the correct products.
- [x] Verify representative oral product rendering and save a checkpoint.

## Active Implementation — HD Labs SARMS Image Collection
- [x] Browse the supplied HD Labs SARMS page and inventory product image URLs.
- [x] Match SARMS images strictly to existing HD Labs SARMS catalogue products by brand and strength.
- [x] Confirm all seven verified SARMS images are already present in managed storage and linked to the correct products without duplicate uploads.
- [x] Verify representative SARMS product rendering and save a checkpoint.

## Active Implementation — HD Labs Amps Image Collection
- [x] Browse the supplied HD Labs Amps page and inventory product image URLs.
- [x] Audit Amps images strictly against existing HD Labs catalogue products; no safe HD Labs Amps matches were found.
- [x] Leave all three Amps images unlinked because no safe matching HD Labs Amps product records exist; no cross-brand uploads were made.
- [x] Verify the source-page Amps cards, document the no-match result, and save a checkpoint; product-page rendering is deferred until matching HD Labs Amps records exist.

## Active Implementation — HD Labs Amps Product Creation
- [x] Inspect the three official HD Labs Amps product detail pages for confirmed names, descriptions, strengths, and prices.
- [x] Create or reconcile Testoviron 250, Sustanon 250, and Deca-Durabolin 100 catalogue records in the correct injectable category.
- [x] Upload and link the three verified source images to the new HD Labs Amps records.
- [x] Verify the new Amps product pages on phone and desktop and save a checkpoint.

## Active Implementation — Homepage Hero Logo Replacement
- [x] Upload the supplied Gorilla Gear Nutrition hero artwork to managed storage.
- [x] Replace the current hero logo image and tune responsive sizing without cropping the artwork incorrectly.
- [x] Verify the updated hero on desktop and mobile and save a checkpoint.

## Active Implementation — Hero Media Fill Treatment
- [x] Remove the visual block/card frame around the hero artwork.
- [x] Enlarge the uploaded hero image so it fills the media area without incorrect cropping.
- [x] Verify desktop and mobile hero rendering and save a checkpoint.

## Active Implementation — Frameless Footer and Transparent Hero Logo
- [x] Prepare and upload a transparent-background version of the hero logo artwork.
- [x] Apply the frameless treatment to the footer logo.
- [x] Update the hero to use the transparent artwork and verify desktop/mobile rendering.

## Active Implementation — Dynamic Customer Order Status Tracker
- [x] Review the existing order status model, timeline logic, and customer order-detail presentation.
- [x] Implement a dynamic visual progress tracker for customer order statuses with current, completed, and upcoming states.
- [x] Add responsive regression tests and verify the tracker across customer order states and viewport sizes.
- [x] Save a checkpoint for the completed order status tracker.

## Active Implementation — Courier Scan Integration and Dashboard Status Summary
- [x] Confirm the supported courier API/webhook assumptions and current tracking data flow.
- [x] Implement a credential-gated courier scan synchronization layer with safe fallback when credentials are absent.
- [x] Add a customer dashboard order-status summary card linking to detailed tracking.
- [x] Add regression coverage, verify responsive states, and save a checkpoint.
- [x] Verify the configured courier secret is available server-side without exposing its value.
- [x] Confirmed the official courier endpoint and authentication contract are not publicly exposed in the available documentation; live requests remain disabled until The Courier Guy provides those details.

## Active Implementation — Mock Courier Timeline Preview
- [x] Inspect current courier timeline and admin/customer access patterns for a safe preview entry point.
- [x] Implement deterministic mock courier scan scenarios with explicit mock labeling and no production-data writes.
- [x] Add preview controls and responsive regression coverage for the mock timeline states.
- [x] Save a checkpoint for the mock courier preview flow.

## Active Implementation — Nationwide Shipping Rate
- [x] Inspect the current shipping-rule schema, calculation helpers, and admin shipping configuration.
- [x] Create or update the nationwide South Africa flat-rate rule to R140.
- [x] Verify R140 is applied consistently in customer quote/checkout and admin order displays.
- [x] Add regression coverage and save a checkpoint.
