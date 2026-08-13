# Synced checkout R140 verification

Verification date: 2026-08-13.

The synced `/checkout` preview shows the quote summary with the product subtotal of R1450.00, nationwide delivery of R140.00, and estimated total of R1590.00. The desktop layout keeps the delivery fee and total readable in the summary card. The mobile layout stacks the form and summary without horizontal overflow; the same R140.00 nationwide delivery line and R1590.00 total remain visible above the submit button.

The server-side calculator uses the shared `NATIONWIDE_SHIPPING_FEE_ZAR` constant and returns a flat rate for every city. Quote workflow regression coverage also verifies `deliveryFee: "140.00"` and the resulting total.
