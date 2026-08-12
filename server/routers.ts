import { TRPCError } from "@trpc/server";
import bcrypt from "bcryptjs";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { notifyOwner } from "./_core/notification";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { storagePut } from "./storage";
import {
  addProductImage,
  calculateDelivery,
  chooseQuotePayment,
  confirmEftPayment,
  clearCart,
  createCategory,
  createEmailUser,
  createOrder,
  createOrderComment,
  createProduct,
  deleteCategory,
  deleteProduct,
  deleteProductImage,
  getAdminAnalytics,
  getAllCategories,
  getAllOrders,
  getAllUsers,
  getCartItems,
  getCategories,
  getDb,
  getOrderById,
  getOrderComments,
  getProductById,
  getProductBySlug,
  getProductImages,
  getProducts,
  getProductsPage,
  getProductsForImageMatching,
  getProductImageMatchKeys,
  normalizeProductImageKey,
  getUserByEmail,
  getUserById,
  removeCartItem,
  reviewQuote,
  setPrimaryImage,
  updateCategory,
  updateOrderStatus,
  updateOrderTracking,
  updateOrderPayment,
  uploadProofOfPayment,
  rejectProofOfPayment,
  updateProduct,
  updateUserStatus,
  upsertCartItem,
} from "./db";
import { z } from "zod";
import { orders, users } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import { ENV } from "./_core/env";
import { countPendingQuotes } from "../shared/adminStats";

// ─── Middleware ───────────────────────────────────────────────────────────────

const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
  }
  return next({ ctx });
});

const approvedProcedure = protectedProcedure.use(({ ctx, next }) => {
  if ((ctx.user as any).status !== "approved") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Account not yet approved" });
  }
  return next({ ctx });
});

// ─── App Router ───────────────────────────────────────────────────────────────

export const appRouter = router({
  system: systemRouter,

  // ─── Auth ─────────────────────────────────────────────────────────────────
  auth: router({
    me: publicProcedure.query(async ({ ctx }) => {
      if (!ctx.user) return null;
      // Return full user including status
      const user = await getUserById(ctx.user.id);
      return user ?? null;
    }),

    register: publicProcedure
      .input(
        z.object({
          fullName: z.string().min(2),
          email: z.string().email(),
          phone: z.string().min(7),
          city: z.string().min(2),
          password: z.string().min(8),
          isOver18: z.boolean().refine((v) => v === true, { message: "You must be 18+" }),
        })
      )
      .mutation(async ({ input }) => {
        const existing = await getUserByEmail(input.email);
        if (existing) {
          throw new TRPCError({ code: "CONFLICT", message: "Email already registered" });
        }
        const passwordHash = await bcrypt.hash(input.password, 12);
        const userId = await createEmailUser({
          fullName: input.fullName,
          email: input.email,
          phone: input.phone,
          city: input.city,
          passwordHash,
          isOver18: input.isOver18,
        });
        // Notify owner
        await notifyOwner({
          title: "New User Registration",
          content: `New user **${input.fullName}** (${input.email}) from ${input.city} has registered and is awaiting approval.`,
        }).catch(() => {});
        return { success: true, userId };
      }),

    login: publicProcedure
      .input(z.object({ email: z.string().email(), password: z.string() }))
      .mutation(async ({ input, ctx }) => {
        const user = await getUserByEmail(input.email);
        if (!user || !user.passwordHash) {
          throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid email or password" });
        }
        const valid = await bcrypt.compare(input.password, user.passwordHash);
        if (!valid) {
          throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid email or password" });
        }
        if (!user.isActive) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Account is deactivated" });
        }

        // Create session token
        const { sdk } = await import("./_core/sdk");
        const token = await sdk.createSessionToken(user.id.toString());
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, token, cookieOptions);

        return { success: true, user: { id: user.id, fullName: user.fullName, email: user.email, role: user.role, status: user.status } };
      }),

    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),

    updateProfile: protectedProcedure
      .input(z.object({ fullName: z.string().min(2).optional(), phone: z.string().optional(), city: z.string().optional() }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        await db.update(users).set(input).where(eq(users.id, ctx.user.id));
        return { success: true };
      }),
  }),

  // ─── Categories ───────────────────────────────────────────────────────────
  categories: router({
    list: publicProcedure.query(() => getCategories()),
    listAll: adminProcedure.query(() => getAllCategories()),

    create: adminProcedure
      .input(z.object({ name: z.string().min(1), slug: z.string().min(1), description: z.string().optional() }))
      .mutation(({ input }) => createCategory(input)),

    update: adminProcedure
      .input(z.object({ id: z.number(), name: z.string().optional(), slug: z.string().optional(), description: z.string().optional(), isActive: z.boolean().optional() }))
      .mutation(({ input }) => {
        const { id, ...data } = input;
        return updateCategory(id, data);
      }),

    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ input }) => deleteCategory(input.id)),
  }),

  // ─── Products ─────────────────────────────────────────────────────────────
  products: router({
    list: publicProcedure
      .input(z.object({ categoryId: z.number().optional(), search: z.string().optional(), featuredOnly: z.boolean().optional() }).optional())
      .query(async ({ ctx, input }) => {
        const rows = await getProducts({ ...input, activeOnly: true });
        const isApproved = ctx.user && (ctx.user as any).status === "approved";
        // Strip prices for non-approved users — server-enforced
        return rows.map((p) => ({
          ...p,
          price: isApproved ? p.price : null,
        }));
      }),

    listPage: publicProcedure
      .input(z.object({
        categoryId: z.number().optional(),
        search: z.string().optional(),
        featuredOnly: z.boolean().optional(),
        brand: z.string().optional(),
        maxPrice: z.number().nonnegative().optional(),
        limit: z.number().int().min(1).max(48).default(24),
        offset: z.number().int().min(0).default(0),
      }).optional())
      .query(async ({ ctx, input }) => {
        const page = await getProductsPage({ ...input, activeOnly: true });
        const isApproved = ctx.user && (ctx.user as any).status === "approved";
        return {
          ...page,
          items: page.items.map((product) => ({
            ...product,
            price: isApproved ? product.price : null,
          })),
        };
      }),

    listAdmin: adminProcedure
      .input(z.object({ categoryId: z.number().optional(), search: z.string().optional() }).optional())
      .query(({ input }) => getProducts({ ...input, activeOnly: false })),

    byId: adminProcedure
      .input(z.object({ id: z.number() }))
      .query(({ input }) => getProductById(input.id)),

    bySlug: publicProcedure
      .input(z.object({ slug: z.string() }))
      .query(async ({ ctx, input }) => {
        const product = await getProductBySlug(input.slug);
        if (!product) throw new TRPCError({ code: "NOT_FOUND" });
        const isApproved = ctx.user && (ctx.user as any).status === "approved";
        return { ...product, price: isApproved ? product.price : null };
      }),

    create: adminProcedure
      .input(z.object({
        name: z.string().min(1),
        slug: z.string().min(1),
        description: z.string().optional(),
        dosageInfo: z.string().optional(),
        categoryId: z.number().optional(),
        price: z.string(),
        stockQuantity: z.number().default(0),
        isActive: z.boolean().default(true),
        isFeatured: z.boolean().default(false),
      }))
      .mutation(async ({ input }) => {
        const id = await createProduct(input);
        return { id };
      }),

    update: adminProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        slug: z.string().optional(),
        description: z.string().optional(),
        dosageInfo: z.string().optional(),
        categoryId: z.number().optional(),
        price: z.string().optional(),
        stockQuantity: z.number().optional(),
        isActive: z.boolean().optional(),
        isFeatured: z.boolean().optional(),
      }))
      .mutation(({ input }) => {
        const { id, ...data } = input;
        return updateProduct(id, data);
      }),

    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ input }) => deleteProduct(input.id)),

    matchImageFiles: adminProcedure
      .input(z.object({ fileNames: z.array(z.string().min(1)).min(1).max(500) }))
      .mutation(async ({ input }) => {
        const products = await getProductsForImageMatching();
        const exactNameMap = new Map<string, typeof products[number]>();
        const exactSlugMap = new Map<string, typeof products[number]>();
        const duplicateKeys = new Set<string>();

        for (const product of products) {
          const [nameKey, slugKey] = getProductImageMatchKeys(product);
          if (exactNameMap.has(nameKey)) duplicateKeys.add(nameKey);
          else exactNameMap.set(nameKey, product);
          if (exactSlugMap.has(slugKey)) duplicateKeys.add(slugKey);
          else exactSlugMap.set(slugKey, product);
        }

        return input.fileNames.map((fileName) => {
          const key = normalizeProductImageKey(fileName);
          const product = duplicateKeys.has(key)
            ? undefined
            : exactNameMap.get(key) ?? exactSlugMap.get(key);
          return {
            fileName,
            normalizedKey: key,
            product: product
              ? { id: product.id, name: product.name, slug: product.slug }
              : null,
            status: product ? "matched" as const : "unmatched" as const,
          };
        });
      }),

    // Image upload: receives base64 data URL
    uploadImage: adminProcedure
      .input(z.object({
        productId: z.number(),
        fileName: z.string(),
        fileData: z.string(), // base64
        mimeType: z.string(),
        isPrimary: z.boolean().default(false),
      }))
      .mutation(async ({ input }) => {
        const buffer = Buffer.from(input.fileData, "base64");
        const key = `products/${input.productId}/${Date.now()}-${input.fileName}`;
        const { url } = await storagePut(key, buffer, input.mimeType);
        await addProductImage({ productId: input.productId, imageUrl: url, imageKey: key, isPrimary: input.isPrimary });
        return { url, key };
      }),

    getImages: publicProcedure
      .input(z.object({ productId: z.number() }))
      .query(({ input }) => getProductImages(input.productId)),

    setPrimaryImage: adminProcedure
      .input(z.object({ imageId: z.number(), productId: z.number() }))
      .mutation(({ input }) => setPrimaryImage(input.imageId, input.productId)),

    deleteImage: adminProcedure
      .input(z.object({ imageId: z.number() }))
      .mutation(({ input }) => deleteProductImage(input.imageId)),

    bulkImportCSV: adminProcedure
      .input(z.object({ csvData: z.string() }))
      .mutation(async ({ input }) => {
        const lines = input.csvData.trim().split('\n');
        if (lines.length < 2) throw new TRPCError({ code: 'BAD_REQUEST', message: 'CSV must have header and products' });

        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
        const nameIdx = headers.indexOf('name');
        const categoryIdx = headers.indexOf('category');
        const dosageIdx = headers.indexOf('dosageinfo');
        const descIdx = headers.indexOf('description');

        if (nameIdx === -1 || categoryIdx === -1) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'CSV needs name and category columns' });
        }

        let imported = 0, skipped = 0;
        const errors: string[] = [];

        const catSet = new Set<string>();
        for (let i = 1; i < lines.length; i++) {
          const parts = lines[i].split(',');
          if (parts[categoryIdx]) catSet.add(parts[categoryIdx].trim());
        }

        const catMap: Record<string, number> = {};
        for (const catName of Array.from(catSet)) {
          try {
            const slug = catName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
            await createCategory({ name: catName, slug });
            const cats = await getAllCategories();
            const found = cats.find((c: any) => c.name === catName);
            if (found) catMap[catName] = found.id;
          } catch (e: any) {
            const cats = await getAllCategories();
            const found = cats.find((c: any) => c.name === catName);
            if (found) catMap[catName] = found.id;
          }
        }

        for (let i = 1; i < lines.length; i++) {
          try {
            const parts = lines[i].split(',').map(p => p.trim());
            const name = parts[nameIdx];
            const category = parts[categoryIdx];
            const dosage = parts[dosageIdx] || '';
            const desc = parts[descIdx] || '';

            if (!name || !category) { skipped++; continue; }

            const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
            const categoryId = catMap[category];

            if (!categoryId) {
              errors.push(`Row ${i + 1}: Category not found`);
              skipped++;
              continue;
            }

            await createProduct({ name, slug, categoryId, price: '0', stockQuantity: 100, description: desc, dosageInfo: dosage, isActive: true, isFeatured: false });
            imported++;
          } catch (e: any) {
            if (!e.message?.includes('Duplicate')) errors.push(`Row ${i + 1}: ${e.message}`);
            skipped++;
          }
        }

        return { imported, skipped, errors: errors.slice(0, 5), message: `Imported ${imported}, skipped ${skipped}` };
      }),
  }),

  // ─── Cart ─────────────────────────────────────────────────────────────────
  cart: router({
    get: approvedProcedure.query(({ ctx }) => getCartItems(ctx.user.id)),

    upsert: approvedProcedure
      .input(z.object({ productId: z.number(), quantity: z.number().min(1) }))
      .mutation(({ ctx, input }) => upsertCartItem(ctx.user.id, input.productId, input.quantity)),

    remove: approvedProcedure
      .input(z.object({ cartItemId: z.number() }))
      .mutation(({ ctx, input }) => removeCartItem(ctx.user.id, input.cartItemId)),

    clear: approvedProcedure.mutation(({ ctx }) => clearCart(ctx.user.id)),

    deliveryPreview: approvedProcedure
      .input(z.object({ city: z.string() }))
      .query(({ input }) => calculateDelivery(input.city)),
  }),

  // ─── Orders ───────────────────────────────────────────────────────────────
  orders: router({
    submitQuote: approvedProcedure
      .input(z.object({
        shipping: z.object({
          fullName: z.string().min(2),
          phone: z.string().min(7),
          addressLine1: z.string().min(5),
          addressLine2: z.string().optional(),
          city: z.string().min(2),
          postalCode: z.string().min(4),
          country: z.string().default("South Africa"),
        }),
        notes: z.string().max(2000).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const cartRows = await getCartItems(ctx.user.id);
        if (cartRows.length === 0) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Quote cart is empty" });
        }

        for (const item of cartRows) {
          if (item.quantity > item.productStock) {
            throw new TRPCError({ code: "BAD_REQUEST", message: `Insufficient stock for ${item.productName}` });
          }
        }

        const subtotal = cartRows.reduce((sum, item) => sum + parseFloat(item.productPrice) * item.quantity, 0);
        const delivery = calculateDelivery(input.shipping.city);
        const total = subtotal + delivery.fee;
        const quoteId = await createOrder({
          userId: ctx.user.id,
          items: cartRows.map((item) => ({ productId: item.productId, quantity: item.quantity, priceAtPurchase: String(item.productPrice ?? "0") })),
          totalAmount: total.toFixed(2),
          deliveryFee: delivery.fee.toFixed(2),
          deliveryType: delivery.type,
          quoteNotes: input.notes,
          status: "quote_pending",
          shipping: input.shipping,
        });

        await clearCart(ctx.user.id);
        await notifyOwner({
          title: "New Quote Request",
          content: `Quote #${quoteId} submitted by ${ctx.user.fullName} (${ctx.user.email}) for review.`,
        }).catch(() => {});

        return { quoteId, total: total.toFixed(2), deliveryFee: delivery.fee.toFixed(2), status: "quote_pending" as const };
      }),

    create: approvedProcedure.mutation(() => {
      throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Direct checkout is disabled. Submit a quote for admin review first." });
    }),

    myOrders: protectedProcedure.query(async ({ ctx }) => {
      const { getUserOrders } = await import("./db");
      return getUserOrders(ctx.user.id);
    }),

    detail: protectedProcedure
      .input(z.object({ orderId: z.number() }))
      .query(async ({ ctx, input }) => {
        const order = await getOrderById(input.orderId);
        if (!order) throw new TRPCError({ code: "NOT_FOUND" });
        if (order.userId !== ctx.user.id && ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
        return order;
      }),

    listComments: protectedProcedure
      .input(z.object({ orderId: z.number() }))
      .query(async ({ ctx, input }) => {
        const order = await getOrderById(input.orderId);
        if (!order) throw new TRPCError({ code: "NOT_FOUND", message: "Quote not found" });
        if (order.userId !== ctx.user.id && ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN", message: "You cannot view this quote conversation" });
        }
        return getOrderComments(input.orderId);
      }),

    addComment: protectedProcedure
      .input(z.object({ orderId: z.number(), body: z.string().trim().min(1).max(2000) }))
      .mutation(async ({ ctx, input }) => {
        const order = await getOrderById(input.orderId);
        if (!order) throw new TRPCError({ code: "NOT_FOUND", message: "Quote not found" });
        if (order.userId !== ctx.user.id && ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN", message: "You cannot comment on this quote" });
        }
        const commentId = await createOrderComment({ orderId: input.orderId, userId: ctx.user.id, body: input.body });
        return { success: true, commentId };
      }),

    choosePayment: approvedProcedure
      .input(z.object({ orderId: z.number(), method: z.enum(["eft", "payfast"]) }))
      .mutation(async ({ ctx, input }) => {
        const quote = await getOrderById(input.orderId);
        if (!quote) throw new TRPCError({ code: "NOT_FOUND", message: "Quote not found" });
        if (quote.userId !== ctx.user.id) throw new TRPCError({ code: "FORBIDDEN" });
        const canChoosePayment = quote.status === "quote_approved" || (quote.status === "awaiting_payment" && !quote.paymentMethod);
        if (!canChoosePayment) {
          throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Quote must be approved before payment" });
        }
        const payment = await chooseQuotePayment(input.orderId, ctx.user.id, input.method);
        return { ...payment, orderId: input.orderId, method: input.method };
      }),

    review: adminProcedure
      .input(z.object({ orderId: z.number(), decision: z.enum(["quote_approved", "quote_rejected"]), notes: z.string().max(2000).optional() }))
      .mutation(async ({ ctx, input }) => {
        await reviewQuote(input.orderId, ctx.user.id, input.decision, input.notes);
        return { success: true };
      }),

    confirmEft: adminProcedure
      .input(z.object({ orderId: z.number() }))
      .mutation(async ({ input }) => {
        await confirmEftPayment(input.orderId);
        return { success: true };
      }),

    rejectProof: adminProcedure
      .input(z.object({ orderId: z.number(), note: z.string().trim().min(1).max(2000) }))
      .mutation(async ({ ctx, input }) => {
        await rejectProofOfPayment(input.orderId, ctx.user.id, input.note);
        return { success: true };
      }),

    uploadProof: protectedProcedure
      .input(z.object({
        orderId: z.number(),
        dataUrl: z.string().max(11_000_000),
        fileName: z.string().trim().min(1).max(128),
      }))
      .mutation(async ({ ctx, input }) => {
        const order = await getOrderById(input.orderId);
        if (!order) throw new TRPCError({ code: "NOT_FOUND", message: "Order not found" });
        if (order.userId !== ctx.user.id) throw new TRPCError({ code: "FORBIDDEN" });
        if (order.paymentMethod !== "eft" || order.status !== "awaiting_payment" || !["awaiting_eft", "proof_uploaded"].includes(order.paymentStatus)) {
          throw new TRPCError({ code: "PRECONDITION_FAILED", message: "EFT proof can only be uploaded while the order is awaiting EFT payment" });
        }
        const match = input.dataUrl.match(/^data:(image\/(?:png|jpeg|webp)|application\/pdf);base64,([A-Za-z0-9+/=\r\n]+)$/);
        if (!match) throw new TRPCError({ code: "BAD_REQUEST", message: "Upload a PNG, JPG, WEBP, or PDF proof of payment" });
        const contentType = match[1];
        const buffer = Buffer.from(match[2], "base64");
        if (buffer.length === 0 || buffer.length > 8 * 1024 * 1024) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Proof of payment must be smaller than 8 MB" });
        }
        const safeFileName = input.fileName.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-128) || "proof-of-payment";
        const fileKey = `orders/${input.orderId}/pop_${Date.now()}_${safeFileName}`;

        const { url, key } = await storagePut(fileKey, buffer, contentType);
        await uploadProofOfPayment(input.orderId, ctx.user.id, url, key);
        return { success: true, url };
      }),

    // PayFast ITN webhook (public, verified by signature)
    payfastItn: publicProcedure
      .input(z.object({
        m_payment_id: z.string(),
        pf_payment_id: z.string().optional(),
        payment_status: z.string(),
        item_name: z.string().optional(),
        amount_gross: z.string().optional(),
        signature: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const status = input.payment_status === "COMPLETE" ? "paid" : "failed";
        await updateOrderPayment(input.m_payment_id, status);
        return { success: true };
      }),

    // Admin
    adminList: adminProcedure.query(() => getAllOrders()),

    adminDetail: adminProcedure
      .input(z.object({ orderId: z.number() }))
      .query(({ input }) => getOrderById(input.orderId)),

    adminUpdateStatus: adminProcedure
      .input(z.object({
        orderId: z.number(),
        status: z.enum(["pending", "quote_pending", "quote_approved", "quote_rejected", "awaiting_payment", "paid", "processing", "shipped", "completed", "cancelled"]),
        notes: z.string().optional(),
      }))
      .mutation(({ input }) => updateOrderStatus(input.orderId, input.status, input.notes)),
    adminUpdateTracking: adminProcedure
      .input(z.object({
        orderId: z.number(),
        trackingNumber: z.string().trim().max(128).nullable().optional(),
        trackingCarrier: z.string().trim().max(64).nullable().optional(),
        trackingUrl: z.string().trim().url().max(1024).nullable().optional(),
        trackingNotes: z.string().trim().max(2000).nullable().optional(),
      }))
      .mutation(({ input }) => updateOrderTracking(input.orderId, {
        trackingNumber: input.trackingNumber || null,
        trackingCarrier: input.trackingCarrier || null,
        trackingUrl: input.trackingUrl || null,
        trackingNotes: input.trackingNotes || null,
      })),
  }),

  // ─── Admin: Users ─────────────────────────────────────────────────────────
  admin: router({
    users: adminProcedure.query(() => getAllUsers()),

    approveUser: adminProcedure
      .input(z.object({ userId: z.number(), notes: z.string().optional() }))
      .mutation(async ({ ctx, input }) => {
        await updateUserStatus(input.userId, "approved", ctx.user.id, input.notes);
        const user = await getUserById(input.userId);
        if (user) {
          await notifyOwner({
            title: "User Approved",
            content: `User ${user.fullName} (${user.email}) has been approved.`,
          }).catch(() => {});
        }
        return { success: true };
      }),

    rejectUser: adminProcedure
      .input(z.object({ userId: z.number(), notes: z.string().optional() }))
      .mutation(({ ctx, input }) => updateUserStatus(input.userId, "rejected", ctx.user.id, input.notes)),

    analytics: adminProcedure.query(() => getAdminAnalytics()),

    stats: adminProcedure.query(async () => {
      const db = await getDb();
      if (!db) return { totalUsers: 0, pendingUsers: 0, pendingQuotes: 0, totalOrders: 0, revenue: 0 };
      const allUsers = await getAllUsers();
      const allOrders = await getAllOrders();
      const revenue = allOrders
        .filter((o) => o.paymentStatus === "paid")
        .reduce((sum, o) => sum + parseFloat(o.totalAmount), 0);
      return {
        totalUsers: allUsers.length,
        pendingUsers: allUsers.filter((u) => u.status === "pending").length,
        pendingQuotes: countPendingQuotes(allOrders),
        approvedUsers: allUsers.filter((u) => u.status === "approved").length,
        totalOrders: allOrders.length,
        paidOrders: allOrders.filter((o) => o.paymentStatus === "paid").length,
        revenue: revenue.toFixed(2),
      };
    }),
  }),

  // ─── Delivery ─────────────────────────────────────────────────────────────
  delivery: router({
    calculate: protectedProcedure
      .input(z.object({ city: z.string() }))
      .query(({ input }) => calculateDelivery(input.city)),
  }),
});

export type AppRouter = typeof appRouter;
