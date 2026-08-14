import { describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "./_core/context";

const dbMocks = vi.hoisted(() => ({
  getPasswordResetAuditEvents: vi.fn(),
}));

vi.mock("./db", async () => ({
  ...(await vi.importActual<typeof import("./db")>("./db")),
  ...dbMocks,
}));

import { appRouter } from "./routers";

function makeContext(role: "admin" | "user"): TrpcContext {
  return {
    user: {
      id: 1,
      openId: "test-admin",
      fullName: "Audit Admin",
      email: "admin@example.com",
      role,
      status: "approved",
      isActive: true,
    },
    req: { protocol: "https", headers: { cookie: "" } },
    res: { cookie: vi.fn(), clearCookie: vi.fn() },
  } as unknown as TrpcContext;
}

describe("password reset audit access", () => {
  it("returns sanitized audit events to admins with filters", async () => {
    const events = [{
      id: 7,
      userId: 42,
      maskedEmail: "ch**@example.com",
      eventType: "email_sent",
      tokenHashPrefix: "abcdef1234567890",
      detail: null,
      createdAt: new Date("2026-08-14T04:00:00.000Z"),
    }];
    dbMocks.getPasswordResetAuditEvents.mockResolvedValueOnce(events);

    const result = await appRouter.createCaller(makeContext("admin")).admin.passwordResetAudit({ eventType: "email_sent", limit: 25 });

    expect(result).toEqual(events);
    expect(dbMocks.getPasswordResetAuditEvents).toHaveBeenCalledWith({ eventType: "email_sent", limit: 25 });
    expect(JSON.stringify(result)).not.toContain("resetToken");
  });

  it("rejects audit access for non-admin users", async () => {
    await expect(appRouter.createCaller(makeContext("user")).admin.passwordResetAudit()).rejects.toMatchObject({ code: "FORBIDDEN" });
  });
});
