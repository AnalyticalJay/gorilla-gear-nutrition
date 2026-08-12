# HD Labs SARMS Source

Source page: https://take.app/hdlabsinternational/c/cm8rp768q0002ky03yk17ea2i

The page is titled “SARMS - HD Labs International” and exposes seven visible product cards: Anabolicum (LGD-4033), Andarine (S4), Cardarine (GW-501516), Nutrobal (MK-677), Ostarine (MK-2866), Stenabolic (SR-9009), and Testolone (RAD-140). Each card includes an image URL and a detail link. Matching must remain scoped to the existing HD Labs SARMS catalogue records and their dosage metadata; no cross-brand or guessed associations are permitted.

## Visual Verification

The parsed SARMS source contains seven product cards. Mobile verification showed loaded HD imagery for Cardarine, Anabolicum, and Testolone; the first Andarine capture was a transient loading state. A subsequent desktop verification loaded Andarine, Cardarine, and Testolone with correct SARMS labels, product names, dosage information, and Add to Quote controls. The Anabolicum desktop route showed a transient auth/loading shell during the multi-route capture and requires one isolated recheck before finalizing the import audit.

The isolated desktop recheck loaded HD - LGD-4033 (Anabolicum) correctly with its orange HD Labs package image, SARMS category, 50 Tablets 5mg dosage, and Add to Quote action. The transient multi-route shell was therefore not a product-image mismatch.

## Final Audit

The Ostarine record initially contained an invalid null-key Cooper image row marked primary alongside the verified HD Labs image. The invalid row was removed, the verified HD Labs Ostarine image was promoted to primary, and the final audit confirmed all seven SARMS products each have exactly one valid primary image, zero invalid image rows, and no duplicate image links. Ostarine was rechecked on desktop after cleanup and displays the green HD Labs package with 50 Tablets 12mg dosage.
