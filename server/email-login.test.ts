import bcrypt from "bcryptjs";
import { describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "./_core/context";

const dbMocks = vi.hoisted(() => ({
  getUserByEmail: vi.fn(),
}));

vi.mock("./db", async () => ({
  ...(await vi.importActual<typeof import("./db")>("./db")),
  ...dbMocks,
}));

import { appRouter } from "./routers";
import { sdk } from "./_core/sdk";

describe("email/password login session handoff", () => {
  it("creates a session that auth.me can verify after an approved user logs in", async () => {
    const passwordHash = await bcrypt.hash("Correct Password 123!", 4);
    dbMocks.getUserByEmail.mockResolvedValue({
      id: 321,
      openId: "email-321",
      email: "approved@example.com",
      fullName: "Approved Member",
      phone: null,
      city: "Gqeberha",
      passwordHash,
      loginMethod: "email",
      role: "user",
      status: "approved",
      isActive: true,
      isOver18: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    });

    const cookies: Array<{ name: string; value: string }> = [];
    const ctx = {
      user: null,
      req: { protocol: "https", headers: { cookie: "" } },
      res: {
        cookie: vi.fn((name: string, value: string) => cookies.push({ name, value })),
        clearCookie: vi.fn(),
      },
    } as unknown as TrpcContext;

    const result = await appRouter.createCaller(ctx).auth.login({
      email: "approved@example.com",
      password: "Correct Password 123!",
    });

    expect(result).toMatchObject({ success: true, user: { id: 321, status: "approved" } });
    expect(cookies).toHaveLength(1);

    const session = await sdk.verifySession(cookies[0]?.value);
    expect(session).toMatchObject({ openId: "321", name: "321" });
  });

  it("throttles repeated invalid sign-in attempts for the same account and client", async () => {
    dbMocks.getUserByEmail.mockResolvedValue(undefined);
    const ctx = {
      user: null,
      req: { protocol: "https", headers: { "x-forwarded-for": "203.0.113.10" } },
      res: { cookie: vi.fn(), clearCookie: vi.fn() },
    } as unknown as TrpcContext;
    const caller = appRouter.createCaller(ctx);
    const input = { email: "throttle-check@example.com", password: "not-the-password" };

    for (let attempt = 0; attempt < 5; attempt += 1) {
      await expect(caller.auth.login(input)).rejects.toMatchObject({ code: "UNAUTHORIZED" });
    }

    await expect(caller.auth.login(input)).rejects.toMatchObject({ code: "TOO_MANY_REQUESTS" });
  });
});
