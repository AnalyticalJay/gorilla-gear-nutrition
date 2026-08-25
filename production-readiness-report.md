# Gorilla Gear Nutrition — Production Readiness Report

**Prepared by:** Manus AI  
**Assessment date:** 25 August 2026  
**Current repository revision reviewed:** `baff72f`  
**Purpose:** Establish whether the current release is ready for a controlled production launch and identify the remaining operational, security, payment, email, and catalogue checks.

## Executive Summary

The application is **functionally mature but not yet ready for an unrestricted production launch**. The restored release builds successfully and its automated suite passes **171 tests across 54 test files**. The gated-access model, admin roles, quote workflow, manual EFT proof flow, iKhokha payment-link workflow, callback reconciliation, customer tracking, and admin audit tools have automated coverage.

The principal remaining launch blockers are operational. The re-applied dependency remediation now returns **zero production dependency advisories**. In addition, the production SMTP mailbox previously returned a live authentication failure (`535`), and iKhokha still requires one real low-value payment and one cancellation/failed-payment exercise to prove its external callback behaviour.

> **Go-live decision:** Use a controlled internal/UAT launch only until the P0 items in this report are complete. Proceed to public launch after the dependency remediation, SMTP validation, iKhokha live validation, and final regression checkpoint are completed.

## Scope and Evidence

| Area | Evidence reviewed | Current result |
|---|---|---|
| Build and automated regression | `pnpm check` and `pnpm test` on revision `baff72f` | TypeScript passes; **171/171 tests pass**. |
| Production dependency health | Final `pnpm audit --prod --json` after remediation | **0 critical, 0 high, 0 moderate, 0 low** advisories. |
| Authentication and roles | Auth procedures, approval gates, admin-only procedures, email password reset tests | Role and approval boundaries are implemented and regression-tested. |
| Payments | iKhokha request, callback, audit, failure/retry, and customer payment tests | Server-side payment reconciliation is implemented; real provider delivery remains unproven. |
| Order integrity | Quote creation, line-item persistence, delivery details, quote workflow tests | Quote creation is transaction-safe and has regression coverage for the earlier insert-ID defect. |
| Customer/admin UX | Quote submission modal, mobile tests, order and payment audit views | Primary journeys are tested; real browser/operator acceptance remains required. |
| Catalogue media | Latest catalogue image source audit | **493 of 786 active products (62.7%)** have a primary image; **293** remain intentionally unassigned because no safe exact image source was confirmed. |

## Current Release: Verified Controls

The current release contains several controls that materially reduce risk. Account access is gated by approval status, administrator procedures enforce the admin role, and customer data is accessed through protected procedures. The password-reset flow stores auditable token activity and has expiry/usage coverage. Quote creation now persists its order, line items, and delivery data atomically, preventing the incomplete quote shells caused by the previously diagnosed MySQL insert-result mismatch.

The payment workflow does not accept a browser callback body as proof of payment. The iKhokha callback resolves the stored payment reference, retrieves payment status from iKhokha using server credentials, compares the gateway reference and amount with the approved quote, then updates the order and audit record. Failed, cancelled, and pending states remain distinct from paid orders, while Manual EFT with proof-of-payment review remains available as a fallback.

| Control | Current state | Residual risk or next check |
|---|---|---|
| Approved-member access and admin roles | Implemented and tested | Validate at least one non-admin and one admin account in production. |
| Quote creation and product snapshots | Implemented transactionally and tested | Submit one real UAT quote after launch preparation. |
| iKhokha callback reconciliation | Implemented with reference and amount checks | Run a real low-value payment and cancellation. |
| Manual EFT proof review | Implemented and tested | Confirm customer upload and admin approval using a harmless test proof. |
| Payment audit trail | Admin payment-attempt audit view available | Confirm a genuine iKhokha callback produces the expected audit record. |
| Password reset audit | Implemented and tested | Renew SMTP credentials and complete a delivered-email reset test. |
| Product image sourcing | High-confidence sources applied; uncertain sources excluded | Obtain supplier media packs for unresolved products. |
| Login throttling | Five invalid attempts per email/client window are limited | Confirm expected behaviour from the production proxy/client IP path. |
| Product image upload validation | MIME, file-signature, filename, product-existence, and 5 MB limits are enforced | Test one valid and one rejected admin upload in UAT. |
| Browser and session policy | SameSite=Lax HTTP-only session cookies, security headers, trusted proxy, and 12 MB request bounds are configured | Verify production headers after publication. |

## Security Remediations Reapplied and Verified

The following security changes have been reapplied to the restored release, covered by targeted regression tests, and validated by the full automated suite.

| Remediation | Security benefit | Required production action |
|---|---|---|
| Login throttling after five failed attempts per email/client window | Reduces credential-stuffing and password-guessing risk | Verify accepted client/proxy IP handling in production. |
| Strict product-image type, magic-byte, filename, product-existence, and 5 MB validation | Prevents misleading MIME uploads, oversized payloads, and orphaned media | Test accepted JPG/PNG/WEBP and rejected malformed files in UAT. |
| SameSite=Lax, HTTP-only session cookie policy | Reduces cross-site cookie use while retaining standard top-level sign-in flow | Verify email and OAuth sign-in in production. |
| Browser security headers and a 12 MB body limit | Reduces framing, MIME-sniffing, browser capability, and oversized-request exposure | Inspect deployed response headers and verify POP upload remains supported. |
| Dependency remediation | Removes unused markdown code, updates tRPC, SheetJS, AWS SDK, Drizzle, Express, Nano ID, Axios, and Lodash dependency paths | Maintain routine audit checks on each release. |

## Dependency Risk Register

The dependency scan is no longer a current release blocker. The final production audit returns zero advisories after upgrading direct and transitive paths through `xlsx`, `@trpc/server`, AWS SDK, Drizzle, Express, Nano ID, Axios, and Lodash.

| Priority | Current finding | Recommended resolution |
|---|---|---|
| Resolved | SheetJS import path | Updated to the current SheetJS CE vendor distribution. [1] |
| Resolved | tRPC advisory | Updated the complete tRPC package family to 11.18.0. [2] |
| Resolved | Production audit baseline | Final audit reports zero advisories. |
| Resolved | Unused Streamdown/Mermaid component chain | Removed from the production source tree. |
| Resolved | AWS SDK, Drizzle, Express, Nano ID, Axios, and Lodash paths | Updated to patched releases and revalidated. |

## Remaining Live-Product Validation

The following checks cannot be fully proved by unit tests because they depend on merchant accounts, mailbox delivery, payment-provider callbacks, courier operations, or a client-operated device. These should be run in a controlled staging or low-value production sequence.

| Priority | Live validation | Success criterion | Owner |
|---|---|---|---|
| P0 | iKhokha completed payment | A low-value approved quote redirects to iKhokha; callback marks the order **Paid**; Payment Audit updates; customer receives confirmation. | Merchant/admin |
| P0 | iKhokha cancellation/decline | Customer return state clearly supports retry/Manual EFT; order is not marked paid; audit records the state. | Merchant/admin |
| P0 | SMTP authentication and delivery | SMTP login succeeds, a password-reset message arrives, and payment/dispatch notifications are delivered. | Mailbox administrator |
| P0 | Dependency remediation checkpoint | Current production audit is remediated or an explicit risk acceptance is recorded. | Engineering owner |
| P1 | Manual EFT proof workflow | A customer uploads a test proof; admin approves/rejects; correct notification and status appear. | Admin/operator |
| P1 | Courier tracking workflow | Admin enters a test tracking number; customer dashboard shows timeline and carrier link. | Admin/operator |
| P1 | Role separation | Approved member cannot access Admin; Chris’s admin account can access authorised admin routes and safely switch role. | Admin/operator |
| P2 | Mobile device acceptance | Sign-up, quote, payment selection, EFT proof, and dashboard complete on current Android and iPhone devices. | Client/UAT users |

## Operational Readiness

The product has a substantial base for launch: the customer quote workflow, private catalogue, payment alternatives, administration controls, responsive customer experience, and operational tracking are in place. However, launch procedures should include a named operator for application approvals, payments, EFT proof review, shipping dispatch updates, password-reset requests, and customer support escalation.

Product imagery is deliberately incomplete rather than misleading. The unresolved 293 products should either retain the existing neutral presentation or receive supplier-authorised media. Do not add marketplace, watermarked, or uncertain packaging images merely to increase visual coverage.

The production build has previously completed successfully, with a large client bundle noted as a **performance improvement** rather than a launch blocker. Lazy-loading the spreadsheet import and optional administrative visualisation components is recommended after the P0 release work is complete.

## Recommended Go-Live Sequence

1. **Resolve the SMTP credential issue** and validate password-reset, payment-approved, packing, and dispatch email delivery to real inboxes.
2. **Run one controlled iKhokha completed payment and one cancellation/decline**, monitoring the Admin Payment Audit and the customer dashboard after each outcome.
3. **Complete operator UAT** for account approval, quote approval, Manual EFT proof review, dispatch tracking, password reset, and role separation.
4. **Inspect deployed security headers and session behaviour** after publishing this checkpoint.
5. **Create a final public-launch checkpoint** only after all P0 checks are evidenced.

## Launch Decision

The application is suitable for **controlled UAT and internal operations** now. It should not be represented as fully public-launch ready until the four P0 steps above are completed and recorded. Once dependency remediation, SMTP delivery, real iKhokha callbacks, and the final security checkpoint are complete, the remaining work is largely operational optimisation and feature enhancement rather than core launch risk.

## References

[1]: https://docs.sheetjs.com/docs/getting-started/installation/nodejs/ "SheetJS CE Node.js installation guidance"
[2]: https://github.com/trpc/trpc/security/advisories/GHSA-43p4-m455-4f4j "tRPC security advisory GHSA-43p4-m455-4f4j"
