# Gorilla Gear Nutrition Homepage Direction

## Strategic Positioning

Gorilla Gear Nutrition should present itself as a **private, performance-focused South African nutrition catalogue** rather than a conventional open retail store. The homepage must make the value proposition clear before a visitor reaches the product catalogue: the range is curated, access is controlled, pricing is member-only, and orders move through an admin-reviewed quote process.

The tone should be **confident, disciplined, technical, and premium**. It should avoid exaggerated transformation claims, generic motivational language, fabricated social proof, or the visual language of a casual supplement marketplace. The brand promise is controlled access, clear process, serious standards, and dependable support.

## Visual Direction

| Element | Direction |
|---|---|
| Primary palette | Warm off-white catalogue background, near-black typography and navigation, Gorilla red-orange for action and emphasis, restrained acid-lime highlights for verification and status cues. |
| Typography | Compressed, uppercase, high-impact display headlines paired with compact technical labels and readable body copy. Use strong contrast between editorial headlines and small catalogue metadata. |
| Imagery | Dark, tactile product and category photography with real packaging evidence. Product imagery should feel physical and premium rather than like a generic hero mockup. |
| Layout | Editorial catalogue structure: asymmetric hero, disciplined full-width divider bars, consistent centered containers, strong section rhythm, and dense but readable information blocks. |
| Graphic language | Member-access cues, verification marks, catalogue labels, numbered process steps, status indicators, subtle industrial lines, and controlled red accent bars. |
| Motion | Short, restrained reveals and hover movement under 300ms. Motion should support hierarchy and product discovery, not turn the page into an animation showcase. |

## Homepage Content Structure

### 1. Global Navigation

The navigation should establish the brand immediately with the Gorilla Gear Nutrition logo and a compact wordmark. Primary destinations should be **Home**, **Shop**, and **Admin** where appropriate. Authentication state should remain visible through a member/account control, while the quote cart should remain accessible without competing with the main call to action.

The navigation must work for three access states: unauthenticated visitors should see the application path; pending applicants should see their review status; approved members should see the member catalogue and quote cart. The navigation should remain lightweight and usable on mobile, where the existing sticky bottom navigation can continue to provide persistent access.

### 2. Hero — “Fuel Your Potential”

The hero should lead with the concise headline **“Fuel Your Potential. Built to Perform.”** The primary message should explain that Gorilla Gear Nutrition is a private South African catalogue for serious athletes and dedicated fitness enthusiasts. The call to action should prioritize **Apply for Membership** or **Enter Member Catalogue** depending on authentication and approval state.

A secondary action may allow visitors to **Browse Products**, but it must not imply that pricing or ordering is open to unapproved users. The hero should include a tactile brand artifact: the Gorilla Gear Nutrition logo presented as a catalogue or member-access object, with category/product photography added when the final product assets are available.

Supporting proof points should be compact and factual: **Verified Range**, **Private Access**, **Fast Delivery**, and **Member Support**. The 18+ notice and controlled-access bar should be clear without dominating the hero.

### 3. Catalogue Preview — “Explore the Range”

This section should introduce the product catalogue immediately after the hero. When products exist, it should display a small featured selection using the existing product-card component and link to the full catalogue. When the copied database is empty, the section must show a deliberate empty state rather than blank space or fake products.

The empty state should read as operationally intentional: **“The New Range Is on Its Way.”** It should explain that product data and catalogue imagery will be uploaded from the admin panel and provide a clear **Open Catalogue** action. No placeholder prices, fake stock, fake reviews, or invented product claims should be used.

### 4. Category Discovery — “Find Your Focus”

The category grid should create visual entry points for the future product range. Initial category artwork can cover **Peptides**, **Injectable Oils**, **Orals**, and **Oral Anabolics**, with each tile using a dark, high-contrast image, a small numbered label, an editorial eyebrow, and a direct link to the catalogue.

Once products are uploaded, categories should be driven from the database where practical. The visual system should remain stable even as the number of products and categories grows.

### 5. Access Process — “Access Is Earned”

The homepage should explain the gated workflow in four simple steps: **Apply**, **Verify**, **Get Approved**, and **Request a Quote**. This section is essential because the platform does not operate as an unrestricted checkout store.

Each step should have a short, operational description. The section should make it clear that approved members unlock private pricing and ordering, while quote requests are reviewed before payment is enabled. The primary CTA should be **Start Your Application** for new visitors and should route to the existing registration flow.

### 6. Closing CTA — “Ready to Fuel Your Potential?”

The closing panel should restate the next action without introducing new claims. For visitors, the CTA should be **Apply for Membership**. For approved members, it should become **Enter Member Catalogue**. The supporting copy should reinforce the private catalogue, verified access, and member support model.

The closing panel should use the darkest surface in the palette with a controlled red-orange and lime atmospheric treatment. It should feel like a final access checkpoint rather than a generic newsletter or sales banner.

### 7. Footer

The footer should repeat the Gorilla Gear Nutrition logo, a short positioning statement, catalogue links, account links, and delivery/payment notes. Delivery messaging should preserve the operational rules: Port Elizabeth free delivery, other South African locations at a flat R150 rate, discreet packaging, and EFT or PayFast in ZAR where configured.

The footer should also retain the 18+ notice and the requirement for membership approval. It should avoid unsupported claims and should not contain fabricated reviews, ratings, partner logos, or trust badges.

## Access-State Rules

| Visitor state | Hero CTA | Catalogue treatment | Navigation emphasis |
|---|---|---|---|
| Unauthenticated | Apply for Membership + Browse Products | Show catalogue or intentional empty state; keep member pricing gated. | Apply and Sign In. |
| Pending approval | Application Pending Review | Show catalogue access without implying approval or payment access. | Review status and sign out. |
| Approved member | Enter Member Catalogue | Show products, member pricing, and quote-cart actions. | Shop, Account, and Quote Cart. |
| Rejected or inactive | Contact / sign out path | Keep pricing and ordering unavailable. | Account status and support path. |

## Product and Asset Re-upload Readiness

The homepage should not depend on hardcoded product records. Product previews should consume the existing typed procedures, and the empty state should remain valid until the catalogue is re-uploaded. Uploaded product imagery should continue to use managed storage rather than local project assets.

When the user uploads the Gorilla Gear Nutrition products and images, the next pass should verify filename matching, category assignment, image fallbacks, product-card cropping, mobile card density, and the approved-member pricing gate. The homepage structure should remain unchanged unless the uploaded catalogue reveals a stronger category hierarchy.

## Content Guardrails

Use direct, specific copy. Do not promise medical outcomes, guaranteed performance, guaranteed results, or unsupported product quality claims. Do not add customer reviews, ratings, testimonials, social-proof counters, or invented order history. Keep health, age, access, payment, and delivery language accurate and aligned with the existing application behavior.

## Success Criteria

The homepage is successful when a first-time visitor understands what Gorilla Gear Nutrition is, why access is controlled, how to apply, and what happens after approval within the first screenful. The homepage should feel distinctly ownable through the Gorilla Gear logo, red-orange accent system, industrial catalogue cues, and tactile category imagery, while remaining ready for a real product catalogue and the existing quote-based commerce flow.
