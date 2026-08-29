# Storefront verification notes

- Unauthenticated `/products` correctly shows the private-catalogue access gate instead of private product cards.
- The public page exposes only the expected navigation and approved-member messaging; no customer stock quantities were visible.
- A representative product detail route uses `/products/:slug` (not `/product/:slug`).
- The unauthenticated representative private-product route did not expose product data in the browser; it remained within the gated shell.
- Read-only database sampling after the 53-product import found recent records in Injectables, Orals, Peptides, and SARMs. The sample products had names, descriptions, dosage/strength text, and prices, but no product images.
- A legacy active duplicate category `ORAL STEROIDS` was found with 17 products. Those products were reassigned to canonical `Orals` (category id 7), and the duplicate category was deactivated. Canonical Orals now contains 273 active products; the duplicate contains 0.

## Browser and visual checks

- Desktop public `/products` browser session showed the intended private-catalogue lock screen when no session cookie was present.
- The managed preview screenshot session rendered the full catalogue and public collection pages. The private catalogue used the expected dark/charcoal and gold brand treatment, and the public Apparel page rendered both clothing cards with product imagery and R350 prices.
- Public Supplements rendered 13 products with prices and no stock quantities. Some supplement cards have placeholder/missing image states, which is separate from the newly imported 53-product batch.
- Detail screenshots for Deca 100 (Fast) NPP, BPC-157, Anapolon, and Cardarine - Endurobol rendered the correct category, name, price, description, dosage/strength, quantity controls, and Add to Quote action. No stock quantity was shown.
- Those four newly imported representatives had no product image rows in the database and therefore rendered the intended initials fallback (`AC`) instead of a product image. This is the main follow-up item from the storefront check.
- Mobile detail rendering remained readable and responsive, with the image fallback, category, price, description, dosage, quantity controls, Add to Quote button, and footer stacked correctly.
