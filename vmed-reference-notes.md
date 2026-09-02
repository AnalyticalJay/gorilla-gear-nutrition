# Vmed Image Audit Notes

## Initial catalogue audit

The active catalogue contains 66 Vmed products. All 66 currently have a primary image, including 14 links stored under the unrelated `cooper_images` folder. Thirty-one primary images use the existing `catalogue/drive-verified` path. The Cooper-folder links require brand-provenance review and must not be retained unless the visible packaging is clearly Vmed and the product identity and strength match.

The current Vmed catalogue is assigned to the Peptides family and Peptides subcategory. Representative records include BPC-157 5mg, CJC1295 / Ipamorelin 18mg, GHK-CU 50mg, GHRP6 5mg, Growth Hormone 100iu, IGF1 LR3 100mcg, KPV 15mg, Mechano Growth Factor 5000mcg, Melano Tan II 10,000mcg and nasal spray, MOTS-C 60mg, Retatrutide 30mg, and additional Vmed products to be matched against the source catalogues.

## Audit rules

Only exact or safely verified Vmed brand/product/strength matches may be linked. Unresolved products will retain a safe initials fallback, and no cross-brand image will be reused merely because the product name is similar.

## Reference-store search findings

Anabolics SA search for `Vmed` returned no matching products.

Anabolic Hyper search for `Vmed` returned one attributable Vmed listing: **Vmed Sibutralean**, with a visible V.MED package image and a 30 mg presentation. Source URL: https://anabolichyper.com/products/vmed-sibutralean. Candidate image source: https://anabolichyper.com/cdn/shop/files/1-23-600x831-1.jpg?v=1692957672&width=533.

The single source result is not enough to infer imagery for other Vmed products; each additional link must be verified independently.

## Contact-sheet findings

The current Vmed Cooper-folder contact sheet could not render any of the 14 legacy Cooper-folder paths through the application media proxy; every candidate returned HTTP 404. These paths are therefore not reliable customer-facing media and require removal or replacement rather than preservation.

The Anabolic Hyper product JSON endpoint returned no Vmed products in its first 250-product page, while the public search page exposed one Vmed Sibutralean listing. No broad reference contact sheet was available. The only directly attributable reference evidence currently found is the V.MED Sibutralean 30mg package, and it must only be linked if a matching active Vmed Sibutralean record exists.

## Exact Sibutra Lean match

The direct Anabolic Hyper page confirms the product is **V.MED LABS SIBUTRA LEAN (SIBUTRAMINE HCL 30MG/TAB=30TABS)** with visible V.MED packaging, a 30mg strength, and a 30-tablet presentation. The active site record **Vmed - Sibutra HCL** is 30 Tablets 30mg, so this is a safe exact identity-and-strength match despite the shorter site name. Reference URL: https://anabolichyper.com/products/vmed-sibutralean. Reference image URL: https://anabolichyper.com/cdn/shop/files/1-23-600x831-1.jpg?v=1692957672&width=1946.

## Verified storefront correction

The exact V.MED Sibutra Lean 30mg image was uploaded with a proxy-compatible `ggn-` key, relinked to product 1789 (`Vmed - Sibutra HCL`), and returned HTTP 200 as `image/jpeg`. The desktop product page visibly renders the V.MED SIBUTRA LEAN 30mg package, with the Vmed brand label, Orals family metadata, dosage information, price, and no stock quantity exposed.

The remaining 14 Cooper-folder links cannot be verified as Vmed imagery: all returned HTTP 404 through the media proxy and no matching Vmed packaging was found in the supplied reference sites. They should be removed to preserve the initials fallback rather than retaining broken or cross-brand paths.

## Final Vmed verification

The active Vmed catalogue contains 66 products. After cleanup, 52 have primary images, 14 use safe initials fallbacks, and zero active Vmed products retain a Cooper-folder image link. Product 1789 (`Vmed - Sibutra HCL`) retains the exact V.MED Sibutra Lean 30mg reference image. Desktop and mobile screenshots confirm the replacement image renders correctly, while a representative unresolved CJC1295 / Ipamorelin record shows a clean initials fallback without broken-image UI or stock disclosure.
