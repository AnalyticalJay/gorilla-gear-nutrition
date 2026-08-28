import { describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "./_core/context";

const dbMocks = vi.hoisted(() => ({
  getUserById: vi.fn(),
}));

vi.mock("./db", async () => ({
  ...(await vi.importActual<typeof import("./db")>("./db")),
  ...dbMocks,
}));

import { appRouter } from "./routers";

describe("auth.me safe projection", () => {
  it("does not return password or reset-token fields to the client", async () => {
    dbMocks.getUserById.mockResolvedValueOnce({
      id: 41,
      openId: "safe-user-41",
      fullName: "Safe User",
      email: "safe@example.com",
      phone: "0123456789",
      city: "Gqeberha",
      passwordHash: "bcrypt-hash-that-must-never-leave-the-server",
      resetTokenHash: "reset-hash-that-must-never-leave-the-server",
      resetTokenExpiresAt: new Date(Date.now() + 60_000),
      loginMethod: "email",
      role: "user",
      status: "approved",
      isActive: true,
      isOver18: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    });

    const ctx = {
      user: { id: 41, openId: "safe-user-41", role: "user", status: "approved" },
      req: { protocol: "https", headers: {} },
      res: {},
    } as unknown as TrpcContext;

    const result = await appRouter.createCaller(ctx).auth.me();

    expect(result).toMatchObject({ id: 41, email: "safe@example.com", status: "approved" });
    expect(result).not.toHaveProperty("passwordHash");
    expect(result).not.toHaveProperty("resetTokenHash");
    expect(result).not.toHaveProperty("resetTokenExpiresAt");
  });
});
