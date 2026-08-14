import { describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "./_core/context";

const dbMocks = vi.hoisted(() => ({
  getUserById: vi.fn(),
  getAllUsers: vi.fn(),
  updateUserRole: vi.fn(),
}));

vi.mock("./db", async () => ({
  ...(await vi.importActual<typeof import("./db")>("./db")),
  ...dbMocks,
}));

import { appRouter } from "./routers";

type User = NonNullable<TrpcContext["user"]>;

function makeUser(overrides: Partial<User> = {}): User {
  return {
    id: 1,
    openId: "admin-open-id",
    email: "admin@gorillagear.co.za",
    fullName: "Admin User",
    phone: null,
    city: null,
    passwordHash: null,
    loginMethod: "email",
    role: "admin",
    status: "approved",
    isActive: true,
    isOver18: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
    ...overrides,
  };
}

function makeContext(user: User | null = makeUser()): TrpcContext {
  return {
    user,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("admin member preview", () => {
  it("returns an approved member access diagnostic without creating an impersonation session", async () => {
    dbMocks.getUserById.mockResolvedValue(makeUser({ id: 42, role: "user", status: "approved", isActive: true, email: "member@example.com", fullName: "Approved Member" }));

    const result = await appRouter.createCaller(makeContext()).admin.memberPreview({ userId: 42 });

    expect(result).toMatchObject({
      previewMode: "read-only",
      accessGranted: true,
      member: { id: 42, email: "member@example.com", status: "approved", isActive: true },
      previewedBy: 1,
    });
  });

  it("reports blocked access for pending members", async () => {
    dbMocks.getUserById.mockResolvedValue(makeUser({ id: 43, role: "user", status: "pending" }));

    const result = await appRouter.createCaller(makeContext()).admin.memberPreview({ userId: 43 });

    expect(result.accessGranted).toBe(false);
    expect(result.accessMessage).toContain("awaiting approval");
  });

  it("changes a member to admin through the protected role mutation", async () => {
    dbMocks.getUserById.mockResolvedValue(makeUser({ id: 42, role: "user", status: "approved" }));
    dbMocks.updateUserRole.mockResolvedValue(undefined);

    const result = await appRouter.createCaller(makeContext()).admin.setUserRole({ userId: 42, role: "admin" });

    expect(result).toEqual({ success: true, role: "admin" });
    expect(dbMocks.updateUserRole).toHaveBeenCalledWith(42, "admin");
  });

  it("prevents self-demotion and removing the last admin", async () => {
    dbMocks.getUserById.mockResolvedValue(makeUser({ id: 1, role: "admin", status: "approved" }));

    await expect(appRouter.createCaller(makeContext()).admin.setUserRole({ userId: 1, role: "user" })).rejects.toMatchObject({ code: "FORBIDDEN" });

    dbMocks.getUserById.mockResolvedValue(makeUser({ id: 42, role: "admin", status: "approved" }));
    dbMocks.getAllUsers.mockResolvedValue([makeUser({ id: 1, role: "admin" }), makeUser({ id: 42, role: "admin" })]);
    await expect(appRouter.createCaller(makeContext()).admin.setUserRole({ userId: 42, role: "user" })).resolves.toEqual({ success: true, role: "user" });

    dbMocks.getAllUsers.mockResolvedValue([makeUser({ id: 1, role: "admin" })]);
    await expect(appRouter.createCaller(makeContext()).admin.setUserRole({ userId: 42, role: "user" })).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("rejects non-admin preview requests", async () => {
    dbMocks.getUserById.mockResolvedValue(makeUser({ id: 42, role: "user", status: "approved" }));

    await expect(appRouter.createCaller(makeContext(makeUser({ role: "user" }))).admin.memberPreview({ userId: 42 })).rejects.toMatchObject({ code: "FORBIDDEN" });
  });
});
