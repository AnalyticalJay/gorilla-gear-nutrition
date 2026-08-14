import {
  boolean,
  decimal,
  int,
  json,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";

// ─── Users ────────────────────────────────────────────────────────────────────
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  // Manus OAuth openId kept for compatibility; null for email/password users
  openId: varchar("openId", { length: 64 }).unique(),
  fullName: varchar("fullName", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  phone: varchar("phone", { length: 32 }),
  city: varchar("city", { length: 128 }),
  passwordHash: varchar("passwordHash", { length: 255 }),
  resetTokenHash: varchar("resetTokenHash", { length: 128 }),
  resetTokenExpiresAt: timestamp("resetTokenExpiresAt"),
  loginMethod: varchar("loginMethod", { length: 64 }).default("email"),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  status: mysqlEnum("status", ["pending", "approved", "rejected"]).default("pending").notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  isOver18: boolean("isOver18").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ─── Password Reset Audit Events ───────────────────────────────────────────────
// Raw reset tokens are never stored. Only masked identity, hashed-email lookup,
// event type, and a non-sensitive hash prefix are retained for admin auditing.
export const passwordResetAuditEvents = mysqlTable("password_reset_audit_events", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").references(() => users.id),
  emailHash: varchar("emailHash", { length: 64 }).notNull(),
  maskedEmail: varchar("maskedEmail", { length: 320 }).notNull(),
  eventType: mysqlEnum("eventType", [
    "request_received",
    "token_issued",
    "email_sent",
    "email_failed",
    "token_consumed",
    "token_invalid",
    "token_expired",
    "account_not_eligible",
  ]).notNull(),
  tokenHashPrefix: varchar("tokenHashPrefix", { length: 16 }),
  detail: varchar("detail", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PasswordResetAuditEvent = typeof passwordResetAuditEvents.$inferSelect;

// ─── User Approvals ───────────────────────────────────────────────────────────
export const userApprovals = mysqlTable("user_approvals", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  submittedData: json("submittedData"),
  adminNotes: text("adminNotes"),
  approvedBy: int("approvedBy"),
  status: mysqlEnum("status", ["pending", "approved", "rejected"]).default("pending").notNull(),
  reviewedAt: timestamp("reviewedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type UserApproval = typeof userApprovals.$inferSelect;

// ─── Coaching Enquiries ───────────────────────────────────────────────────────
// Public enquiries are stored separately from member applications. A raw customer
// address is required for consultation and service planning, while review fields
// remain restricted to administrators.
export const coachingEnquiries = mysqlTable("coaching_enquiries", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").references(() => users.id),
  firstName: varchar("firstName", { length: 128 }).notNull(),
  lastName: varchar("lastName", { length: 128 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  phone: varchar("phone", { length: 32 }).notNull(),
  address: text("address").notNull(),
  primaryGoal: varchar("primaryGoal", { length: 255 }).notNull(),
  experienceLevel: mysqlEnum("experienceLevel", ["beginner", "intermediate", "advanced"]).notNull(),
  availability: varchar("availability", { length: 255 }).notNull(),
  status: mysqlEnum("status", ["new", "reviewing", "consultation_scheduled", "accepted", "closed"]).default("new").notNull(),
  adminNotes: text("adminNotes"),
  reviewedBy: int("reviewedBy").references(() => users.id),
  reviewedAt: timestamp("reviewedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CoachingEnquiry = typeof coachingEnquiries.$inferSelect;

// ─── Categories ───────────────────────────────────────────────────────────────
export const categories = mysqlTable("categories", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 128 }).notNull(),
  slug: varchar("slug", { length: 128 }).notNull().unique(),
  description: text("description"),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Category = typeof categories.$inferSelect;
export type InsertCategory = typeof categories.$inferInsert;

// ─── Products ─────────────────────────────────────────────────────────────────
export const products = mysqlTable("products", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  description: text("description"),
  dosageInfo: text("dosageInfo"),
  categoryId: int("categoryId").references(() => categories.id),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  stockQuantity: int("stockQuantity").default(0).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  isFeatured: boolean("isFeatured").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Product = typeof products.$inferSelect;
export type InsertProduct = typeof products.$inferInsert;

// ─── Product Images ───────────────────────────────────────────────────────────
export const productImages = mysqlTable("product_images", {
  id: int("id").autoincrement().primaryKey(),
  productId: int("productId").notNull().references(() => products.id),
  imageUrl: varchar("imageUrl", { length: 1024 }).notNull(),
  imageKey: varchar("imageKey", { length: 512 }),
  isPrimary: boolean("isPrimary").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ProductImage = typeof productImages.$inferSelect;

// ─── Cart Items ───────────────────────────────────────────────────────────────
export const cartItems = mysqlTable("cart_items", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  productId: int("productId").notNull().references(() => products.id),
  quantity: int("quantity").default(1).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type CartItem = typeof cartItems.$inferSelect;

// ─── Orders ───────────────────────────────────────────────────────────────────
export const orders = mysqlTable("orders", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  totalAmount: decimal("totalAmount", { precision: 10, scale: 2 }).notNull(),
  deliveryFee: decimal("deliveryFee", { precision: 10, scale: 2 }).default("0").notNull(),
  deliveryType: mysqlEnum("deliveryType", ["free", "flat_rate"]).default("flat_rate").notNull(),
  status: mysqlEnum("status", ["pending", "quote_pending", "quote_approved", "quote_rejected", "awaiting_payment", "paid", "processing", "shipped", "completed", "cancelled"]).default("quote_pending").notNull(),
  paymentStatus: mysqlEnum("paymentStatus", ["pending", "awaiting_eft", "proof_uploaded", "paid", "failed"]).default("pending").notNull(),
  paymentMethod: mysqlEnum("paymentMethod", ["eft", "payfast"]),
  payfastReference: varchar("payfastReference", { length: 255 }),
  paidAt: timestamp("paidAt"),
  proofOfPaymentUrl: varchar("proofOfPaymentUrl", { length: 1024 }),
  proofOfPaymentKey: varchar("proofOfPaymentKey", { length: 512 }),
  proofUploadedAt: timestamp("proofUploadedAt"),
  proofStatus: mysqlEnum("proofStatus", ["not_submitted", "pending", "approved", "rejected"]).default("not_submitted").notNull(),
  proofReviewNote: text("proofReviewNote"),
  proofReviewedAt: timestamp("proofReviewedAt"),
  proofReviewedBy: int("proofReviewedBy"),
  quoteNotes: text("quoteNotes"),
  rejectionReason: text("rejectionReason"),
  reviewedBy: int("reviewedBy"),
  reviewedAt: timestamp("reviewedAt"),
  trackingNotes: text("trackingNotes"),
  trackingNumber: varchar("trackingNumber", { length: 128 }),
  trackingCarrier: varchar("trackingCarrier", { length: 64 }),
  trackingUrl: varchar("trackingUrl", { length: 1024 }),
  packedAt: timestamp("packedAt"),
  packedBy: int("packedBy"),
  courierBookedAt: timestamp("courierBookedAt"),
  courierBookedBy: int("courierBookedBy"),
  waybillNumber: varchar("waybillNumber", { length: 128 }),
  dispatchedAt: timestamp("dispatchedAt"),
  deliveredAt: timestamp("deliveredAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Order = typeof orders.$inferSelect;

// ─── Courier Tracking Events ───────────────────────────────────────────────────
export const orderTrackingEvents = mysqlTable("order_tracking_events", {
  id: int("id").autoincrement().primaryKey(),
  orderId: int("orderId").notNull().references(() => orders.id),
  eventCode: varchar("eventCode", { length: 64 }).notNull(),
  statusLabel: varchar("statusLabel", { length: 128 }).notNull(),
  description: text("description"),
  location: varchar("location", { length: 255 }),
  externalEventId: varchar("externalEventId", { length: 191 }),
  source: varchar("source", { length: 32 }).default("courier_api").notNull(),
  occurredAt: timestamp("occurredAt").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type OrderTrackingEvent = typeof orderTrackingEvents.$inferSelect;

// ─── Order Items ──────────────────────────────────────────────────────────────
export const orderItems = mysqlTable("order_items", {
  id: int("id").autoincrement().primaryKey(),
  orderId: int("orderId").notNull().references(() => orders.id),
  productId: int("productId").notNull().references(() => products.id),
  productNameSnapshot: varchar("productNameSnapshot", { length: 255 }),
  strengthSnapshot: varchar("strengthSnapshot", { length: 255 }),
  quantity: int("quantity").notNull(),
  priceAtPurchase: decimal("priceAtPurchase", { precision: 10, scale: 2 }).notNull(),
});

export type OrderItem = typeof orderItems.$inferSelect;

// ─── Shipping Details ─────────────────────────────────────────────────────────
export const shippingDetails = mysqlTable("shipping_details", {
  id: int("id").autoincrement().primaryKey(),
  orderId: int("orderId").notNull().references(() => orders.id),
  fullName: varchar("fullName", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 32 }).notNull(),
  addressLine1: varchar("addressLine1", { length: 255 }).notNull(),
  addressLine2: varchar("addressLine2", { length: 255 }),
  city: varchar("city", { length: 128 }).notNull(),
  postalCode: varchar("postalCode", { length: 16 }).notNull(),
  country: varchar("country", { length: 64 }).default("South Africa").notNull(),
});

export type ShippingDetail = typeof shippingDetails.$inferSelect;

// ─── Delivery Rules ───────────────────────────────────────────────────────────
export const deliveryRules = mysqlTable("delivery_rules", {
  id: int("id").autoincrement().primaryKey(),
  locationName: varchar("locationName", { length: 128 }).notNull(),
  deliveryType: mysqlEnum("deliveryType", ["free", "flat_rate"]).notNull(),
  fee: decimal("fee", { precision: 10, scale: 2 }).default("0").notNull(),
});

export type DeliveryRule = typeof deliveryRules.$inferSelect;

// ─── Quote Comments ────────────────────────────────────────────────────────────
export const orderComments = mysqlTable("order_comments", {
  id: int("id").autoincrement().primaryKey(),
  orderId: int("orderId").notNull().references(() => orders.id),
  userId: int("userId").notNull().references(() => users.id),
  body: text("body").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type OrderComment = typeof orderComments.$inferSelect;
