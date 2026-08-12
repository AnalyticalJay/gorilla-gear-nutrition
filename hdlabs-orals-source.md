# HD Labs Orals Source

Source page: https://take.app/hdlabsinternational/c/cm8pnqtn50003l80341ogzaw1

The page is titled “Orals - HD Labs International” and exposes the following visible oral product cards: Anadrol50; Clenbuterol (two source cards); Anabolicum (LGD-4033); Andarine (S4); Cardarine (GW-501516); Nutrobal (MK-677); Ostarine (MK-2866); Stenabolic (SR-9009); Testolone (RAD-140); Anapolan (Oxymetholone); Anavar (Oxandrolone); Dianabol; Winstrol (Stanozolol); Arimidex (Anastrozole); Clomid (Clomiphene Citrate); DHEA 25mg; Femara (Letrozole); Halotest (Fluoxymesterone); and Helios T3 (Clen + Yohimbine + T3).

The source page exposes product-card image URLs and detail links. The two Clenbuterol cards must be treated as separate source assets and matched by strength/category metadata only if the existing HD catalogue supports a safe distinction. No image will be linked across brands or guessed to a product with ambiguous strength.

## Import Results

The source parser found 20 oral image cards. Seventeen image links were safely matched and linked to existing HD Labs oral/SARMS records. The three intentionally unlinked source cards were DHEA 25mg, Femara (Letrozole), and Helios T3; no corresponding safe HD Labs oral record was present, and Helios is represented in the catalogue under a non-oral injectable category.

Duplicate source cards were handled idempotently: both Clenbuterol cards were linked to the single HD oral Clenbuterol record, while Anadrol50 and Anapolan (Oxymetholone) were linked as verified alternate source images for the same HD - Anaps record after dosage alignment. The importer generated stable managed-storage keys and can be rerun without duplicate links.

Representative HD - Anaps, HD - Anavar, HD - LGD-4033 (Anabolicum), and HD - Clenbuterol pages were visually verified at phone and desktop widths. TypeScript validation and the complete Vitest suite pass: 103 tests across 33 files. The PayFast credential test was made deterministic by removing an external network availability check.
