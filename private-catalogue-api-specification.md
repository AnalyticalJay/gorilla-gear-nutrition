# Gorilla Gear Nutrition — Data Model & API Specification

## 1. Database Schema Overview

The copied database schema (`drizzle/schema.ts`) fully supports the private catalogue access flow. It enforces approval states at the database layer, connects users to approval history and orders, and provides quote-to-order workflows with S3-backed product storage and two-way comments.

### Key Table Summary

| Table | Primary Purpose | Key Fields |
|---|---|---|
| `users` | Customer and staff identity and approval gating | `id`, `openId`, `fullName`, `email`, `phone`, `city`, `role` (`user`, `admin`), `status` (`pending`, `approved`, `rejected`), `isActive`, `isOver18` |
| `user_approvals` | Audit trail for application reviews and status changes | `id`, `userId`, `submittedData` (JSON), `adminNotes`, `approvedBy`, `status`, `reviewedAt`, `createdAt` |
| `categories` | Product categorization for catalogue discovery | `id`, `name`, `slug`, `description`, `isActive`, `createdAt` |
| `products` | Catalogue merchandise (gated pricing) | `id`, `name`, `slug`, `description`, `dosageInfo`, `categoryId`, `price`, `stockQuantity`, `isActive`, `isFeatured` |
| `product_images` | S3-backed product imagery with primary flags | `id`, `productId`, `imageUrl`, `imageKey`, `isPrimary` |
| `cart_items` | Member quote cart items prior to submission | `id`, `userId`, `productId`, `quantity` |
| `orders` | Admin-reviewed quote requests and payment records | `id`, `userId`, `totalAmount`, `deliveryFee`, `deliveryType`, `status`, `paymentStatus`, `paymentMethod`, `payfastReference`, `quoteNotes`, `rejectionReason`, `reviewedBy`, `reviewedAt` |
| `order_items` | Snapshot of products and prices at quote submission | `id`, `orderId`, `productId`, `quantity`, `priceAtPurchase` |
| `shipping_details` | Delivery address for quote fulfillment | `id`, `orderId`, `fullName`, `phone`, `addressLine1`, `addressLine2`, `city`, `postalCode`, `country` |
| `delivery_rules` | Location-based shipping rules (e.g., Port Elizabeth free, R150 elsewhere) | `id`, `locationName`, `deliveryType`, `fee` |
| `order_comments` | Two-way communication between customer and admin | `id`, `orderId`, `userId`, `body`, `createdAt` |

---

## 2. tRPC API Endpoint Contracts

All procedures run within `server/routers.ts` (or modular feature routers) and use type-safe input validation via Zod.

### A. Authentication & Registration Router (`auth`)

| Procedure Type | Name | Input Schema | Description & Authorization |
|---|---|---|---|
| Mutation | `register` | `fullName`, `email`, `phone`, `city`, `password`, `isOver18` | Public. Registers a new account with `status: "pending"`, `role: "user"`, and hashes the password. Creates an initial `user_approvals` audit record. |
| Mutation | `login` | `email`, `password` | Public. Authenticates user credentials, sets secure session cookie, and returns user session summary with `status`. |
| Query | `me` | None | Public/Protected. Returns the currently authenticated user object including `status` and `role`, or `null`. |
| Mutation | `logout` | None | Protected. Clears session cookie and terminates session. |

### B. Products & Catalogue Router (`products`)

| Procedure Type | Name | Input Schema | Description & Authorization |
|---|---|---|---|
| Query | `list` | `search?`, `categoryId?`, `featuredOnly?`, `brand?` | Public/Protected. Returns products. Non-approved users may see basic product discovery, but prices and add-to-quote actions are restricted on the client and server. |
| Query | `detail` | `id` or `slug` | Public/Protected. Returns single product details and images. |

### C. Quote Cart & Orders Router (`orders`)

| Procedure Type | Name | Input Schema | Description & Authorization |
|---|---|---|---|
| Query | `cartList` | None | Protected (Approved members only). Returns user's current quote cart items with product details. |
| Mutation | `cartAdd` | `productId`, `quantity` | Protected (Approved members only). Adds or updates item quantity in quote cart. |
| Mutation | `cartRemove` | `itemId` | Protected (Approved members only). Removes item from quote cart. |
| Mutation | `submitQuote` | `shipping`: `{ fullName, phone, addressLine1, addressLine2, city, postalCode, country }` | Protected (Approved members only). Converts cart items into an order with `status: "quote_pending"`, calculates delivery fee (Port Elizabeth free vs R150 flat rate), and clears the cart. |
| Query | `myOrders` | None | Protected (Approved members only). Returns list of submitted quotes/orders for the current user. |
| Query | `detail` | `orderId` | Protected. Returns order details, shipping, items, comments, and current status for the order owner or admin. |
| Mutation | `choosePayment` | `orderId`, `method` (`"payfast"` \| `"eft"`) | Protected (Approved member, order must be `quote_approved`). Sets payment method and updates order status to `"awaiting_payment"`. |
| Mutation | `addComment` | `orderId`, `body` | Protected. Adds a message to `order_comments` for customer-admin dialogue. |
| Mutation | `payfastItn` | PayFast webhook payload | Public (Server-to-server webhook). Validates PayFast ITN signature, updates order status to `"paid"` / `"processing"`, and records payment confirmation. |

### D. Admin Management Router (`admin`)

| Procedure Type | Name | Input Schema | Description & Authorization |
|---|---|---|---|
| Query | `stats` | None | Admin only. Returns counts for pending applications, active products, pending quotes, and revenue metrics. |
| Query | `applicants` | `status?`, `search?`, `limit?`, `offset?` | Admin only. Returns filtered list of user applications for review. |
| Mutation | `updateApplicantStatus` | `userId`, `status` (`"approved"` \| `"rejected"` \| `"inactive"`), `adminNotes?` | Admin only. Atomically updates user approval status, records review audit in `user_approvals`, and updates user table. |
| Query | `quotes` | `status?`, `limit?`, `offset?` | Admin only. Returns all submitted customer quotes across the platform. |
| Mutation | `reviewQuote` | `orderId`, `action` (`"approve"` \| `"reject"`), `quoteNotes?`, `rejectionReason?`, `adjustedTotal?` | Admin only. Approves or rejects a quote, records reviewer ID and notes, and sets order status to `"quote_approved"` or `"quote_rejected"`. |
| Mutation | `confirmPayment` | `orderId`, `paymentStatus` (`"paid"` \| `"failed"`), `trackingNotes?` | Admin only. Manually confirms EFT or offline payment, advancing order to `"processing"` or `"shipped"`. |

---

## 3. Server-Side Enforcement Rules

1. **Approval Enforcement Middleware**: Procedures that require approved access (such as `cartAdd`, `submitQuote`, `choosePayment`) are wrapped in an `approvedProcedure` middleware that throws a `FORBIDDEN` TRPC error if `ctx.user.status !== "approved"`.
2. **Admin-Only Middleware**: All administrative procedures (`updateApplicantStatus`, `reviewQuote`, `confirmPayment`) require `ctx.user.role === "admin"`.
3. **Atomic Status Transitions**: Status updates in `users` and `orders` are paired with audit logs (`user_approvals`, `order_comments`) inside database transactions to ensure traceability.
