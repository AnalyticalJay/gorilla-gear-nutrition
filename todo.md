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

## Active Implementation — Live Courier Endpoint and Quote Email Delivery Confirmation
- [x] Verify the official Courier Guy documentation; the public pages do not expose the live endpoint contract, so no unverified host is used.
- [x] Keep live courier synchronization credential-gated with the official tracking fallback until The Courier Guy supplies the endpoint contract.
- [x] Add the nationwide R140 delivery-rate confirmation to customer quote email content.
- [x] Add regression coverage and verify the fallback/email states.

## Active Verification — Synced R140 Checkout and Quote Email Confirmation
- [x] Inspect the synced shipping calculator and quote-notification implementation.
- [x] Verify the R140 nationwide fee in checkout and the delivery breakdown in quote notifications.
- [x] Run regression tests and verify desktop/mobile checkout rendering.

## Active Implementation — SMTP Quote Confirmations
- [x] Configure server-side SMTP for orders@gorillagear.co.za using the provider’s certificate-matching host, authenticated port 587, and STARTTLS.
- [x] Collect and validate the SMTP mailbox password securely without storing or exposing it in source code.
- [x] Send customer quote confirmation emails containing subtotal, R140 nationwide delivery, total, quote number, and order link.
- [x] Add SMTP/template tests, verify credential-safe behavior, and save a checkpoint.

## Active Bug Fix — Approved User Sign-In Session
- [x] Trace registration, admin approval, login, session cookie, and auth-state refresh behavior.
- [x] Fix the approved-user sign-in flow so successful login is recognized by the client.
- [x] Add regression coverage and verify the approved-user flow on desktop and mobile.
- [x] Save a checkpoint for the authentication fix.

## Active Implementation — Client Access Testing and Login UX
- [x] Document the exact approved-client production test steps and required client-provided credentials.
- [x] Inspect admin access patterns and design an auditable test-access workflow without exposing customer passwords.
- [x] Enhance login loading animation, status messages, and error guidance.
- [x] Add regression coverage, verify responsive states, and save a checkpoint.
- [x] Run the exact approved-client production sign-in test with the client present; do not request or store their password.

## Active Implementation — Chris Role Management
- [x] Verify Chris’s confirmed email account identity, approval status, and current role.
- [x] Promote legendsales101@gmail.com to Admin and preserve approved/active access.
- [x] Add protected Admin/User role switching with last-admin safeguards and audit logging.
- [x] Add regression coverage, verify both access paths, and save a checkpoint.

## Active Verification — Chris Production Permissions
- [x] Verify Chris’s production database identity, approval, active status, and current Admin role.
- [x] Verify the authenticated production session reaches the admin dashboard and protected admin routes.
- [x] Confirmed the live User-role switch is deferred because Chris’s password is unavailable; no live role switch was performed and Admin access remains unchanged.
- [x] Document the verification result and save a verification checkpoint if code or data changes are made.

## Active Audit — Password Reset Readiness
- [x] Inspect the users/session schema and current password-auth capabilities.
- [x] Verify SMTP configuration and run a credential-safe handshake test without sending email.
- [x] Assess password-reset token, email-template, and delivery-readiness gaps.
- [x] Document findings and save a readiness checkpoint if changes are made.

## Active Implementation — Self-Service Password Reset
- [x] Add `resetTokenHash` and `resetTokenExpiresAt` columns to the users table schema and run migration.
- [x] Implement `auth.forgotPassword` and `auth.resetPassword` tRPC procedures with secure random tokens, expiry, and rate-limiting/generic responses.
- [x] Create email transport support for sending password reset links with secure token URLs.
- [x] Build responsive forgot-password and reset-password frontend screens and link them from the login page.
- [x] Add regression tests, verify desktop/mobile rendering, and save a checkpoint.

## Active Implementation — Admin Reset-Token Audit View
- [x] Add password-reset audit log table schema and migration.
- [x] Record forgot-password request, token issuance, password reset success, and invalid-token attempts.
- [x] Expose an admin-only tRPC query to retrieve sanitized reset audit events with filters.
- [x] Build the responsive admin reset-audit dashboard view.
- [x] Add regression tests, verify responsive states, and save a checkpoint.

## Active Implementation — Operational Security and Fulfilment Checklist
- [x] Add audit-event retention purge helpers and password-reset security cleanup.
- [x] Add order fulfilment checklist schema (packed status, packed timestamp, packer ID, courier booking status, booking timestamp, booker ID, and waybill number).
- [x] Implement protected admin fulfilment update procedure with audit tracking.
- [x] Build responsive admin order fulfilment checklist UI on the admin order detail page.
- [x] Add regression test coverage, verify desktop/mobile rendering, and save a checkpoint.

## Active Implementation — Automated Order Notifications
- [x] Inspect existing email transport in server/email.ts and order routers in server/routers.ts.
- [x] Implement payment approval, packing completion, and order dispatch email templates and dispatch functions.
- [x] Wire email notifications into confirmEft, updateOrderFulfilment, and adminUpdateTracking / order dispatch actions.
- [x] Add regression tests, verify desktop/mobile rendering, and save a checkpoint.

## Active Implementation — Dispatch Email Tracking Button
- [x] Validate carrier tracking URLs and define the order-timeline fallback link.
- [x] Add a direct tracking button and URL to the dispatched-order email template.
- [x] Add regression coverage for carrier-link and fallback-link email states.
- [x] Save a checkpoint for the dispatch-email tracking enhancement.

## Active Implementation — Premium Public Homepage Redesign
- [x] Analyze the supplied black-and-gold reference and translate its content hierarchy into an original Gorilla Gear homepage.
- [x] Create original hero and collection artwork for Supplements, Clothing, and Coaching.
- [x] Rebuild the public homepage with the requested mockup copy and no public anabolics or Trusted Brands section.
- [x] Preserve member-only access to the private catalogue and verify desktop/mobile layouts, tests, and checkpoint.

## Active Implementation — Coaching Enquiry and Collection Enhancement
- [x] Verify the approved Gorilla Gear logo asset and inspect current coaching/data patterns.
- [x] Build a public Coaching enquiry/application form with protected admin review access.
- [x] Replace the temporary navbar mark with the approved logo lockup and enhance all three collection blocks.
- [x] Add regression coverage, verify desktop/mobile states, and save a checkpoint.

## Active Implementation — Hero Refinement
- [x] Refine the hero background visual with an original dark gym composition aligned to the supplied reference.
- [x] Reduce headline scale slightly while preserving responsive hierarchy and readability.
- [x] Verify desktop/mobile hero composition, run regression coverage, and save a checkpoint.

## Active Implementation — Hero Member Benefits
- [x] Define concise approved-membership benefits without referencing private products publicly.
- [x] Add a premium responsive benefits strip beneath the hero calls to action.
- [x] Add regression coverage, verify desktop/mobile balance, and save a checkpoint.

## Active Implementation — Mobile Homepage and Hero Refresh
- [x] Review mobile homepage spacing, touch targets, image crops, and content hierarchy.
- [x] Generate a replacement original hero visual without an unlabelled product bottle.
- [x] Apply mobile-first homepage refinements and the new hero visual.
- [x] Verify phone, tablet, and desktop layouts, run regression coverage, and save a checkpoint.

## Active Implementation — PayFast and Instant EFT Repair
- [x] Inspect PayFast request generation, merchant configuration handling, and current EFT behavior.
- [x] Route Pay via EFT to PayFast Instant EFT when available and retain manual EFT proof-upload fallback.
- [x] Add clear customer guidance for PayFast merchant activation errors without exposing credentials.
- [x] Add regression coverage, verify mobile payment controls, and save a checkpoint.

## Active Verification — Checkout, PayFast, and Tracking Workflow
- [x] Verify order payment selection, PayFast/Instant EFT request construction, and manual EFT proof fallback without a live charge.
- [x] Verify payment-status, dispatch, tracking-number, and customer timeline propagation.
- [x] Correct the customer timeline so a pre-dispatch tracking number remains clearly marked as dispatch pending.
- [x] Verify mobile and desktop customer/admin payment and tracking surfaces.
- [x] Document the results and remaining PayFast merchant activation dependency.

## Active Implementation — Supplied Apparel Homepage Images
- [x] Upload the supplied mannequin and two-view model apparel images to managed web storage.
- [x] Set the mannequin apparel image as the Clothing collection card background.
- [x] Set the two-view branded apparel model image as the hero background with responsive text-safe overlays.
- [x] Verify desktop/mobile image framing and save a checkpoint.

## Active Implementation — Header Logo Replacement
- [x] Extract the supplied PDF logo and upload a web-ready high-resolution asset.
- [x] Replace the current header logo with the supplied asset and remove the adjacent Gorilla Gear wordmark text.
- [x] Verify desktop/mobile header alignment and save a checkpoint.

## Active Implementation — White Header Navigation
- [x] Audit current header, navigation, account, cart, and mobile-menu color states.
- [x] Apply a white header with dark navigation text and high-contrast control styling.
- [x] Verify desktop/mobile contrast, interactions, and regression coverage, then save a checkpoint.

## Active Implementation — Transparent Logo and Navigation Refinement
- [x] Create a transparent approved logo variant for the header and footer.
- [x] Apply white/dark styling to dropdown and footer navigation elements.
- [x] Replace white-backed logo placements and verify responsive contrast and blending.
- [x] Run regression coverage and save a checkpoint.

## Active Implementation — Unified Footer Contrast
- [x] Match the footer background to the logo block charcoal tone.
- [x] Recalibrate footer text, navigation links, icons, and dividers for readable contrast.
- [x] Verify desktop/mobile footer readability, run regression coverage, and save a checkpoint.

## Active Implementation — White Footer Alignment
- [x] Align the footer background with the white header background.
- [x] Convert footer text, links, icons, dividers, and legal labels to dark readable colors.
- [x] Verify desktop/mobile footer readability, run regression coverage, and save a checkpoint.

## Active Implementation — Dashboard Brand Alignment
- [x] Audit dashboard layouts, shared theme tokens, and status color usage.
- [x] Apply branded white, charcoal, dark-text, and gold-accent styling to admin and customer dashboards.
- [x] Verify responsive dashboard layouts, status readability, and regression coverage.
- [x] Save and deliver the dashboard brand alignment checkpoint.

## Active Implementation — Admin Orders and Applications Palette Extension
- [x] Audit the Admin Orders and Applications components, including status controls and mobile states.
- [x] Apply the white, charcoal, dark-text, and gold-accent system to Orders and Applications management workflows.
- [x] Verify desktop/mobile management pages and regression coverage.
- [x] Save and deliver the admin management palette checkpoint.

## Active Implementation — Catalogue Management Palette Extension
- [x] Audit Admin Products, Categories, and bulk-import components, including upload and validation states.
- [x] Apply the white, charcoal, dark-text, and gold-accent system to catalogue management workflows.
- [x] Verify desktop/mobile workflows, error states, and regression coverage.
- [x] Save and deliver the catalogue management palette checkpoint.

## Active Assessment — iKhokha Payment Gateway Replacement
- [x] Verify iKhokha online-payment products, API access, and merchant-account requirements.
- [x] Assess compatibility with the quote-to-order payment, notification, and order-tracking workflow.
- [x] Present prerequisites and a recommended replacement plan before changing the live payment gateway.

## Active Implementation — iKhokha Payment Gateway
- [x] Store iKhokha API credentials securely and verify the integration contract.
- [x] Replace PayFast payment creation and callback reconciliation with iKhokha iK Pay API handling.
- [x] Update customer payment controls to use iKhokha while retaining Manual EFT proof uploads.
- [x] Verify the quote-to-payment workflow, regression coverage, and responsive customer controls without a live charge.
- [x] Save and deliver the iKhokha integration checkpoint.

## Active Implementation — iKhokha Payment Audit and Checkout Feedback
- [x] Audit admin payment data, navigation patterns, and customer checkout state handling.
- [x] Add an admin iKhokha payment-attempt audit view with reference, hosted-link, amount, and status details.
- [x] Add a loading animation and clear customer messaging while iKhokha payment links are generated.
- [x] Verify desktop/mobile views and regression coverage without a live payment.
- [x] Save and deliver the iKhokha audit and checkout-feedback checkpoint.

## Active Verification — iKhokha Webhook and Callback Configuration
- [x] Inspect generated production callback URLs, endpoint availability, and webhook handler configuration.
- [x] Confirm secure status reconciliation and order-update safeguards without creating a payment.
- [x] Report verified configuration and any required merchant-dashboard action.

## Active Review — iKhokha Failed Transaction Handling
- [x] Audit failure, cancellation, expiry, duplicate callback, malformed payload, and audit-record handling.
- [x] Implement required recovery, idempotency, or operational notification safeguards.
- [x] Validate failed-transaction and retry behavior without creating a payment.
- [x] Report the final error-handling configuration and any live-test conditions.

## Active Fix — Quote Submission Order-Item Insert Failure
- [x] Inspect the reported order-item insertion error, affected product data, and database schema.
- [x] Correct the quote line-item snapshot mapping or schema mismatch safely.
- [x] Verify quote creation and regression coverage without starting a payment.
- [x] Save and deliver the quote-submission fix checkpoint.

## Active Implementation — Admin Quote Triage and Catalogue Image Sourcing
- [x] Audit Admin Orders states and product-image coverage by brand and product.
- [x] Add an awaiting-approval filter and visual highlight for newly submitted quotes in Admin Orders.
- [x] Research official and authorised product imagery and assemble a confidence-ranked brand/product match manifest.
- [x] Apply high-confidence images through managed storage and document unmatched or uncertain records.
- [x] Verify responsive Admin Orders behaviour, catalogue images, and regression coverage.
- [x] Save and deliver the Admin Orders and catalogue-image sourcing checkpoint.

## Active Implementation — Quote Submission Success Modal
- [x] Audit quote submission data, mutation response, and existing dialog patterns.
- [x] Add a branded quote-success modal with a clear submitted-quote summary and next steps.
- [x] Verify modal accessibility, responsive behavior, navigation actions, and regression coverage.
- [x] Save and deliver the quote-success modal checkpoint.

## Active Implementation — Mobile Alignment and Experience Refinement
- [x] Audit public, customer, and admin views for mobile alignment, spacing, and touch-target consistency.
- [x] Centre appropriate customer-facing mobile content and refine mobile form, card, and action layouts.
- [x] Verify phone layouts, form usability, and responsive regression coverage.
- [x] Save and deliver the mobile optimisation checkpoint.

## Active Implementation — Remaining Catalogue Image Deep Search
- [x] Refresh the exact product inventory still missing a primary catalogue image.
- [x] Research official and authorised product imagery at brand and product level with confidence scoring.
- [x] Apply only clean, exact high-confidence matches through managed storage.
- [x] Document uncertain and unmatched products, then verify updated catalogue coverage.
- [x] Save and deliver the remaining catalogue image research checkpoint.

## Active Implementation — OT and KH Image Sourcing Follow-up
- [x] Refresh the exact OT and KH records still missing a primary image.
- [x] Research official brand and authorised distributor product imagery with confidence scoring.
- [x] Apply clean, exact high-confidence OT and KH matches through managed storage.
- [x] Verify updated coverage and document uncertain or unresolved OT and KH records.
- [x] Save and deliver the OT and KH image-sourcing checkpoint.

## Active Reporting — Production Readiness
- [x] Reconcile current project state with verified security and workflow audit evidence.
- [x] Prepare a production-readiness report covering remediations, blockers, and live validation requirements.
- [x] Deliver the readiness report with a go-live validation sequence.

## Active Implementation — Security Hardening Reapplication
- [x] Confirm the restored baseline and prepared security remediation set.
- [x] Reapply dependency, login, upload, session, header, and request-size safeguards.
- [x] Verify security regression coverage, production build, and dependency audit state.
- [x] Save and deliver the security-hardening checkpoint.

## Active Fix — Quote and Order Item Visibility
- [x] Trace the missing line-item data across order detail queries and both customer/admin views.
- [x] Restore itemised product, strength, quantity, unit-price, and line-total display for quotes and orders.
- [x] Verify responsive item lists, calculated totals, and regression coverage.
- [x] Save and deliver the quote-item visibility checkpoint.

## Active Verification — End-to-End Quote Submission
- [x] Select an approved test account and in-stock catalogue product.
- [x] Submit a controlled quote through the application workflow without payment.
- [x] Verify saved items, delivery details, customer/admin visibility, and payment readiness.
- [x] Report the end-to-end test outcome and any remaining external conditions.

## Active Verification — Live SMTP Quote Confirmation
- [x] Inspect SMTP transport configuration and the quote-confirmation email trigger path.
- [x] Correct any SMTP configuration or trigger issues.
- [x] Verify authenticated SMTP delivery with a controlled quote-confirmation email.
- [x] Report the live delivery result and remaining external prerequisites.

## Active Verification — Final Frontend Journey and Deployment Readiness
- [x] Prepare an approved frontend test account and controlled in-stock product cart.
- [x] Submit a controlled quote through the customer-facing frontend.
- [x] Verify database persistence, SMTP acceptance, and item detail rendering in customer/admin views.
- [x] Produce a final deployment-readiness report with verified controls and external prerequisites.
- [x] Save and deliver the final readiness checkpoint and report.

## Active Implementation — Supplements Category Shop
- [x] Audit supplement category records, product filtering, and the homepage collection configuration.
- [x] Upload the supplied NutriTech lifestyle image to managed storage and apply it to the Supplements collection block.
- [x] Build a responsive Supplements shop page that displays all Supplement-category products.
- [x] Link the homepage Supplements entry points to the new category shop.
- [x] Verify filtering, navigation, mobile presentation, and regression coverage.
- [x] Save and deliver the Supplements category shop checkpoint.

## Active Implementation — Supplements Range Import
- [x] Inspect the supplied supplement-range screenshot and reconcile every listed item against the current catalogue.
- [x] Create or update each listed supplement with its quantity, strength, description, price, and Supplements category mapping.
- [x] Verify all listed supplements render on the Supplements shop across desktop and mobile.
- [x] Save and deliver the Supplements range import checkpoint.

## Active Implementation — Supplements Inventory and Quick View
- [x] Audit the Supplements records and existing product-card architecture.
- [x] Set Blue Magic Pre Workout to R450 and all newly imported supplement products to 100 units.
- [x] Add accessible quick-view modals and hover interactions to Supplements shop product cards.
- [x] Verify inventory, quick-view behavior, responsive presentation, and regression coverage.
- [x] Save and deliver the Supplements inventory and quick-view checkpoint.

## Active Implementation — Verified Supplements Imagery
- [x] Audit the remaining supplement-card image gaps and existing managed assets.
- [x] Research and validate official or authorised imagery for each unresolved supplement product.
- [x] Leave Alpha Pro Workout without an image until the client uploads approved artwork.
- [x] Upload and assign verified main images with provenance retained.
- [x] Verify image rendering, coverage, and regression behaviour on the Supplements shop.
- [x] Save and deliver the verified supplement imagery checkpoint.

## Active Implementation — Mobile Footer Navigation Removal
- [x] Locate the fixed mobile footer navigation and related reserved layout space.
- [x] Remove the redundant fixed footer navigation from mobile views.
- [x] Verify header-based mobile navigation, page layout, and regression coverage.
- [x] Save and deliver the mobile navigation cleanup checkpoint.

## Active Implementation — Mobile Header Labels and Approved-Member Navigation
- [x] Audit mobile header labels, controls, and approved-member test access.
- [x] Refine mobile header labels and accessible navigation cues.
- [x] Test shop, cart, account, and menu navigation with an approved member session.
- [x] Save and deliver the mobile header refinement checkpoint.

## Active Implementation — Locked Private Member Catalogue
- [x] Audit the homepage collection layout, existing Shop links, and approved catalogue access.
- [x] Prepare a managed visual asset for the locked private catalogue block.
- [x] Build the responsive locked catalogue block and member-aware Shop navigation.
- [x] Verify visitor and approved-member states across homepage, header, and mobile layouts.
- [x] Save and deliver the locked catalogue homepage checkpoint.

## Active Implementation — Public Shops and Protected Purchase Flow
- [x] Audit Supplements/Apparel public browsing, product-detail quote controls, and member gating.
- [x] Restore the missing public Apparel shop route so Clothing browsing works without membership.
- [x] Refine navigation and product-action guidance for visitors, pending members, and approved members.
- [x] Verify public shop browsing and protected quote/dashboard flows across desktop and mobile.
- [x] Save and deliver the public-shops and protected-purchase checkpoint.

## Active Implementation — Branded Membership Application Page
- [x] Audit registration-page layout, legacy color usage, and application safeguards.
- [x] Apply the Gorilla Gear white, charcoal, and gold system to the page and form states.
- [x] Verify responsive presentation, accessibility, and registration regression coverage.
- [x] Save and deliver the branded application-page checkpoint.

## Active Implementation — Private Catalogue Full-Range Background
- [x] Define the managed background-asset requirements for the locked private catalogue block.
- [x] Generate and apply a text-free premium visual representing injectables, orals, SARMs, peptides, and related range formats.
- [x] Verify desktop and mobile readability of the locked catalogue block with the new background.
- [x] Save and deliver the private catalogue background checkpoint.

## Active Implementation — Full Range Parallax and Hover Interaction
- [x] Audit the Full Range block structure and existing background layering.
- [x] Add reduced-motion-safe parallax and subtle hover background brightening.
- [x] Verify motion, contrast, mobile behaviour, and regression coverage.
- [x] Save and deliver the Full Range interaction checkpoint.

## Active Implementation — Mobile Parallax Performance
- [x] Profile Full Range parallax rendering on mobile and identify avoidable rendering work.
- [x] Apply mobile-safe parallax optimizations while preserving desktop quality.
- [x] Verify optimized mobile motion, reduced-motion behavior, and regression coverage.
- [x] Save and deliver the mobile parallax performance checkpoint.

## Active Audit — Mobile Homepage Performance
- [x] Establish a device-emulated mobile performance baseline and record the audit method.
- [x] Analyze loading, interaction timing, and render costs for the mobile homepage and Full Range section.
- [x] Apply and verify any evidence-based performance optimization.
- [x] Prepare and deliver the mobile performance audit findings.

## Active Implementation — Global Gorilla Gear Palette Consistency
- [x] Audit the Products page and related customer/admin source styles for legacy non-semantic blue and red colors.
- [x] Replace legacy non-semantic colors with Gorilla Gear white, charcoal, and restrained gold.
- [x] Verify Products, customer flows, admin views, and responsive styling for palette consistency.
- [x] Save and deliver the global Gorilla Gear palette consistency checkpoint.

## Active Implementation — Simplified Homepage Hero
- [x] Locate the hero member-benefit block and evaluate surrounding spacing.
- [x] Remove the three hero member-benefit blocks and rebalance the layout.
- [x] Verify the simplified hero across desktop and mobile with regression coverage.
- [x] Save and deliver the simplified hero checkpoint.

## Active Implementation — Hero Scroll Cue and Section Entrance
- [x] Audit the hero-to-next-section structure and existing motion behavior.
- [x] Add a gold-and-charcoal scroll cue and reduced-motion-safe next-section entrance animation.
- [x] Verify scroll experience, responsive layout, reduced-motion behavior, and palette consistency.
- [x] Save and deliver the hero transition and scroll-cue checkpoint.

## Active Media — White T-Shirt Multi-Angle Gallery
- [x] Confirm the white T-shirt reference asset and define front, left-side, right-side, and back views.
- [x] Generate a consistent four-angle white Gorilla Gear T-shirt gallery.
- [x] Review the angle set and prepare approved images for product-gallery use.
- [x] Deliver the white T-shirt multi-angle images.

## Active Media — White T-Shirt Right-Sleeve Correction
- [x] Confirm the duplicated side image and the required true right-sleeve composition.
- [x] Generate and assign the corrected right-sleeve product view.
- [x] Deliver the corrected four-angle white T-shirt gallery.

## Active Audit — Final Go-Live Readiness
- [x] Review deployed baseline, release state, and audit scope.
- [x] Test technical quality, security controls, dependencies, and production build.
- [x] Verify critical user, member, admin, catalogue, quote, payment, email, and mobile workflows.
- [x] Inspect live-domain configuration, static-asset behavior, and key public routes.
- [x] Produce and deliver the final go-live readiness report with verified pass criteria and remaining conditions.

## Audit Remediation — iKhokha-Only Checkout
- [x] Remove active manual EFT and proof-of-payment customer/server paths while retaining historical records.
- [x] Prevent unauthenticated and unapproved users from receiving the private `/products` catalogue data or route content.
- [x] Route the homepage Shop Clothing call to the public Apparel storefront.
- [x] Replace residual non-semantic blue and cyan admin order-status styling with the Gorilla Gear palette.
- [x] Re-run payment, public-access, and full regression checks after the audit remediation.

## Navigation Refinement — Apply Access
- [x] Remove the duplicated desktop Apply navigation item while retaining the header Apply Access call-to-action.
- [x] Keep a clear Apply for Access action in the mobile hamburger menu.
- [x] Verify desktop and mobile navigation layouts and regression coverage.

## Navigation Enhancement — Motion and Member Status
- [x] Add reduced-motion-safe slide-down animation and backdrop blur when the mobile hamburger menu opens.
- [x] Add a restrained glow and colour-shift hover treatment to the desktop Apply Access button.
- [x] Add a dynamic mobile application-status indicator for pending applicants.
- [x] Verify interaction, accessibility, desktop/mobile visuals, and regression coverage.

## Navigation Enhancement — Approval Notifications
- [x] Add an approval-specific notification badge to the account icon.
- [x] Add reduced-motion-safe click feedback to the Apply Access button.
- [x] Make the mobile application-status row link directly to detailed account progress.
- [x] Verify account-state behaviour, interaction feedback, desktop/mobile visuals, and regression coverage.

## Catalogue Data — Category Normalization
- [x] Audit all active category names, duplicate filters, and product assignment counts.
- [x] Map active products to Injectables, Orals, SARMs, Peptides, Fat Loss, Healthcare, Supplements, or Clothing.
- [x] Consolidate duplicate or legacy categories without changing prices, inventory, orders, or historical records.
- [x] Verify the private catalogue and public collection filters after normalization.

## Customer Inventory Privacy
- [x] Audit all customer-facing stock quantities and availability language.
- [x] Remove customer-facing stock counts while preserving stock validation and administrator inventory tools.
- [x] Verify product, cart, and quote interfaces no longer reveal unit quantities.

## Catalogue Data — Supplier Retirement
- [x] Audit Biolabs and Genesis products, images, filters, and historical record relationships.
- [x] Retire Biolabs and Genesis from active customer and administrator catalogue data without harming historical orders.
- [x] Verify their products and brand filters are absent from customer and admin catalogue surfaces.

## Membership Registration — Password Requirement
- [x] Audit all registration and account-password validation rules for the incorrect 32-character minimum.
- [x] Change the customer password requirement and guidance to a minimum of 8 characters.
- [x] Verify valid 8-character passwords pass while shorter values are rejected.

## Membership Registration — Completion Experience
- [x] Verify password visibility controls in the registration form.
- [x] Add a clear success message and automatic redirect to sign in after a successful application.
- [x] Test registration controls, confirmation messaging, and redirect timing on desktop and mobile.

## Catalogue Performance — Product Images
- [x] Measure product-list image payloads, loading behaviour, and customer-visible bottlenecks.
- [x] Optimise catalogue image loading and rendering without changing managed product assets.
- [x] Verify desktop and mobile image load behaviour and record the measured outcome.

## Customer Image Delivery — Investigation
- [x] Compare customer and administrator managed-image URLs, response behavior, and client rendering paths.
- [x] Correct the customer-specific logo and product image delivery failure with safe fallback behavior.
- [x] Verify approved customer and administrator image rendering on desktop and mobile.

## Customer Image Delivery — Live Incident Follow-Up
- [x] Reproduce the live logo and product-image failure and capture the production response path.
- [x] Implement a browser-compatible image delivery repair that works for customer and administrator accounts.
- [x] Verify image rendering on product list and detail pages before release.

## Website Performance — Overall Optimization
- [x] Measure current production build, route payloads, and runtime bottlenecks.
- [x] Optimize initial load, route loading, assets, and runtime rendering with low-risk changes.
- [x] Verify desktop/mobile performance and functional regressions.

## Security Remediation — Code Review Findings
- [x] Redact password hashes and password-reset token fields from `auth.me` responses.
- [x] Restrict the public media proxy to approved public asset keys with safe key validation and bounded upstream handling.
- [x] Replace process-local login and password-reset throttling with bounded, production-safe abuse controls.
- [x] Add behavioral regression tests for sensitive-field redaction, media access boundaries, and rate-limit behavior.
- [x] Rerun type checks, full tests, dependency audit, production build, and targeted route verification.

- [x] Move ignored pnpm overrides and patches into supported workspace configuration.
- [x] Remove remaining `framer-motion` usage from the private catalogue route.

## Admin Bulk Import — Price Column
- [x] Add a `price` column to the Product template CSV and visible format guidance.
- [x] Parse and validate price values during bulk import while preserving existing duplicate and stock rules.
- [x] Add regression coverage for template output, valid prices, and invalid or blank prices.

## Admin Product Export — CSV
- [x] Add an admin-only product-list export using the name, category, dosageInfo, description, brand, and price columns.
- [x] Escape CSV values safely and preserve template-compatible price formatting.
- [x] Add regression coverage for export data and admin access.

## Admin Bulk Import — Category Guidance
- [x] Make the existing `category` template column explicit with approved category examples.
- [x] Verify Peptides, Injectables, and other taxonomy values are accepted by import parsing.
- [x] Add regression coverage for category guidance and parsing.

- [x] Render the bulk-import textarea example with a real line break and make the pre-preview finalize state visually clear.
- [x] Support standard table-formatted `.xls` and `.xlsx` files with headers as well as legacy section-formatted workbooks.

- [x] Reconcile the imported `ORAL STEROIDS` duplicate into the canonical `Orals` category and prevent future imports from creating duplicate taxonomy records.

- [x] Audit verified image sources for the newly imported private products; no safe exact matches were available, so the initials fallback remains until matching imagery is supplied.

## Active Implementation — UPA Catalogue Import
- [x] Inspect the uploaded UPA workbook and normalize its Brand, Category, Product name, Description, Strength, and Price fields.
- [x] Compare UPA workbook rows against existing products using normalized brand/name/category/strength keys and identify duplicates before import.
- [x] Create or reconcile the UPA brand without duplicate brand records and ensure it is available in the shop brand filter.
- [x] Import only genuinely new UPA products with verified category and price data; preserve existing matching products without duplication.
- [x] Audit existing UPA product images and link only exact UPA brand/product matches to UPA products.
- [x] Verify UPA filtering and representative product rendering on desktop and mobile, including customer stock privacy.
- [x] Harden the admin bulk-import procedure to preserve supported brand prefixes and skip or update existing normalized product matches instead of inserting duplicates on reruns.

## Next Catalogue Handoff
- [x] Process the next uploaded product list with workbook validation, exact-match duplicate protection, canonical category normalization, brand-filter reconciliation, and verified image linking.

## Active Implementation — Next Product List Import
- [x] Inspect and normalize the newly uploaded `.xls` workbook into Brand, Category, Product name, Description, Strength, and Price fields.
- [x] Compare every workbook row against the current product catalogue and classify exact or near duplicates before import.
- [x] Import only validated non-duplicate rows through the review-first workflow, preserving existing records and canonical categories.
- [x] Verify brand filtering, product images, prices, and representative storefront rendering for the imported list.
- [x] Normalize the source `PHARMACUTICALS` label to the canonical `Pharmaceuticals` brand and expose it in shop brand filtering while preserving the existing `Pharma -` product naming convention.

## Active Audit — Complete Brand and Product Structure PDF
- [x] Extract the complete brand, category, subcategory, and product hierarchy from the supplied PDF.
- [x] Audit the current database and storefront filter vocabulary against the supplied structure.
- [x] Classify products to retain, add, rename, reassign, or retire without changing data before approval.
- [x] Deliver a structure-only implementation plan for user approval before applying catalogue changes.

## Active Implementation — Approved Dual Taxonomy
- [x] Re-read full-stack, storage, and accessibility guidance and audit current catalogue contracts before schema changes.
- [x] Add first-class brands, subcategories, shop collections, aliases, and product assignment relations without removing the existing canonical family category.
- [x] Seed the approved 21-brand vocabulary, PDF subcategories, shop collections, and aliases idempotently.
- [x] Reconcile existing products to brand, subcategory, and shop collection assignments without duplicate products or destructive historical changes.
- [x] Extend admin and storefront filters, product views, exports, and bulk-import preview to use the new taxonomy.
- [x] Run migration integrity checks, tests, production build, and responsive storefront/admin verification.
- [x] Save and deliver the completed dual-taxonomy checkpoint.

- [x] Verify non-canonical active family categories are inactive and products are assigned to exactly the eight approved product families without deleting historical records.

## Active Deliverable — Updated Dual-Taxonomy CSV Template
- [x] Generate a downloadable CSV template matching the approved brand, category, subcategory, shop collection, product detail, and price columns.
- [x] Validate the header-only template contract, quoting, and compatibility with the current bulk-import preview.

## Active Deliverable — Populated Dual-Taxonomy Catalogue Export
- [x] Export all current active products into the approved dual-taxonomy CSV template.
- [x] Validate exported row completeness, prices, taxonomy fields, and duplicate safety without changing catalogue data.

## Active Implementation — Dual-Taxonomy Shop Sidebar Filters
- [x] Inspect the current shop filter state, taxonomy query contract, and responsive filter controls.
- [x] Add sidebar filters for canonical product family, brand, subcategory, and shop collection using relational taxonomy IDs.
- [x] Preserve search, price, pagination, public collection access, and approved-member gating while resetting results correctly on filter changes.
- [x] Add regression coverage and verify desktop, tablet, and mobile filter interactions with the Gorilla Gear palette.
- [x] Save and deliver the shop-sidebar filter checkpoint.
- [x] Make dual-taxonomy sidebar controls expose pressed states and ensure desktop/mobile search fields have unique accessible IDs.

## Active Correction — BP Pharma Rows 325–331
- [x] Inspect rows 325–331 in the populated dual-taxonomy export and identify the seven unmapped products.
- [x] Ensure the canonical BP Pharma brand exists and assign those seven products without duplicate product records.
- [x] Update the populated CSV rows, validate CSV integrity and BP Pharma filtering, and save a corrected checkpoint.

## Active Import — Corrected Populated Dual-Taxonomy CSV
- [x] Inspect the corrected populated CSV and confirm it matches the current importer contract.
- [x] Re-import the corrected CSV idempotently, updating matching products without creating duplicates.
- [x] Verify BP Pharma assignments and sidebar filter visibility on the shop page.
- [x] Save and deliver the import verification checkpoint.
- [x] Archive the three dependency-free duplicate Keifeitropin/HGH Fragment records revealed by the corrected CSV re-import, preserving the image-bearing canonical records and historical safety.

## Active Implementation — Shop Filter Controls
- [x] Inspect the existing filter state and shop-results layout for tag and reset insertion points.
- [x] Add removable active-filter tags at the top of the shop page.
- [x] Add a Clear All Filters button that resets search, price, brand, family, subcategory, collection, and pagination.
- [x] Add regression coverage and verify desktop/mobile accessibility and Gorilla Gear styling.
- [x] Save and deliver the filter-controls checkpoint.

## Active Refinement — Shop Sidebar Filter Order
- [x] Inspect the current filter-group order in the shop sidebar.
- [x] Reorder the groups to Brand, Category, then Shop collection without changing filter behavior.
- [x] Verify the order and accessibility on desktop and mobile, then save a checkpoint.

## Active Media Audit — Ouroboros Laboratories
- [x] Audit current Ouroboros products, strengths, image coverage, and existing media provenance.
- [x] Browse the supplied South African reference stores for Ouroboros product evidence and candidate imagery.
- [x] Match candidate images only when brand, product identity, and strength are safely verified.
- [x] Link verified Ouroboros images without duplicates, validate representative storefront rendering, and document unresolved products.
- [x] Unlink the two confirmed Alpha & Omega images from Ouroboros GHK-CU 100mg and MOTS-C 40mg, leaving safe initials fallbacks until exact Ouroboros imagery is supplied.
- [x] Save and deliver the Ouroboros Laboratories image-audit checkpoint.

## Active Media Audit — BP Pharma
- [x] Audit current active BP Pharma products, strengths, image coverage, and existing media provenance.
- [x] Browse the supplied South African reference stores for BP Pharma product evidence and candidate imagery.
- [x] Match candidate images only when BP Pharma brand, product identity, and strength are safely verified.
- [x] Correct unsafe or missing BP Pharma image links without duplicates, validate representative storefront rendering, and document unresolved products.
- [x] Unlink the three BP Pharma images that do not show attributable BP branding—GHK-CU 50mg, Retatrutide 32mg, and Semaglutide 6mg—and preserve safe initials fallbacks until exact BP imagery is supplied.
- [x] Save and deliver the BP Pharma image-audit checkpoint.

## Active Media Audit — Next Approved Brand
- [x] Identify the next approved brand after BP Pharma and audit its active products, strengths, image coverage, and media provenance.
- [x] Browse both supplied South African reference websites for the brand’s product evidence and candidate imagery.
- [x] Match candidate images only when brand, product identity, and strength are safely verified.
- [x] Correct unsafe or missing image links without duplicates, validate storefront rendering, and document unresolved products.

## Active Media Audit — Keifei Pharmaceuticals
- [x] Audit current active Keifei products, strengths, image coverage, and existing media provenance.
- [x] Browse both supplied South African reference websites for Keifei product evidence and candidate imagery.
- [x] Match candidate images only when Keifei brand, product identity, and strength are safely verified.
- [x] Correct unsafe or missing Keifei image links without duplicates, validate storefront rendering, and document unresolved products.
- [x] Check the 17 no-image Keifei records for exact matches and cart/order dependencies before any safe duplicate archival.
- [ ] Save and deliver the Keifei Pharmaceuticals image-audit checkpoint.
