# HD Labs Amps Source

Source page: https://take.app/hdlabsinternational/c/cm8pre95g0009ky039zx1oxe7

The page is titled “Amps - HD Labs International” and exposes three visible product cards: Testoviron 250, Sustanon 250, and Deca-Durabolin 100. Each card includes an image URL and a detail link. Matching must remain scoped to existing HD Labs Amps catalogue records and their dosage metadata; no cross-brand or guessed associations are permitted.

## Confirmed Detail Pages

Testoviron 250 detail page: https://take.app/en/hdlabsinternational/p/cm8prhf6j001wk20363kmcpf4
Confirmed price: R110.00. Confirmed strength: Testosterone Enanthate, 250mg per ml. Confirmed pack: 3 ampoules. The page describes HD Labs Testoviron 250 as containing Testosterone Enanthate and includes medical-use, supervision, and risk information.

Sustanon 250 detail page: https://take.app/en/hdlabsinternational/p/cm8prk2u50001kw03pvcnnwui
Confirmed price: R110.00. Confirmed strength: 250mg per ml. Confirmed pack: 3 ampoules. The page describes the testosterone-ester blend and lists the four ester components as 30mg propionate, 60mg phenylpropionate, 60mg isocaproate, and 100mg decanoate, along with medical-use and supervision information.

Deca-Durabolin 100 detail page: https://take.app/en/hdlabsinternational/p/cm8prmbqy000il8038h7suj81
Confirmed price: R135.00. Confirmed strength: Nandrolone Decanoate, 100mg per ml. Confirmed pack: 3 ampoules. The page describes medical uses and includes professional-supervision information.

All three official detail pages expose the same source image URLs as the Amps collection cards, confirming the image-to-product identity. These source details are the basis for the new catalogue records; no inferred brand or strength fields are needed beyond the page data.

## Responsive Verification Note

The first concurrent three-route phone capture showed Testoviron correctly, but the Sustanon and Deca-Durabolin screenshots appeared to display each other’s images. This may be a concurrent route-state/caching artifact or a product-image assignment issue. Sequential route captures are required before checkpoint; do not consider the visual verification complete until each slug is checked independently.

## Source Asset Identity Check

Visual inspection confirms `testoviron.png` clearly shows Testoviron 250mg/Testosterone Enanthate and three 1ml ampoules. Visual inspection confirms the downloaded `sustanon.png` file actually shows Deca-Durabolin 100mg/Nandrolone Decanoate and three ampoules, despite the source JSON assigning that URL to the Sustanon card. This confirms the source page/parser image mapping is reversed for at least Sustanon and Deca-Durabolin; the database links must be corrected using the visual asset identities, not the card URL order.

## Corrected Mapping Verification

The source page image URLs for Sustanon and Deca-Durabolin were reversed. The visually verified correction is: the Sustanon product receives the source asset ending `cm8prkijv000003jpc0d6hik8.png`, while Deca-Durabolin receives the asset ending `cm8prhvxq000703l1gofx4x1z.png`. The incorrect legacy rows were removed, the corrected rows were promoted to primary, and the importer was made idempotent against storage-generated hash suffixes. Sequential phone captures now show Sustanon with the Sustanon package and Deca-Durabolin with the Deca-Durabolin package.

## Final Product Page Verification

After correcting the reversed source asset mapping, sequential phone and desktop captures confirm that each new record displays the correct package image: Testoviron 250 shows Testoviron, Sustanon 250 shows Sustanon, and Deca-Durabolin 100 shows Deca-Durabolin. The three records render under INJECTABLE OILS with the confirmed R110/R110/R135 prices and source-backed dosage information. The first concurrent capture was treated as invalid for verification because it exposed the route-state race; sequential captures are the final evidence.
