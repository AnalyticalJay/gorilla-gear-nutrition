# Catalogue Product Image Sourcing Report

## Scope

A product-level web research pass examined all **426 active catalogue records without a primary image**. The research used official manufacturer and authorised distributor pages where available, and did not assign a generic family or stock image when the product name, strength, or packaging could not be confirmed.

## Outcome

| Measure | Count |
| --- | ---: |
| High-confidence exact product matches identified | 143 |
| Medium-confidence matches retained for manual review | 99 |
| Low-confidence or no-confirmed-source records | 184 |
| High-confidence source images retained and assigned | 45 |

After applying the verified assets, **325 of 786 active products** have a primary image. The remaining items were not assigned a substitute image because a source could not be downloaded, an exact match could not be confirmed, the discovered match was only medium confidence, or the source image carried a prominent third-party watermark.

## Brand-Level Research Coverage

| Catalogue Prefix | High Confidence | Medium Confidence | Low / Unconfirmed | Assigned |
| --- | ---: | ---: | ---: | ---: |
| BP | 7 | 0 | 0 | 6 |
| COO | 1 | 2 | 0 | 0 |
| DP | 0 | 0 | 5 | 0 |
| HD | 12 | 0 | 23 | 3 |
| HU | 0 | 0 | 22 | 0 |
| Keifei | 34 | 3 | 8 | 0 |
| KH | 0 | 0 | 23 | 0 |
| NOVA | 21 | 2 | 6 | 0 |
| OL | 0 | 0 | 7 | 0 |
| OT | 0 | 0 | 33 | 0 |
| P | 29 | 0 | 0 | 8 |
| PC | 7 | 1 | 2 | 0 |
| Pharma | 0 | 28 | 32 | 0 |
| PSY | 0 | 0 | 5 | 0 |
| UPA | 7 | 48 | 0 | 6 |
| VMED | 21 | 15 | 16 | 21 |
| WP | 4 | 0 | 0 | 1 |
| XLR | 0 | 0 | 2 | 0 |

## Provenance and Review

The attached CSV file `catalogue-image-source-audit.csv` is the product-level provenance record for the **45 assigned images**. It includes the product ID, managed image URL, public source page, source image URL, source type, confidence level, and matching evidence. A 31-item watermarked distributor source group was explicitly excluded from the live catalogue after visual review.

> Images sourced from manufacturer and distributor product pages remain subject to their owners’ copyright and terms of use. The stored audit trail makes every assignment reviewable and replaceable.

## Recommended Next Pass

1. Request supplier or manufacturer media packs for the 350 remaining unassigned products, prioritising Pharma, UPA, Vmed, Keifei, OT, and private-label prefixes.
2. Review all medium-confidence matches in the deep-research manifest before assigning any of them.
3. Use newly supplied official pack shots or manufacturer permissions to fill the remaining gaps without introducing inaccurate variants.
