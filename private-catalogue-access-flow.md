# Gorilla Gear Nutrition — Private Catalogue Access Flow

## Purpose

Gorilla Gear Nutrition operates as a **private, approval-based catalogue**. Visitors may understand the range and submit an application, but pricing, quote submission, and payment actions must remain restricted until an administrator approves the applicant.

The access model should be transparent to customers and enforceable on the server. The interface may guide a user based on their status, but the backend must remain the final authority for catalogue pricing, quote creation, payment selection, and administrative actions.

## Authentication and Approval States

| State | Meaning | Customer access | Primary next action |
|---|---|---|---|
| Unauthenticated | No active account session exists. | Public homepage, brand information, category discovery, and application/login entry points. | Apply for access or sign in. |
| Pending | Application received and awaiting review. | Account and status page; no member pricing, quote submission, or payment access. | Wait for review or contact support. |
| Approved | Application accepted by an administrator. | Member catalogue, approved pricing, quote cart, quote submission, quote history, and payment selection after quote approval. | Browse, build a quote, and submit it for review. |
| Rejected | Application declined. | Sign-in/status experience without protected catalogue actions. | Contact support or sign out. |
| Inactive / suspended | Previously approved access has been disabled. | Sign-in may succeed, but protected commerce actions remain blocked. | Contact an administrator. |
| Admin | Authorized staff account. | Full administrative dashboard and customer-review controls. | Review applicants and operate the catalogue. |

## Customer Authentication Journey

### 1. Public Discovery

The visitor lands on the Gorilla Gear Nutrition homepage and sees the brand proposition, controlled-access explanation, category imagery, delivery information, age restriction, and application call to action. Public pages must not expose member pricing or imply unrestricted checkout.

The public catalogue may show product discovery content where appropriate, but price, quote-cart actions, and order creation remain gated. If the database is empty, the homepage and catalogue should show a deliberate empty state rather than placeholder products.

### 2. Application Registration

The application form should collect the minimum information needed for identity, contact, delivery, and review: full name, email, phone number, city, password, age confirmation, and agreement to the terms of service. The form should validate required fields, password strength, duplicate email conditions, and the 18+ confirmation before submission.

On success, the system should create the account with a **pending** status, record the registration timestamp, and show a clear confirmation that the application has been received. The customer should not be told that access is approved until an administrator explicitly changes the status.

### 3. Sign-In

Customers should be able to sign in through the configured custom credentials flow and the existing Manus OAuth flow where available. Authentication should create the server-managed session and redirect the user based on their status.

The application must not construct one-time login links during render. Login actions should be initiated by explicit user interaction, and errors should be presented without exposing whether unrelated accounts exist.

### 4. Status-Aware Routing

After authentication, the application should route the user according to their account state.

| Account state | Recommended destination |
|---|---|
| Pending | Approval-pending status page with automatic refresh and sign-out. |
| Approved | Account dashboard or approved member catalogue. |
| Rejected | Rejection status page with support/contact guidance and sign-out. |
| Inactive / suspended | Access-disabled page with support guidance. |
| Admin | Admin dashboard. |

Protected routes should enforce the same rule server-side. A user who manually enters a protected URL must receive a controlled access error or status redirect rather than the protected data.

### 5. Approved Member Experience

Approved members can browse the real product catalogue, view member pricing, add products to a quote cart, enter delivery details, and submit a quote request. The quote is not a direct checkout order: it is submitted for admin review.

The customer should see a progress sequence such as **Quote Submitted**, **Under Review**, **Quote Approved**, **Payment Selected**, and **Payment Confirmed**. Customer-admin comments should be available on the quote detail page, with each message labeled by author role and timestamp.

### 6. Session and Security Requirements

Sessions must be server-managed, protected with secure cookie settings, and invalidated on logout. Every protected tRPC procedure should resolve the authenticated user from the request context and enforce role/status checks before returning sensitive information or mutating commerce data.

The system should prevent privilege escalation through client-side fields. In particular, a customer must not be able to submit `approved`, `admin`, a custom price, or a payment-confirmed state through a client mutation. Approval, pricing, payment status, and administrative role changes must be controlled by server-side procedures.

## Admin Review Dashboard

### Dashboard Purpose

The admin dashboard is the operational control centre for reviewing applications and managing private catalogue access. Its primary objective is to make new and unresolved applications visible, actionable, and auditable without requiring the administrator to inspect individual records blindly.

### Dashboard Overview Requirements

The landing dashboard should include a prominent summary of:

| Metric or alert | Requirement |
|---|---|
| Pending applications | Count of applications awaiting review, linked to the filtered review queue. |
| Recently submitted applications | Latest applicants with submission time and current status. |
| Recently approved or rejected | Recent decisions for operational visibility. |
| New quote submissions | Count and link to quotes requiring review. |
| Pending payment confirmations | EFT or other manual confirmations requiring action. |
| Catalogue readiness | Product count, category count, and image coverage once products are re-uploaded. |

Pending applications and new quote submissions should receive prominent badges or alert treatment, especially when the admin has not yet viewed them.

### Applicant Review Queue

The review queue should be a searchable, sortable, filterable table or card list. Each row should display:

- Applicant name.
- Email address and phone number.
- City or delivery region.
- Application date and last status update.
- Current status: pending, approved, rejected, or inactive.
- Age confirmation indicator.
- Review priority or unread indicator where supported.
- Available actions based on the current status.

Recommended filters include **Pending**, **Approved**, **Rejected**, **Inactive**, date range, city, and search by name or email. The default view should open on pending applications.

### Applicant Detail View

Opening an applicant should show a complete review record without exposing unrelated users. The detail view should include:

1. Identity and contact information.
2. City and delivery-relevant information.
3. Registration and last-sign-in timestamps.
4. Age-confirmation and terms-acceptance indicators.
5. Current access status and status history.
6. Related quotes or orders, if any.
7. Admin notes and decision history.
8. Clear approve, reject, suspend, and reactivate actions where permitted.

The layout should make the current status unmistakable and should distinguish a pending application from a previously approved account that has been suspended.

### Decision Actions

#### Approve

Approval should require an explicit confirmation and should update the user’s status atomically. The system should record the acting administrator, decision time, previous state, new state, and optional note. The customer should then be able to access approved pricing and quote functionality.

#### Reject

Rejection should require an optional or required reason according to business policy. The reason should be stored privately for internal records and, if exposed to the customer, should be written in neutral, non-sensitive language. Rejection must immediately prevent protected commerce actions.

#### Suspend or Deactivate

An administrator should be able to disable an approved account without deleting the customer record. Suspension should revoke or block protected actions while preserving historical quotes and audit records.

#### Reactivate

Reactivation should be available only to authorized administrators and should restore the appropriate customer state without altering historical quotes, payment records, or audit entries.

### Bulk and Safety Controls

Bulk approval or rejection should not be enabled by default. If introduced later, it should require a review summary, explicit confirmation, and a clear count of affected users. Destructive or irreversible actions should use confirmation dialogs and should never be triggered by a visually ambiguous button.

The dashboard should prevent accidental action through row-level controls by using clear labels, status-specific availability, and disabled states while a mutation is pending. Success and error feedback should identify the outcome without refreshing the entire page unnecessarily.

### Notifications and Auditability

The system should notify the project owner or designated administrators when new applications arrive, subject to the configured notification capability. Customers should receive a clear status outcome through the application experience and any configured notification channel.

Every access decision should be auditable. The minimum audit record should include the applicant, previous status, new status, administrator, timestamp, reason or note, and source action. Audit records should be append-only from the dashboard and should not be editable by ordinary customer accounts.

## Authorization Rules

| Action | Unauthenticated | Pending | Approved customer | Admin |
|---|---:|---:|---:|---:|
| View public homepage | Yes | Yes | Yes | Yes |
| Submit application | Yes | No or update-only | No or profile-only | No |
| View member pricing | No | No | Yes | Yes |
| Add to quote cart | No | No | Yes | Yes, if operationally needed |
| Submit quote | No | No | Yes | Yes, if operationally needed |
| View own quotes | No | Limited to status | Yes | Yes |
| Review all applications | No | No | No | Yes |
| Change approval status | No | No | No | Yes |
| Change product pricing | No | No | No | Yes |
| Confirm payment | No | No | No | Yes or configured payment handler |

## Error and Empty States

The customer experience should distinguish between **not signed in**, **awaiting approval**, **not approved**, **suspended**, **quote not found**, and **catalogue currently empty**. Each state should provide a useful next action such as apply, sign in, sign out, contact support, return to account, or browse the public catalogue.

The admin dashboard should distinguish **no pending applications** from a failed data request. Empty queues should be calm and informative; errors should include retry guidance and should not silently appear as empty data.

## Acceptance Criteria

The authentication and review system is ready when a visitor can apply, receives a pending state, cannot access member pricing or quote submission while pending, and is routed correctly after approval or rejection. An approved member must be able to view pricing and submit a quote, while the admin can search applicants, inspect details, approve or reject with a recorded decision, and see prominent alerts for unresolved work.

All customer-facing gates must have matching server-side authorization. The system must preserve quote and payment history across status changes, provide clear feedback for every decision, avoid fabricated catalogue or social-proof content, and remain usable on desktop and mobile screens.
