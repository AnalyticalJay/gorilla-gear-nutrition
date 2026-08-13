import { and, count, desc, eq, gte, inArray, like, lte, or, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  cartItems,
  categories,
  deliveryRules,
  InsertUser,
  orderComments,
  orderItems,
  orderTrackingEvents,
  orders,
  productImages,
  products,
  shippingDetails,
  userApprovals,
  users,
} from "../drizzle/schema";
import { ENV } from "./_core/env";
import { getOrderStatusTimelineUpdates } from "../shared/orderTracking";
import { NATIONWIDE_SHIPPING_FEE_ZAR } from "../shared/shipping";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ─── Auth / Users ─────────────────────────────────────────────────────────────

export async function upsertUser(user: Record<string, unknown>): Promise<void> {
  const db = await getDb();
  if (!db) return;

  const openId = user.openId as string | null | undefined;
  if (!openId) return;

  const isOwner = openId === ENV.ownerOpenId;
  const role = isOwner ? "admin" : ((user.role as string) ?? "user");
  const email = (user.email as string | null) ?? "";
  const fullName = (user.fullName as string) ?? (user.name as string) ?? openId;

  await db
    .insert(users)
    .values({
      openId,
      fullName,
      email,
      loginMethod: (user.loginMethod as string) ?? "oauth",
      role: role as "user" | "admin",
      status: isOwner ? "approved" : "pending",
      lastSignedIn: new Date(),
    })
    .onDuplicateKeyUpdate({
      set: {
        fullName: fullName ?? undefined,
        email: email ?? undefined,
        loginMethod: (user.loginMethod as string) ?? undefined,
        lastSignedIn: new Date(),
      },
    });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}

export async function getUserByEmail(email: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return result[0];
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result[0];
}

export async function createEmailUser(data: {
  fullName: string;
  email: string;
  phone: string;
  city: string;
  passwordHash: string;
  isOver18: boolean;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(users).values({
    fullName: data.fullName,
    email: data.email,
    phone: data.phone,
    city: data.city,
    passwordHash: data.passwordHash,
    loginMethod: "email",
    role: "user",
    status: "pending",
    isOver18: data.isOver18,
    isActive: true,
  });
  const userId = (result as unknown as { insertId: number }).insertId;
  // Create approval record
  await db.insert(userApprovals).values({
    userId,
    submittedData: { fullName: data.fullName, email: data.email, phone: data.phone, city: data.city },
    status: "pending",
  });
  return userId;
}

export async function getAllUsers() {
  const db = await getDb();
  if (!db) return [];
  return db
    .select({
      id: users.id,
      fullName: users.fullName,
      email: users.email,
      phone: users.phone,
      city: users.city,
      role: users.role,
      status: users.status,
      isActive: users.isActive,
      createdAt: users.createdAt,
    })
    .from(users)
    .orderBy(users.createdAt);
}

export async function updateUserStatus(
  userId: number,
  status: "approved" | "rejected",
  adminId: number,
  notes?: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(users).set({ status }).where(eq(users.id, userId));
  await db
    .update(userApprovals)
    .set({ status, approvedBy: adminId, adminNotes: notes ?? null, reviewedAt: new Date() })
    .where(eq(userApprovals.userId, userId));
}

// ─── Admin Analytics ──────────────────────────────────────────────────────────

export async function getAdminAnalytics() {
  const empty = {
    generatedAt: new Date().toISOString(),
    users: { total: 0, pending: 0, approved: 0, rejected: 0, newLast30Days: 0 },
    products: { total: 0, active: 0, withImages: 0, missingImages: 0, imageCoveragePercent: 0, categories: 0 },
    quotes: { total: 0, pending: 0, approved: 0, rejected: 0, awaitingPayment: 0 },
    orders: { total: 0, paid: 0, processing: 0, shipped: 0, completed: 0, cancelled: 0, revenue: "0.00", averagePaidOrderValue: "0.00" },
    recentUsers: [] as Array<{ id: number; fullName: string; status: string; createdAt: Date }>,
    recentOrders: [] as Array<{ id: number; userFullName: string; status: string; paymentStatus: string; totalAmount: string; createdAt: Date }>,
  };

  const db = await getDb();
  if (!db) return empty;

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const [
    userStatusRows,
    newUserRows,
    totalProductRows,
    activeProductRows,
    imageProductRows,
    categoryRows,
    orderStatusRows,
    paidOrderRows,
    recentUsers,
    recentOrders,
  ] = await Promise.all([
    db.select({ status: users.status, count: count() }).from(users).groupBy(users.status),
    db.select({ count: count() }).from(users).where(gte(users.createdAt, thirtyDaysAgo)),
    db.select({ count: count() }).from(products),
    db.select({ count: count() }).from(products).where(eq(products.isActive, true)),
    db
      .select({ count: sql<number>`count(distinct ${productImages.productId})` })
      .from(productImages)
      .innerJoin(products, eq(productImages.productId, products.id))
      .where(eq(products.isActive, true)),
    db.select({ count: count() }).from(categories).where(eq(categories.isActive, true)),
    db.select({ status: orders.status, count: count() }).from(orders).groupBy(orders.status),
    db
      .select({ count: count(), revenue: sql<string>`coalesce(sum(${orders.totalAmount}), 0)` })
      .from(orders)
      .where(eq(orders.paymentStatus, "paid")),
    db
      .select({ id: users.id, fullName: users.fullName, status: users.status, createdAt: users.createdAt })
      .from(users)
      .orderBy(desc(users.createdAt))
      .limit(5),
    db
      .select({
        id: orders.id,
        userFullName: users.fullName,
        status: orders.status,
        paymentStatus: orders.paymentStatus,
        totalAmount: orders.totalAmount,
        createdAt: orders.createdAt,
      })
      .from(orders)
      .innerJoin(users, eq(orders.userId, users.id))
      .orderBy(desc(orders.createdAt))
      .limit(5),
  ]);

  const userCount = (status: string) => Number(userStatusRows.find((row) => row.status === status)?.count ?? 0);
  const orderCount = (status: string) => Number(orderStatusRows.find((row) => row.status === status)?.count ?? 0);
  const totalProducts = Number(totalProductRows[0]?.count ?? 0);
  const activeProducts = Number(activeProductRows[0]?.count ?? 0);
  const productsWithImages = Number(imageProductRows[0]?.count ?? 0);
  const paidOrders = Number(paidOrderRows[0]?.count ?? 0);
  const revenue = Number(paidOrderRows[0]?.revenue ?? 0);
  const orderStatuses = orderStatusRows.reduce((total, row) => total + Number(row.count), 0);
  const totalOrders = Math.max(orderStatuses, 0);

  return {
    generatedAt: new Date().toISOString(),
    users: {
      total: userStatusRows.reduce((total, row) => total + Number(row.count), 0),
      pending: userCount("pending"),
      approved: userCount("approved"),
      rejected: userCount("rejected"),
      newLast30Days: Number(newUserRows[0]?.count ?? 0),
    },
    products: {
      total: totalProducts,
      active: activeProducts,
      withImages: productsWithImages,
      missingImages: Math.max(activeProducts - productsWithImages, 0),
      imageCoveragePercent: activeProducts === 0 ? 0 : Math.round((productsWithImages / activeProducts) * 1000) / 10,
      categories: Number(categoryRows[0]?.count ?? 0),
    },
    quotes: {
      total: orderCount("quote_pending") + orderCount("quote_approved") + orderCount("quote_rejected"),
      pending: orderCount("quote_pending"),
      approved: orderCount("quote_approved"),
      rejected: orderCount("quote_rejected"),
      awaitingPayment: orderCount("awaiting_payment"),
    },
    orders: {
      total: totalOrders,
      paid: paidOrders,
      processing: orderCount("processing"),
      shipped: orderCount("shipped"),
      completed: orderCount("completed"),
      cancelled: orderCount("cancelled"),
      revenue: revenue.toFixed(2),
      averagePaidOrderValue: paidOrders === 0 ? "0.00" : (revenue / paidOrders).toFixed(2),
    },
    recentUsers,
    recentOrders,
  };
}

// ─── Categories ───────────────────────────────────────────────────────────────

export async function getCategories() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(categories).where(eq(categories.isActive, true)).orderBy(categories.name);
}

export async function getAllCategories() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(categories).orderBy(categories.name);
}

export async function createCategory(data: { name: string; slug: string; description?: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(categories).values({ ...data, isActive: true });
}

export async function updateCategory(
  id: number,
  data: { name?: string; slug?: string; description?: string; isActive?: boolean }
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(categories).set(data).where(eq(categories.id, id));
}

export async function deleteCategory(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(categories).set({ isActive: false }).where(eq(categories.id, id));
}

// ─── Products ─────────────────────────────────────────────────────────────────

export async function getProducts(opts?: {
  categoryId?: number;
  search?: string;
  featuredOnly?: boolean;
  activeOnly?: boolean;
}) {
  const db = await getDb();
  if (!db) return [];

  const rows = await db
    .select({
      id: products.id,
      name: products.name,
      slug: products.slug,
      description: products.description,
      dosageInfo: products.dosageInfo,
      categoryId: products.categoryId,
      price: products.price,
      stockQuantity: products.stockQuantity,
      isActive: products.isActive,
      isFeatured: products.isFeatured,
      createdAt: products.createdAt,
      categoryName: categories.name,
    })
    .from(products)
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .where(
      and(
        opts?.activeOnly !== false ? eq(products.isActive, true) : undefined,
        opts?.categoryId ? eq(products.categoryId, opts.categoryId) : undefined,
        opts?.featuredOnly ? eq(products.isFeatured, true) : undefined
      )
    )
    .orderBy(products.createdAt);

  // Attach primary images
  const productIds = rows.map((r) => r.id);
  if (productIds.length === 0) return rows.map((r) => ({ ...r, primaryImage: null }));

  const images = await db
    .select()
    .from(productImages)
    .where(and(inArray(productImages.productId, productIds), eq(productImages.isPrimary, true)));

  const imageMap = new Map(images.map((img) => [img.productId, img.imageUrl]));

  let filtered = rows;
  if (opts?.search) {
    const q = opts.search.toLowerCase();
    filtered = rows.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        (r.description ?? "").toLowerCase().includes(q)
    );
  }

  return filtered.map((r) => ({ ...r, primaryImage: imageMap.get(r.id) ?? null }));
}

export async function getProductsPage(opts: {
  categoryId?: number;
  search?: string;
  featuredOnly?: boolean;
  activeOnly?: boolean;
  brand?: string;
  maxPrice?: number;
  limit?: number;
  offset?: number;
}) {
  const db = await getDb();
  const limit = Math.min(Math.max(opts.limit ?? 24, 1), 48);
  const offset = Math.max(opts.offset ?? 0, 0);
  if (!db) return { items: [], total: 0, limit, offset };

  const conditions = [
    opts.activeOnly !== false ? eq(products.isActive, true) : undefined,
    opts.categoryId ? eq(products.categoryId, opts.categoryId) : undefined,
    opts.featuredOnly ? eq(products.isFeatured, true) : undefined,
    opts.search
      ? or(
          like(products.name, `%${opts.search}%`),
          like(products.description, `%${opts.search}%`),
        )
      : undefined,
    opts.maxPrice && opts.maxPrice > 0 ? lte(products.price, opts.maxPrice.toFixed(2)) : undefined,
  ];

  const brandPatterns: Record<string, string[]> = {
    "Ouroboros Labs": ["OL -%", "%ouroboros%"],
    "Keifei Pharmaceuticals": ["Keifei%"],
    "UPA Labs": ["UPA -%", "%UPA Labs%"],
    Genesis: ["GEN -%", "%Genesis%"],
    Biolab: ["BIO -%", "%Biolab%"],
    Mactropin: ["MAC -%", "%Mactropin%"],
    "SP Laboratories": ["SP -%", "%SP Laboratories%"],
    "HD Labs": ["HD -%", "%HD Labs%"],
    "BP Pharma": ["BP -%", "%BP Pharma%"],
  };
  const selectedBrandPatterns = opts.brand ? brandPatterns[opts.brand] : undefined;
  if (selectedBrandPatterns) {
    conditions.push(or(...selectedBrandPatterns.map((pattern) => like(products.name, pattern))));
  }

  const whereClause = and(...conditions);
  const [totalRows, rows] = await Promise.all([
    db
      .select({ count: count() })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .where(whereClause),
    db
      .select({
        id: products.id,
        name: products.name,
        slug: products.slug,
        description: products.description,
        dosageInfo: products.dosageInfo,
        categoryId: products.categoryId,
        price: products.price,
        stockQuantity: products.stockQuantity,
        isActive: products.isActive,
        isFeatured: products.isFeatured,
        createdAt: products.createdAt,
        categoryName: categories.name,
      })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .where(whereClause)
      .orderBy(products.createdAt)
      .limit(limit)
      .offset(offset),
  ]);

  const productIds = rows.map((row) => row.id);
  if (productIds.length === 0) {
    return { items: [], total: Number(totalRows[0]?.count ?? 0), limit, offset };
  }

  const images = await db
    .select()
    .from(productImages)
    .where(and(inArray(productImages.productId, productIds), eq(productImages.isPrimary, true)));
  const imageMap = new Map(images.map((image) => [image.productId, image.imageUrl]));

  return {
    items: rows.map((row) => ({ ...row, primaryImage: imageMap.get(row.id) ?? null })),
    total: Number(totalRows[0]?.count ?? 0),
    limit,
    offset,
  };
}

export async function getProductBySlug(slug: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(products)
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .where(eq(products.slug, slug))
    .limit(1);
  if (!result[0]) return undefined;

  const images = await db
    .select()
    .from(productImages)
    .where(eq(productImages.productId, result[0].products.id))
    .orderBy(productImages.isPrimary);

  return { ...result[0].products, category: result[0].categories, images };
}

export async function getProductById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(products).where(eq(products.id, id)).limit(1);
  return result[0];
}

export async function createProduct(data: {
  name: string;
  slug: string;
  description?: string;
  dosageInfo?: string;
  categoryId?: number;
  price: string;
  stockQuantity: number;
  isActive: boolean;
  isFeatured: boolean;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(products).values(data);
  return (result as unknown as { insertId: number }).insertId;
}

export async function updateProduct(
  id: number,
  data: Partial<{
    name: string;
    slug: string;
    description: string;
    dosageInfo: string;
    categoryId: number;
    price: string;
    stockQuantity: number;
    isActive: boolean;
    isFeatured: boolean;
  }>
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(products).set(data).where(eq(products.id, id));
}

export async function deleteProduct(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(products).set({ isActive: false }).where(eq(products.id, id));
}

// ─── Product Images ───────────────────────────────────────────────────────────

export async function addProductImage(data: {
  productId: number;
  imageUrl: string;
  imageKey: string;
  isPrimary: boolean;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  if (data.isPrimary) {
    await db
      .update(productImages)
      .set({ isPrimary: false })
      .where(eq(productImages.productId, data.productId));
  }
  await db.insert(productImages).values(data);
}

export async function getProductImages(productId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(productImages).where(eq(productImages.productId, productId));
}

export async function getProductsForImageMatching() {
  const db = await getDb();
  if (!db) return [];
  return db
    .select({ id: products.id, name: products.name, slug: products.slug, isActive: products.isActive })
    .from(products)
    .where(eq(products.isActive, true))
    .orderBy(products.name);
}

export function normalizeProductImageKey(value: string) {
  return value
    .replace(/\.[a-z0-9]{2,5}$/i, "")
    .replace(/[_-]+/g, " ")
    .replace(/[^a-z0-9]+/gi, " ")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

export function getProductImageMatchKeys(product: { name: string; slug: string }) {
  return [normalizeProductImageKey(product.name), normalizeProductImageKey(product.slug)];
}

export async function saveProductImage(data: {
  productId: number;
  imageUrl: string;
  imageKey: string;
  isPrimary: boolean;
}) {
  return addProductImage(data);
}

export async function getProductImageCount(productId: number) {
  const db = await getDb();
  if (!db) return 0;
  const rows = await db.select({ id: productImages.id }).from(productImages).where(eq(productImages.productId, productId));
  return rows.length;
}

export async function setPrimaryImageIfNeeded(productId: number) {
  const db = await getDb();
  if (!db) return;
  const primary = await db
    .select({ id: productImages.id })
    .from(productImages)
    .where(and(eq(productImages.productId, productId), eq(productImages.isPrimary, true)))
    .limit(1);
  if (!primary[0]) {
    const first = await db
      .select({ id: productImages.id })
      .from(productImages)
      .where(eq(productImages.productId, productId))
      .orderBy(productImages.createdAt)
      .limit(1);
    if (first[0]) await db.update(productImages).set({ isPrimary: true }).where(eq(productImages.id, first[0].id));
  }
}


export async function setPrimaryImage(imageId: number, productId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db
    .update(productImages)
    .set({ isPrimary: false })
    .where(eq(productImages.productId, productId));
  await db.update(productImages).set({ isPrimary: true }).where(eq(productImages.id, imageId));
}

export async function deleteProductImage(imageId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(productImages).where(eq(productImages.id, imageId));
}

// ─── Cart ─────────────────────────────────────────────────────────────────────

export async function getCartItems(userId: number) {
  const db = await getDb();
  if (!db) return [];
  const items = await db
    .select({
      id: cartItems.id,
      quantity: cartItems.quantity,
      productId: products.id,
      productName: products.name,
      productSlug: products.slug,
      productPrice: products.price,
      productStock: products.stockQuantity,
    })
    .from(cartItems)
    .innerJoin(products, eq(cartItems.productId, products.id))
    .where(eq(cartItems.userId, userId));

  const productIds = items.map((i) => i.productId);
  if (productIds.length === 0) return items.map((i) => ({ ...i, primaryImage: null }));

  const images = await db
    .select()
    .from(productImages)
    .where(and(inArray(productImages.productId, productIds), eq(productImages.isPrimary, true)));

  const imageMap = new Map(images.map((img) => [img.productId, img.imageUrl]));
  return items.map((i) => ({ ...i, primaryImage: imageMap.get(i.productId) ?? null }));
}

export async function upsertCartItem(userId: number, productId: number, quantity: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const existing = await db
    .select()
    .from(cartItems)
    .where(and(eq(cartItems.userId, userId), eq(cartItems.productId, productId)))
    .limit(1);
  if (existing[0]) {
    await db
      .update(cartItems)
      .set({ quantity })
      .where(and(eq(cartItems.userId, userId), eq(cartItems.productId, productId)));
  } else {
    await db.insert(cartItems).values({ userId, productId, quantity });
  }
}

export async function removeCartItem(userId: number, cartItemId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db
    .delete(cartItems)
    .where(and(eq(cartItems.id, cartItemId), eq(cartItems.userId, userId)));
}

export async function clearCart(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(cartItems).where(eq(cartItems.userId, userId));
}

// ─── Delivery ─────────────────────────────────────────────────────────────────

export function calculateDelivery(_city: string): { type: "flat_rate"; fee: number } {
  return { type: "flat_rate", fee: NATIONWIDE_SHIPPING_FEE_ZAR };
}

// ─── Orders ───────────────────────────────────────────────────────────────────

export async function createOrder(data: {
  userId: number;
  items: Array<{ productId: number; quantity: number; priceAtPurchase: string }>;
  totalAmount: string;
  deliveryFee: string;
  deliveryType: "free" | "flat_rate";
  quoteNotes?: string;
  status?: "pending" | "quote_pending";
  shipping: {
    fullName: string;
    phone: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    postalCode: string;
    country: string;
  };
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const orderResult = await db.insert(orders).values({
    userId: data.userId,
    totalAmount: data.totalAmount,
    deliveryFee: data.deliveryFee,
    deliveryType: data.deliveryType,
    status: data.status ?? "quote_pending",
    paymentStatus: "pending",
    quoteNotes: data.quoteNotes ?? null,
  });
  const orderId = (orderResult as unknown as { insertId: number }).insertId;
  const productIds = Array.from(new Set(data.items.map((item) => item.productId)));
  const productRows = productIds.length > 0
    ? await db.select({ id: products.id, name: products.name, dosageInfo: products.dosageInfo }).from(products).where(inArray(products.id, productIds))
    : [];
  const productById = new Map(productRows.map((product) => [product.id, product]));

  for (const item of data.items) {
    const product = productById.get(item.productId);
    await db.insert(orderItems).values({
      orderId,
      productId: item.productId,
      productNameSnapshot: product?.name ?? `Product #${item.productId}`,
      strengthSnapshot: product?.dosageInfo ?? null,
      quantity: item.quantity,
      priceAtPurchase: typeof item.priceAtPurchase === "number" ? (item.priceAtPurchase as number).toFixed(2) : String(item.priceAtPurchase ?? "0"),
    });
  }

  await db.insert(shippingDetails).values({ orderId, ...data.shipping });

  return orderId;
}

export async function reviewQuote(
  orderId: number,
  adminId: number,
  decision: "quote_approved" | "quote_rejected",
  notes?: string,
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const order = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
  if (!order[0]) throw new Error("Quote not found");
  if (order[0].status !== "quote_pending") throw new Error("Quote has already been reviewed");

  await db.update(orders).set({
    status: decision,
    quoteNotes: decision === "quote_approved" ? notes ?? null : order[0].quoteNotes,
    rejectionReason: decision === "quote_rejected" ? notes ?? null : null,
    reviewedBy: adminId,
    reviewedAt: new Date(),
  }).where(eq(orders.id, orderId));
}

export async function chooseQuotePayment(
  orderId: number,
  userId: number,
  method: "eft" | "payfast",
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const order = await db.select().from(orders).where(and(eq(orders.id, orderId), eq(orders.userId, userId))).limit(1);
  if (!order[0]) throw new Error("Quote not found");
  const canChoosePayment = order[0].status === "quote_approved" || (order[0].status === "awaiting_payment" && !order[0].paymentMethod);
  if (!canChoosePayment) throw new Error("Quote is not approved for payment");

  const payfastReference = method === "payfast" ? `AA-${orderId}-${Date.now()}` : null;
  await db.update(orders).set({
    paymentMethod: method,
    status: "awaiting_payment",
    paymentStatus: method === "eft" ? "awaiting_eft" : "pending",
    payfastReference,
  }).where(eq(orders.id, orderId));

  return { payfastReference, total: order[0].totalAmount };
}

export async function getUserOrders(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(orders)
    .where(eq(orders.userId, userId))
    .orderBy(orders.createdAt);
}

export async function getOrderTrackingEvents(orderId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(orderTrackingEvents)
    .where(eq(orderTrackingEvents.orderId, orderId))
    .orderBy(desc(orderTrackingEvents.occurredAt), desc(orderTrackingEvents.id));
}

export async function saveOrderTrackingEvents(orderId: number, events: Array<{
  eventCode: string;
  statusLabel: string;
  description?: string | null;
  location?: string | null;
  externalEventId?: string | null;
  source?: string;
  occurredAt: Date;
}>) {
  const db = await getDb();
  if (!db || events.length === 0) return 0;

  const existing = await db
    .select({
      eventCode: orderTrackingEvents.eventCode,
      occurredAt: orderTrackingEvents.occurredAt,
      location: orderTrackingEvents.location,
      externalEventId: orderTrackingEvents.externalEventId,
    })
    .from(orderTrackingEvents)
    .where(eq(orderTrackingEvents.orderId, orderId));
  const eventKey = (event: { eventCode: string; occurredAt: Date; location?: string | null; externalEventId?: string | null }) =>
    event.externalEventId || `${event.eventCode}|${event.occurredAt.toISOString()}|${event.location ?? ""}`;
  const knownKeys = new Set(existing.map((event) => eventKey(event)));
  const newEvents = events.filter((event) => {
    const key = eventKey(event);
    if (knownKeys.has(key)) return false;
    knownKeys.add(key);
    return true;
  });
  if (newEvents.length === 0) return 0;

  await db.insert(orderTrackingEvents).values(newEvents.map((event) => ({
    orderId,
    eventCode: event.eventCode.slice(0, 64),
    statusLabel: event.statusLabel.slice(0, 128),
    description: event.description ?? null,
    location: event.location?.slice(0, 255) ?? null,
    externalEventId: event.externalEventId?.slice(0, 191) ?? null,
    source: (event.source ?? "courier_api").slice(0, 32),
    occurredAt: event.occurredAt,
  })));
  return newEvents.length;
}

export async function getOrderById(orderId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const orderResult = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
  if (!orderResult[0]) return undefined;

  const rawItems = await db
    .select({
      id: orderItems.id,
      quantity: orderItems.quantity,
      priceAtPurchase: orderItems.priceAtPurchase,
      productId: orderItems.productId,
      productNameSnapshot: orderItems.productNameSnapshot,
      strengthSnapshot: orderItems.strengthSnapshot,
      productName: products.name,
      strength: products.dosageInfo,
      productSlug: products.slug,
    })
    .from(orderItems)
    .leftJoin(products, eq(orderItems.productId, products.id))
    .where(eq(orderItems.orderId, orderId));
  const items = rawItems.map((item) => ({
    id: item.id,
    quantity: item.quantity,
    priceAtPurchase: item.priceAtPurchase,
    productId: item.productId,
    productName: item.productName ?? item.productNameSnapshot ?? `Product #${item.productId}`,
    strength: item.strength ?? item.strengthSnapshot ?? null,
    productSlug: item.productSlug ?? null,
  }));

  const shipping = await db
    .select()
    .from(shippingDetails)
    .where(eq(shippingDetails.orderId, orderId))
    .limit(1);

  const comments = await getOrderComments(orderId);
  const trackingEvents = await getOrderTrackingEvents(orderId);
  return { ...orderResult[0], items, shipping: shipping[0] ?? null, comments, trackingEvents };
}

export async function getOrderComments(orderId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select({
      id: orderComments.id,
      orderId: orderComments.orderId,
      userId: orderComments.userId,
      body: orderComments.body,
      createdAt: orderComments.createdAt,
      authorName: users.fullName,
      authorRole: users.role,
    })
    .from(orderComments)
    .innerJoin(users, eq(orderComments.userId, users.id))
    .where(eq(orderComments.orderId, orderId))
    .orderBy(desc(orderComments.createdAt));
}

export async function createOrderComment(data: { orderId: number; userId: number; body: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(orderComments).values(data);
  return (result as unknown as { insertId: number }).insertId;
}

export async function getAllOrders() {
  const db = await getDb();
  if (!db) return [];
  return db
    .select({
      id: orders.id,
      totalAmount: orders.totalAmount,
      deliveryFee: orders.deliveryFee,
      deliveryType: orders.deliveryType,
      status: orders.status,
      paymentStatus: orders.paymentStatus,
      paymentMethod: orders.paymentMethod,
      payfastReference: orders.payfastReference,
      trackingNumber: orders.trackingNumber,
      trackingCarrier: orders.trackingCarrier,
      trackingUrl: orders.trackingUrl,
      dispatchedAt: orders.dispatchedAt,
      deliveredAt: orders.deliveredAt,
      quoteNotes: orders.quoteNotes,
      rejectionReason: orders.rejectionReason,
      reviewedAt: orders.reviewedAt,
      createdAt: orders.createdAt,
      userId: orders.userId,
      userFullName: users.fullName,
      userEmail: users.email,
    })
    .from(orders)
    .innerJoin(users, eq(orders.userId, users.id))
    .orderBy(orders.createdAt);
}

export async function updateOrderTracking(
  orderId: number,
  data: {
    trackingNumber?: string | null;
    trackingCarrier?: string | null;
    trackingUrl?: string | null;
    trackingNotes?: string | null;
  },
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(orders).set(data).where(eq(orders.id, orderId));
}

export async function updateOrderStatus(
  orderId: number,
  status: "pending" | "quote_pending" | "quote_approved" | "quote_rejected" | "awaiting_payment" | "paid" | "processing" | "shipped" | "completed" | "cancelled",
  notes?: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const current = await db.select({ dispatchedAt: orders.dispatchedAt }).from(orders).where(eq(orders.id, orderId)).limit(1);
  if (!current[0]) throw new Error("Order not found");
  const now = new Date();
  await db
    .update(orders)
    .set({
      status,
      trackingNotes: notes ?? undefined,
      ...getOrderStatusTimelineUpdates(status, current[0].dispatchedAt, now),
    })
    .where(eq(orders.id, orderId));
}

export async function confirmEftPayment(orderId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const order = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
  if (!order[0]) throw new Error("Order not found");
  const legacyPendingProof = order[0].proofStatus === "not_submitted" && order[0].paymentStatus === "proof_uploaded" && !!order[0].proofOfPaymentUrl;
  if (order[0].paymentMethod !== "eft" || (order[0].proofStatus !== "pending" && !legacyPendingProof)) throw new Error("A submitted proof of payment is required before approval");
  await db.update(orders).set({
    paymentStatus: "paid",
    status: "paid",
    paymentMethod: "eft",
    proofStatus: "approved",
    proofReviewNote: null,
    proofReviewedAt: new Date(),
    paidAt: new Date(),
  }).where(eq(orders.id, orderId));
}

export async function uploadProofOfPayment(orderId: number, userId: number, url: string, key: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const order = await db.select().from(orders).where(and(eq(orders.id, orderId), eq(orders.userId, userId))).limit(1);
  if (!order[0]) throw new Error("Order not found");
  await db.update(orders).set({
    paymentStatus: "proof_uploaded",
    proofOfPaymentUrl: url,
    proofOfPaymentKey: key,
    proofUploadedAt: new Date(),
    proofStatus: "pending",
    proofReviewNote: null,
    proofReviewedAt: null,
    proofReviewedBy: null,
  }).where(eq(orders.id, orderId));
}

export async function rejectProofOfPayment(orderId: number, adminId: number, note: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const order = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
  if (!order[0]) throw new Error("Order not found");
  const legacyPendingProof = order[0].proofStatus === "not_submitted" && order[0].paymentStatus === "proof_uploaded" && !!order[0].proofOfPaymentUrl;
  if (order[0].paymentMethod !== "eft" || (order[0].proofStatus !== "pending" && !legacyPendingProof)) throw new Error("A submitted proof of payment is required before rejection");
  await db.update(orders).set({
    paymentStatus: "awaiting_eft",
    status: "awaiting_payment",
    proofStatus: "rejected",
    proofReviewNote: note,
    proofReviewedAt: new Date(),
    proofReviewedBy: adminId,
  }).where(eq(orders.id, orderId));
}

export async function getOrderByPayFastReference(payfastReference: string) {
  const db = await getDb();
  if (!db) return undefined;
  const rows = await db.select().from(orders).where(eq(orders.payfastReference, payfastReference)).limit(1);
  return rows[0];
}

export async function updateOrderPayment(
  payfastReference: string,
  paymentStatus: "paid" | "failed"
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db
    .update(orders)
    .set({
      paymentStatus,
      status: paymentStatus === "paid" ? "paid" : "cancelled",
      payfastReference,
      ...(paymentStatus === "paid" ? { paidAt: new Date() } : {}),
    })
    .where(eq(orders.payfastReference, payfastReference));
}
