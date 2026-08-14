# Reset-Token Audit View Verification

## Scope

The admin reset-token audit view was verified at desktop and mobile widths after the password-reset audit table, lifecycle recording, protected admin query, and responsive UI were implemented.

## Desktop verification

At a 1280 × 900 viewport, the page renders the security heading, refresh control, four lifecycle summary cards, event-type filter, masked-email search, empty-state table, privacy note, and dashboard return link without horizontal overflow. The empty state is expected because no reset events have been generated in the current environment.

## Mobile verification

At a 390 × 844 viewport, the admin header remains accessible, summary cards stack vertically, filter controls remain full-width and touch-friendly, the empty-state card remains readable, and the privacy note wraps without clipping. No raw reset token or full customer email is rendered.

## Validation

The focused and complete Vitest run passed with 150 tests across 46 files. TypeScript validation also passed. The audit route is protected by the existing admin middleware, and the query returns only masked account identifiers, lifecycle metadata, and a non-sensitive hash suffix.
