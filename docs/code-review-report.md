# Code Review: Gorilla Gear Nutrition Release Candidate

## Summary

This review assesses the current Gorilla Gear Nutrition release candidate for correctness, security, performance, data-access boundaries, maintainability, specification compliance, and test quality. The implementation has strong route-level authorization, input validation, iKhokha-only customer routing, managed media handling, and broad regression coverage; however, one **critical sensitive-data exposure** and several major hardening gaps mean the current candidate should not be approved for production without changes.

**Verdict: Request Changes**

## Review Scope and Baseline

The review covered the React client, Express/tRPC server, Drizzle data-access layer, authentication and cookies, storage proxy, payment callback flow, catalogue access policy, performance-related code, package configuration, and automated tests. The reviewed repository was clean at commit `b8658db`.

| Gate | Result | Evidence |
|---|---:|---|
| TypeScript | Pass | `pnpm check` completed successfully. |
| Regression tests | Pass | 67 test files and 193 tests passed in 16.90 seconds. |
| Production build | Pass with warning | `pnpm build` completed; Vite warns that the shared `index` chunk is 755.11 kB minified (215.74 kB gzip). |
| Production dependency audit | Pass | `pnpm audit --prod`: no known vulnerabilities found. |
| Repository state | Pass | Working tree clean at reviewed commit `b8658db`. |
| Package-manager configuration | Action required | pnpm warned that the `pnpm` field in `package.json` is ignored, including configured overrides and patched dependencies. |

## Critical Issues — Must Fix Before Merge

### C1. `server/routers.ts:172-176` — `auth.me` returns password and reset-token fields

**Current behavior:** `auth.me` loads a complete database user row with `getUserById` and returns it directly. The `users` table includes `passwordHash`, `resetTokenHash`, and `resetTokenExpiresAt`. The captured request log also shows these fields in the serialized `auth.me` response; the logging layer redacted values in some displays, but the application response itself contained the fields.

**Impact:** A browser session, browser extension, client-side error reporter, proxy log, or compromised frontend can obtain password hashes and reset-token metadata. A bcrypt hash is not the plaintext password, but it is still credential material that should never cross the API boundary. A reset-token hash is particularly sensitive because it is part of the password-recovery capability. This violates least privilege and materially increases the impact of any client-side or logging compromise.

**Suggested fix:** Return an explicit safe-user projection rather than a full row. Include only fields needed by the client, such as `id`, `fullName`, `email`, `phone`, `city`, `role`, `status`, `isActive`, and timestamps. Add a regression test asserting that `passwordHash`, `resetTokenHash`, and `resetTokenExpiresAt` are absent from the serialized `auth.me` response.

```ts
const user = await getUserById(ctx.user.id);
if (!user) return null;
return {
  id: user.id,
  fullName: user.fullName,
  email: user.email,
  phone: user.phone,
  city: user.city,
  role: user.role,
  status: user.status,
  isActive: user.isActive,
  isOver18: user.isOver18,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
  lastSignedIn: user.lastSignedIn,
};
```

## Major Issues — Should Fix

### M1. `server/_core/storageProxy.ts:19-73` — Public media proxy accepts arbitrary storage keys

The `/api/media/*` route accepts any path supplied by an unauthenticated caller, uses the server-side Forge credential to presign that path, fetches the object, and returns it. There is no allowlist for public asset prefixes and no authorization branch for private objects. If private or future non-catalogue objects share the storage namespace, knowing or guessing a key could turn this into an unintended read proxy. The current product imagery use case is public, but the route contract is broader than that use case.

Restrict the route to explicit public prefixes such as `products/`, `generated/`, and approved brand assets, or issue signed, short-lived URLs for private material. Reject traversal or unexpected key formats before calling the storage service. Add tests for disallowed prefixes, malformed keys, upstream failure, and private-object denial.

### M2. `server/routers.ts:88-131,242-254` — Authentication throttles are process-local and not bounded across autoscale

Login-failure and password-reset cooldown maps live in process memory. In autoscale deployment, separate instances do not share counters, so an attacker can distribute attempts across instances and bypass the intended limit. The password-reset map also has no periodic cleanup for unique email addresses, allowing memory growth over time.

Use a shared rate-limit store or platform-level edge protection, and use bounded TTL eviction. Apply equivalent abuse controls to other unauthenticated write endpoints, especially `coaching.submit`.

### M3. `server/db.ts:961-985` — Persistence layer still permits retired EFT and PayFast methods

The public router correctly restricts `orders.choosePayment` to `z.literal("ikhokha")`, but `chooseQuotePayment` still accepts `
`"eft" | "payfast" | "ikhokha"` and still writes legacy payment states such as `awaiting_eft`. This is policy drift and creates a future bypass if any internal caller, maintenance script, or router is added without the current guard. Make the persistence method accept only `"ikhokha"`, remove legacy write branches from active payment code, and retain old columns only as read-only historical data if migration safety requires them.

### M4. `package.json:118-125` — pnpm reports that configured overrides and patches are ignored

Every tested pnpm command emitted a warning that the `pnpm` field in `package.json` is no longer read. The configured `patchedDependencies` and `overrides` therefore cannot be relied upon to govern the dependency tree. This is especially important if the override or patch was introduced for a security or compatibility reason.

Move the configuration to the format supported by the installed pnpm version, regenerate the lockfile, and verify that the intended patched and overridden versions are present. Treat a clean `pnpm audit` as insufficient evidence until this configuration warning is resolved.

### M5. `client/src/pages/Products.tsx:11,220-224,274-276` — Private catalogue still imports framer-motion

The performance work removed animation-runtime usage from several routes, but the private catalogue still imports `framer-motion` and wraps its header and product grid in motion components. The current build has a 755.11 kB minified shared client chunk, and this route remains a documented contributor to client runtime weight.

Replace the simple entrance transitions with the existing CSS/native observer pattern, or isolate the animation dependency behind a deliberate lazy boundary. Add a bundle-size budget or build assertion so the regression is visible in CI.

### M6. `server/_core/storageProxy.ts:56-69` — Media proxy buffers the entire upstream file

The image proxy reads the full upstream response into an `ArrayBuffer` and then creates a second `Buffer` before sending it. This adds latency and per-request memory pressure, especially when several catalogue images load concurrently. It also has no explicit response-size limit or upstream timeout.

Stream the upstream body where the runtime permits, enforce a maximum content length for public assets, and set an abort timeout. The current happy-path test does not protect these behaviors.

### M7. `server/routers.ts:896-917` — Public coaching submission has no abuse control

`coaching.submit` accepts unauthenticated writes and sends an owner notification for every accepted request. Field bounds are present, which is good, but there is no rate limit, origin/CSRF strategy beyond cookie policy, CAPTCHA, duplicate suppression, or notification backpressure. This can be used to spam the owner or increase email/API costs.

Add a shared rate limit and duplicate/throttle policy before production marketing traffic is directed to this endpoint. Consider queueing or digesting owner notifications.

## Minor Issues — Nice to Have

### m1. Broad `any` casts weaken role/status type safety

`server/routers.ts:140-142` and `client/src/pages/Products.tsx:17` use `any` for status checks. Use the schema-derived user type or a narrow status union so access conditions remain compiler-checked.

### m2. Product list queries select inventory fields before redaction

`server/db.ts:597-608` and `server/db.ts:818-826` select `stockQuantity`/`productStock` and rely on later response shaping to hide it. The current behavior meets the customer-visible requirement, but a narrower customer projection would reduce accidental leakage and unnecessary data transfer.

### m3. Media proxy tests cover only the happy path

`server/_core/storageProxy.test.ts` covers successful presign, storage fetch, MIME selection, and cache headers, but not missing keys, malformed keys, upstream errors, private-prefix rejection, timeouts, or oversized bodies. Add those cases alongside the M1/M6 hardening.

### m4. Payment router tests mock away the persistence policy

`server/quote-workflow-router.test.ts` verifies the router's iKhokha literal but mocks `chooseQuotePayment`. It therefore cannot catch the stale EFT/PayFast acceptance in `server/db.ts`. Add a lower-layer test or refactor the payment service around a single typed method.

## Positive Feedback

The codebase has a clear tRPC contract and distinct `publicProcedure`, `protectedProcedure`, `approvedProcedure`, and `adminProcedure` boundaries. Product access checks are applied both to list and slug procedures, and customer inventory is explicitly redacted at response boundaries. Registration and reset-password inputs use an eight-character minimum consistently, product uploads validate declared MIME against magic bytes, and iKhokha callback processing re-queries gateway status rather than trusting callback bodies. The latest test run is broad and fast, and the production build is reproducible.

The recent first-party media route migration was a strong response to a real production-hosting conflict. It removed reliance on the reserved `/manus-storage/` path and added correct MIME handling and immutable caching. The main remaining concern is that the public proxy contract needs tighter scope and stronger failure-path tests.

## Questions for the Author

1. Are any non-catalogue or private objects stored in the same Forge storage namespace as public product and brand assets? This determines the urgency of the media-prefix allowlist.
2. Should legacy EFT and PayFast columns remain for historical reporting, or can they be retired after a verified data migration plan?
3. Is the `pnpm` override/patch configuration intentionally required? If so, which dependency versions are expected after moving the configuration to the supported location?
4. What is the intended abuse-control strategy for public coaching enquiries and registration/password-reset endpoints in autoscale production?

## Test Coverage Assessment

| Area | Assessment |
|---|---|
| Happy paths | Strong coverage across registration, catalogue, quote, iKhokha routing, tracking, responsive components, and media success paths. |
| Error cases | Good router and validation coverage, but storage-proxy failures and abuse controls are under-tested. |
| Boundary cases | Password-length and image MIME boundaries are covered; sensitive-field serialization, oversized proxy responses, and distributed throttling are not. |
| Integration confidence | TypeScript and production build pass; most payment tests mock the data layer, so a lower-layer payment integration test is still needed. |

## Review Checklist

| Check | Status | Notes |
|---|---:|---|
| Authentication and authorization boundaries | Partial | Route middleware is strong, but `auth.me` sensitive serialization is a blocker. |
| Sensitive data handling | Fail | Password and reset-token fields cross the `auth.me` API boundary. |
| Input validation | Pass | Strong Zod bounds and upload magic-byte checks observed. |
| Payment policy enforcement | Partial | Router is iKhokha-only; persistence layer retains legacy write capability. |
| Dependency governance | Partial | Audit is clean, but pnpm ignores configured overrides/patches. |
| Performance | Partial | Build passes; shared chunk and remaining framer-motion/media buffering merit remediation. |
| Tests | Partial | 193/193 pass, but several high-risk edge cases lack behavioral coverage. |
| Maintainability | Partial | Good separation overall; legacy payment branches and broad full-row returns remain. |

## Recommended Fix Order

1. Redact sensitive fields from `auth.me` and add a serialization regression test.
2. Restrict `/api/media/*` to approved public storage prefixes, validate keys, and add failure-path tests.
3. Move pnpm overrides and patches to the supported configuration location and regenerate the lockfile.
4. Enforce iKhokha-only payment semantics in the persistence layer, retaining legacy data only read-only if needed.
5. Replace the remaining catalogue `framer-motion` usage and stream/limit media proxy responses.
6. Add distributed abuse controls for login, password reset, registration, and coaching enquiries.

## Final Verdict

**Request Changes.** The current release candidate is structurally strong and its automated baseline is green, but the `auth.me` sensitive-data exposure is a release-blocking security issue. The public media proxy, dependency-configuration warning, lower-layer payment-policy drift, and distributed rate-limit gaps should be addressed before approval for production.

**Reviewed by:** Manus AI

**Review date:** 2026-08-28
