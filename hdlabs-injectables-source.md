# HD Labs Injectable Image Source Audit

Source page: https://take.app/hdlabsinternational/c/cm8ppj2d70000l80347gq1adn

The supplied page is titled “Injectables - HD Labs International” and exposes 20 injectable product cards in the extracted catalogue text: Testoviron 250; Sustanon 250; Deca-Durabolin 100; Superbulk 600; Supercutmix 300; Supersize 500; Supertest 500; Trestolone/Ment; Trinaject; Tren Acetate; Tren Enanthate; Testaject 250; Sustaject 325; Stanoject 50; Propioject 100; Nebidoject 250; Primoject 100; Primoject 200; Nandroject 300; and Mastaject 100.

The page exposes product image URLs through CDN-backed image elements and product detail links. The import must remain brand-scoped to HD Labs and name-scoped to existing injectable products; no image should be linked when the catalogue match is ambiguous or absent.

The page was opened and visually inspected at the supplied URL on 2026-08-12. Full browser HTML is available at /home/ubuntu/browser_html/take_app_cm8ppj2d70000l80347gq1adn_1786568532982.html for deterministic parsing of image URLs and product card metadata.

## Import Result

The strict HD-branded matcher found **9 safe matches**, **0 ambiguous matches**, and **11 source cards without an existing matching HD injectable product record**. The nine linked products are HD - Mastaject 100, HD - Nandroject 300, HD - Nebidoject 250, HD - Propioject 100, HD - Stanoject 50, HD - Sustaject, HD - Testaject, HD - Testolone/Ment (source card: Trestolone/Ment), and HD - Trinaject. The explicit aliases for Testaject 250, Sustaject 325, and Trestolone/Ment were validated against the existing product dosage/description fields.

The 11 unmatched cards were deliberately left unlinked: Testoviron 250, Sustanon 250, Deca-Durabolin 100, Superbulk 600, Supercutmix 300, Supersize 500, Supertest 500, Tren Acetate, Tren Enanthate, Primoject 100, and Primoject 200. No cross-brand or guessed associations were created.

The nine imported images are stored under `/manus-storage/hdlabs_injectables/` and database verification confirms one linked image per matched product. Representative Mastaject, Nandroject, Testaject, and Trinaject product pages were visually verified at 390px phone and 1280px desktop widths; the imported packaging images render correctly and the product detail layout remains responsive.
