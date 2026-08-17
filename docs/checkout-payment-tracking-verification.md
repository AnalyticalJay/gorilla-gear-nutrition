# Checkout, Payment, and Tracking Workflow Verification

## Scope

This verification exercised the production-like quote-payment and tracking workflow without submitting a real PayFast payment or altering the live order’s shipment status.

## Verified workflow links

| Workflow stage | Result | Evidence |
|---|---|---|
| Approved quote payment choice | Passed | Router coverage confirms PayFast, Instant EFT, and Manual EFT selection paths. |
| PayFast hosted checkout | Passed at application boundary | Signed payload is created server-side; PayFast card flow remains available. |
| PayFast Instant EFT | Passed at application boundary | The signed hosted request includes `payment_method=ef`, the documented EFT-only method code. |
| Manual EFT fallback | Passed | Existing Order #1 is recorded as paid by EFT with an approved proof of payment. |
| Payment-to-dashboard propagation | Passed | Order #1 is paid and the customer view displays the paid payment state. |
| Admin tracking entry | Passed | The admin view presents tracking number, carrier, optional URL, note, and order-status controls. |
| Customer tracking timeline | Passed | `TEST-TRACK-001` and its carrier are displayed on the customer order view. |
| Pre-dispatch state correctness | Corrected and passed | A tracking number with no `dispatchedAt` now displays **Dispatch pending**, not **Order dispatched**. |

## Current live-order snapshot

Order #1 is paid via manual EFT, has an approved proof of payment, and has the temporary tracking number `TEST-TRACK-001`. It does not yet have a dispatch timestamp, so the dashboard correctly states that dispatch is pending. No customer-facing shipment status was changed during this verification.

## External dependency

The full browser-to-bank PayFast transaction cannot be completed until PayFast activates the merchant account for receiving payments and enables Instant EFT. The application now generates the correct PayFast request and retains manual EFT with POP as the safe alternative.

## References

- [PayFast Developer Documentation — `payment_method`](https://developers.payfast.co.za/documentation/)
- [PayFast Instant EFT](https://payfast.io/features/payment-methods/instant-eft/)
