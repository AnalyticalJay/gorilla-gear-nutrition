# HD Labs reference findings

## 2026-09-02/03 audit notes

The supplied Anabolics SA homepage was reachable and exposed broad product categories, but the visible product cards were not HD Labs-specific.

The supplied Anabolic Hyper HD Labs collection was reachable at https://anabolichyper.com/collections/hd-labs. It showed 57 HD Labs products and exact packaging imagery for multiple catalogue items, including HD Labs Cialis Tabs, HD Labs Clomid Tabs, HD Labs Testaject 250, HD Labs Deca-Durabolin 100, and HD Labs Sustanon 250. The collection’s visible image URLs are Shopify CDN assets and should only be used if the packaging and product identity are exact matches.

The current application database has 74 active HD-labelled products. A primary-image audit found 66 with a primary image and 8 without any image: HD - CJC-1295 with DAC, HD - GHRP-6, HD - HGH Fragment, HD - IGF-1 Lr3, HD - Creatine, HD - D3, HD - Slim Tabs, and HD - ZMA. No image was linked for these eight because the reference evidence inspected so far did not establish an exact HD Labs packaging match.

The Clomid detail-page rendering issue was caused by two image rows on product 1831: a broken/non-attributable secondary media URL was returned before the verified primary image. The server now orders primary images first, then creation time and ID, and the client marks failed image rows and displays a brand-safe initials fallback instead of a broken image icon.

## iPharma follow-up audit

BodyPharm is the next taxonomy brand after HD Labs but currently has zero active products, so no image audit or data change was required for that empty brand. The next populated brand, iPharma, has seven active products and seven existing primary-image rows.

Anabolic Hyper provided exact packaging matches for three iPharma products: Retatrutide 30mg Pen, Tirzepatide 30mg Pen, and Izempic 5mg Pen. Their images were downloaded, re-uploaded under proxy-approved `ggn-` storage keys, and relinked to product records 1897, 1898, and 1900 without adding duplicate image rows. The secure proxy returned HTTP 200 with the expected JPEG/PNG content types for all three assets, and responsive product-detail screenshots confirmed the images render correctly.

No exact matches were confirmed for iPharma Tirzepatide Self Mix Vial, Ozempic Self Mix Vial, Ozempic/Tirzepatide Hybrid, or GHK-CU Pen, so their existing safe fallbacks remain unchanged.

## Pharmacom follow-up audit

The next populated taxonomy brand, Pharmacom, contains 39 active products. Both supplied reference stores were checked across the full worklist. No exact Pharmacom package-and-strength match was found for 38 products. The single initially failed lookup, PC - Test C 250 (10ml Vial 250mg), was retried directly on Anabolic Hyper; the results showed Keifei, UPA, and Oxygen Labs alternatives only, not Pharmacom. It was therefore recorded as no exact match.

No Pharmacom image associations were changed. Existing primary images remain in place because the available reference evidence did not establish attributable Pharmacom packaging, and cross-brand substitution would be unsafe.

## Cooper Pharmaceuticals follow-up audit

Cooper Pharmaceuticals has 42 active products. All 42 were checked against both supplied reference stores; no exact Cooper package-and-strength matches were confirmed, so no external images were linked and no cross-brand substitutions were made. Existing Cooper archive imagery remains associated with the matching Cooper records.

The audit exposed a separate delivery issue: 117 legacy Cooper image rows used `/manus-storage/cooper/` or `/manus-storage/cooper_images/` paths with `.jfif` extensions. The secure proxy previously rejected these prefixes and did not recognize JFIF, causing valid brand-specific artwork to fall back. The proxy now explicitly allows the two Cooper product-image prefixes, recognizes JFIF as `image/jpeg`, and retains the existing traversal, query-string, size, and private-prefix protections. Representative injectable, oral, peptide, and healthcare Cooper pages now render correctly on mobile.

## DEX Pharma audit

DEX Pharma has five active products, and all five currently had one primary image association. Both supplied reference stores were checked. Exact brand-and-strength evidence was found through clearly attributable secondary South African product pages for all five products: GHK-CU 100mg Pen, Retatrutide Pen 50mg, SLU-PP Pen 5mg, Tirzepatide Max Pen 60mg, and Wolverine Pen 30mg. The source pages and direct image URLs are recorded in `audit_dex_pharma_media.json`.

The five source images were downloaded, re-uploaded under proxy-approved `ggn-dex-...` managed storage keys, and relinked to the existing primary rows for product IDs 2003–2007 without adding duplicate image records. All five media routes returned HTTP 200 with the expected JPEG/PNG content types. Mobile product-detail screenshots confirmed the exact DEX Pharma artwork renders for every product, with no stock quantities exposed.

## Pharmacom and Nutritech storefront media repair

The broken cards were caused by a secure media-proxy allowlist mismatch, not missing database associations. Pharmacom images use nested `new_brand_images/pharmacom/...` keys, while Nutritech images use root-level `nutritech-...` keys. Both prefixes were absent from the approved public media rules, so the browser received 404 responses even though each product had a primary image row. The proxy now permits the nested Pharmacom prefix and the narrowly scoped root-level Nutritech filename pattern. Regression tests cover both paths, representative live routes return HTTP 200 with the expected image types, and responsive product-detail checks confirm Nutritech imagery renders again.
