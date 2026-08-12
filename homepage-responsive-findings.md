# Homepage Responsive Findings

The desktop hero has a strong visual hierarchy and the logo card reads well at 1280px, but the first viewport is dense and the lower assurance row is close to the fold. The authenticated desktop state currently shows only the member-catalogue CTA, which is appropriate for approved users.

At 375px, the fixed navigation overlaps the top of the hero: the `Premium performance nutrition` badge is partially hidden beneath the navbar. The mobile navbar is crowded but remains legible. The hero heading and copy fit without horizontal overflow, while the hero logo card begins at the bottom of the first viewport and needs more intentional mobile spacing so it does not feel abruptly cut off. The assurance grid is readable but should use tighter, balanced spacing and preserve clear separation from the logo card.

Planned refinements: reserve safe top spacing below the fixed navbar, tune mobile hero typography and vertical rhythm, keep CTA widths within the viewport, simplify the mobile logo-card proportions, and verify all subsequent sections for clipping and overflow at phone and tablet widths.

## Verification Pass 1

The safe top spacing now keeps the mobile badge fully visible below the fixed navigation. The phone hero heading, copy, CTA, and assurance grid fit within the viewport without horizontal overflow. The logo card now begins with a controlled mobile height and rounded treatment. Desktop hierarchy remains balanced, with the hero CTA and logo card aligned cleanly. A full-page mobile check is still needed for lower sections, and tablet width should be checked before completion.

## Verification Pass 2

The full-page 375px capture shows the hero, catalogue cards, category cards, process steps, dark CTA, and footer stacking cleanly with no horizontal overflow. The fixed bottom navigation remains separated from content. At 768px, the navigation remains usable and the hero content stays centered and readable; the logo card moves below the assurance row as intended at the tablet breakpoint. No clipping or broken grids were observed.

## Verification Pass 3

After the shared navbar update, the phone header uses a compact cart, account icon, and menu arrangement without crowding the Gorilla Gear wordmark. The desktop header retains the full account affordance and existing navigation hierarchy. The hero remains aligned at 1280px, and the phone hero remains free of overlap or horizontal overflow.

## Final Full-Page Check

The final 375px full-page capture confirms all homepage sections remain within the viewport: hero, featured products, category tiles, membership process, dark CTA, footer, and persistent bottom navigation. No horizontal overflow, section clipping, or broken responsive columns were observed.

## Proof-of-Payment Badge Verification — 2026-08-12

Desktop full-page verification of `/orders/1` confirmed the route, quote timeline, products section, and Quote & Payment card render without overflow. It also exposed a related state bug: the live order is `awaiting_payment` with no `paymentMethod`, so the customer sees no PayFast/EFT action buttons and no proof-of-payment badge. The payment action guard currently only checks `quote_approved`; it must also allow an `awaiting_payment` order with no selected method to choose PayFast or EFT.

## Proof-of-Payment Badge Verification — Corrected Payment State

After extending the payment guard to support `awaiting_payment` orders without a selected method, the live desktop and 375px phone captures now show both **Pay via PayFast** and **Pay via EFT** actions in the customer Quote & Payment card. The layout remains within the viewport, with the buttons stacking cleanly on phone width. Once EFT is selected, the proof-of-payment badge and upload guidance become available through the same card.
