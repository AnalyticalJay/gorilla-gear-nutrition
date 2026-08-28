import { createHash } from "node:crypto";
import { describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "./_core/context";

const dbMocks = vi.hoisted(() => ({
  getUserByEmail: vi.fn(),
  setPasswordResetToken: vi.fn(),
  consumePasswordResetToken: vi.fn(),
  getPasswordResetTokenOwner: vi.fn(),
  recordPasswordResetAuditEvent: vi.fn(),
  getPasswordResetAuditEvents: vi.fn(),
}));
const emailMocks = vi.hoisted(() => ({
  sendPasswordResetEmail: vi.fn(),
}));

vi.mock("./db", async () => ({
  ...(await vi.importActual<typeof import("./db")>("./db")),
  ...dbMocks,
}));
vi.mock("./email", async () => ({
  ...(await vi.importActual<typeof import("./email")>("./email")),
  ...emailMocks,
}));

import { appRouter } from "./routers";

function makeContext(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: { cookie: "" } },
    res: { cookie: vi.fn(), clearCookie: vi.fn() },
  } as unknown as TrpcContext;
}

function makeUser(email: string) {
  return {
    id: 2250001,
    openId: null,
    fullName: "Chris",
    email,
    phone: null,
    city: "Gqeberha",
    passwordHash: "existing-password-hash",
    resetTokenHash: null,
    resetTokenExpiresAt: null,
    loginMethod: "email",
    role: "admin" as const,
    status: "approved" as const,
    isActive: true,
    isOver18: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };
}

describe("password reset procedures", () => {
  it("returns a generic success for unknown emails without sending mail", async () => {
    dbMocks.getUserByEmail.mockResolvedValueOnce(undefined);

    const result = await appRouter.createCaller(makeContext()).auth.forgotPassword({ email: "unknown-1@example.com" });

    expect(result).toEqual({ success: true });
    expect(emailMocks.sendPasswordResetEmail).not.toHaveBeenCalled();
  });

  it("stores a hashed expiring token and sends a reset email for active users", async () => {
    const email = "chris-reset@example.com";
    dbMocks.getUserByEmail.mockResolvedValueOnce(makeUser(email));
    emailMocks.sendPasswordResetEmail.mockResolvedValueOnce(true);

    const result = await appRouter.createCaller(makeContext()).auth.forgotPassword({ email });

    expect(result).toEqual({ success: true });
    expect(dbMocks.setPasswordResetToken).toHaveBeenCalledOnce();
    const [userId, tokenHash, expiresAt] = dbMocks.setPasswordResetToken.mock.calls[0] ?? [];
    expect(userId).toBe(2250001);
    expect(tokenHash).toMatch(/^[a-f0-9]{64}$/);
    expect(expiresAt.getTime()).toBeGreaterThan(Date.now());
    expect(emailMocks.sendPasswordResetEmail).toHaveBeenCalledWith(expect.objectContaining({ customerEmail: email, resetToken: expect.stringMatching(/^[a-f0-9]{64}$/) }));
  });

  it("hashes the submitted token and consumes it atomically", async () => {
    const token = "b".repeat(64);
    dbMocks.consumePasswordResetToken.mockResolvedValueOnce(true);

    const result = await appRouter.createCaller(makeContext()).auth.resetPassword({ token, newPassword: "Strong#8" });

    expect(result).toEqual({ success: true });
    expect(dbMocks.consumePasswordResetToken).toHaveBeenCalledWith(createHash("sha256").update(token).digest("hex"), expect.any(String));
  });

  it("rejects expired or already-consumed tokens and weak passwords", async () => {
    dbMocks.consumePasswordResetToken.mockResolvedValueOnce(false);

    await expect(appRouter.createCaller(makeContext()).auth.resetPassword({ token: "c".repeat(64), newPassword: "d".repeat(32) })).rejects.toMatchObject({ code: "BAD_REQUEST" });
    await expect(appRouter.createCaller(makeContext()).auth.resetPassword({ token: "c".repeat(64), newPassword: "short7!" })).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });
});
