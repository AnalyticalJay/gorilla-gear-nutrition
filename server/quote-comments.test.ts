import { beforeEach, describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "./_core/context";

const dbMocks = vi.hoisted(() => ({
  getOrderById: vi.fn(),
  getOrderComments: vi.fn(),
  createOrderComment: vi.fn(),
}));

vi.mock("./db", async () => ({
  ...(await vi.importActual<typeof import("./db")>("./db")),
  ...dbMocks,
}));

import { appRouter } from "./routers";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function user(overrides: Partial<AuthenticatedUser> = {}): AuthenticatedUser {
  return {
    id: 7,
    openId: "comment-user",
    fullName: "Comment Customer",
    email: "customer@example.com",
    phone: null,
    city: "Gqeberha",
    passwordHash: null,
    loginMethod: "email",
    role: "user",
    status: "approved",
    isActive: true,
    isOver18: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
    ...overrides,
  };
}

function context(currentUser = user()): TrpcContext {
  return {
    user: currentUser,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("quote comments router", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns newest-first comments to the quote owner", async () => {
    dbMocks.getOrderById.mockResolvedValue({ id: 42, userId: 7 });
    dbMocks.getOrderComments.mockResolvedValue([
      { id: 2, orderId: 42, userId: 1, body: "Latest", createdAt: new Date(), authorName: "Admin", authorRole: "admin" },
      { id: 1, orderId: 42, userId: 7, body: "Original", createdAt: new Date(), authorName: "Comment Customer", authorRole: "user" },
    ]);

    const result = await appRouter.createCaller(context()).orders.listComments({ orderId: 42 });

    expect(result[0]?.body).toBe("Latest");
    expect(dbMocks.getOrderComments).toHaveBeenCalledWith(42);
  });

  it("allows the owner and admins to post messages but blocks other customers", async () => {
    dbMocks.getOrderById.mockResolvedValue({ id: 42, userId: 7 });
    dbMocks.createOrderComment.mockResolvedValue(9);

    const ownerResult = await appRouter.createCaller(context()).orders.addComment({ orderId: 42, body: "Please confirm stock." });
    expect(ownerResult).toEqual({ success: true, commentId: 9 });
    expect(dbMocks.createOrderComment).toHaveBeenCalledWith({ orderId: 42, userId: 7, body: "Please confirm stock." });

    const adminResult = await appRouter.createCaller(context(user({ id: 1, role: "admin" }))).orders.addComment({ orderId: 42, body: "Stock confirmed." });
    expect(adminResult.success).toBe(true);
    expect(dbMocks.createOrderComment).toHaveBeenLastCalledWith({ orderId: 42, userId: 1, body: "Stock confirmed." });

    await expect(appRouter.createCaller(context(user({ id: 99 }))).orders.addComment({ orderId: 42, body: "Unauthorized" })).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("rejects empty or oversized messages through input validation", async () => {
    await expect(appRouter.createCaller(context()).orders.addComment({ orderId: 42, body: " " })).rejects.toMatchObject({ code: "BAD_REQUEST" });
    await expect(appRouter.createCaller(context()).orders.addComment({ orderId: 42, body: "x".repeat(2001) })).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });
});
