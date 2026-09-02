# UPA Labs reference audit notes

## Sources reviewed
Anabolics SA search: https://www.anabolics-sa.co.za/?s=UPA+Labs&post_type=product
Anabolic Hyper search: https://anabolichyper.com/search?q=UPA%20Labs

## Initial findings
Anabolics SA returned six UPA listings in the visible search results: IGF-1 LR3, Femara 2.5, Test P 100, Trenbolone A 100, Trenbolone E 200, and Dianabol 15. The page exposed attributable UPA-labelled image URLs for each listing.

Anabolic Hyper returned 72 search results, with UPA-labelled listings including GHK-CU, Test E 300, BPC-157, Test Cyp 250, Retatrutide 30mg Self Mix, MOTS-C Self Mix, Ultimate Test 500, Cardarine, Nutrobal, TB-500/BPC-157 Hybrid, Test Prop 100, Tren E 200, Tirzepatide 30mg Self Mix, Retatrutide 60mg Self Mix, Dianabol 15mg/50 Tabs, Deca 330, TB-500, HGH 200iu, Max Cut 300mg, Semaglutide 5mg Self Mix, Tirzepatide 60mg Self Mix, Max Size 600mg, Sustanon 350, and Turinabol on the first page. The reference page shows UPA-branded packaging for the visible products, but exact product/strength matching remains required before linking any assets.

Current Gorilla Gear audit query identified 54 unique active UPA product IDs, but one product has duplicate primary image rows, producing 71 joined rows. Several UPA products currently use Cooper-folder imagery and require provenance review before retaining or removing those links.
## Complete Anabolic Hyper product JSON audit
Source: https://anabolichyper.com/products.json?limit=250
The fresh extractor filters product titles beginning with UPA and writes `/tmp/upa-reference-catalogue.json`. It captures exact titles, handles, variant data, and image URLs. The reference catalogue includes UPA products such as GHK-CU, Test E 300, BPC-157, Test Cyp 250, Retatrutide and Tirzepatide self-mix variants, MOTS-C, Ultimate Test 500, Cardarine, Nutrobal, TB-500/BPC-157 Hybrid, Test Prop 100, Tren E 200, Deca 330, HGH 200iu, Max Cut 300mg, Max Size 600mg, Sustanon 350, Turinabol, Dianabol 15mg/50 Tabs, Max Bulk 600mg, NPP 100, Primobolan 200, Tren Acetate 100, Masteron E 200, Masteron Prop 100, Equipoise 320, Test Undeconate 250, and related UPA orals/SARMs. Each extracted reference product has a Shopify CDN image URL where available; the exact URL-to-title mapping is retained in `/tmp/upa-reference-catalogue.json` for deterministic matching.
## Storefront verification after relinking
Representative product-detail screenshots rendered the exact UPA-branded packaging for Anabolicum (LGD), Cardarine, CJC1295 DAC, GHRP6, Letrozol-Femara 2.5, Masteron P 100, Testolone (RAD 140), and Viagra. The displayed product names and dosage details matched the current catalogue records, and the images loaded through the application media route. All twelve proxy checks for the newly uploaded UPA assets returned HTTP 200 with image/jpeg or image/png. UPA - MGF remains intentionally unresolved with no image link because the supplied reference catalogue did not expose an exact UPA MGF product image. The duplicate no-image UPA - Tren A 100 record (ID 240015) remains to be dependency-checked before possible safe archival; it is not linked to an image.
## Mobile storefront verification
Mobile screenshots at 390×844 confirmed branded imagery for Anabolicum, CJC1295 DAC, Letrozol-Femara, Masteron P 100, and Viagra. Images remain contained without clipping, product names wrap correctly, prices and dosage panels remain readable, and no stock quantities are shown. The UPA brand label and taxonomy metadata remain visible on the detail pages.
