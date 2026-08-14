import { beforeEach, describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "./_core/context";

const dbMocks = vi.hoisted(() => ({
  createCoachingEnquiry: vi.fn(),
  getCoachingEnquiries: vi.fn(),
  reviewCoachingEnquiry: vi.fn(),
}));

vi.mock("./db", async () => ({
  ...(await vi.importActual<typeof import("./db")>("./db")),
  ...dbMocks,
}));

vi.mock("./_core/notification", () => ({ notifyOwner: vi.fn().mockResolvedValue(undefined) }));

import { appRouter } from "./routers";

function makeContext(role: "admin" | "user" | null): TrpcContext {
  return {
    user: role ? { id: 7, openId: "test-user", fullName: "Test User", email: "user@example.com", role, status: "approved", isActive: true } : null,
    req: { protocol: "https", headers: { cookie: "" } },
    res: { cookie: vi.fn(), clearCookie: vi.fn() },
  } as unknown as TrpcContext;
}

const enquiryInput = {
  firstName: "Tumi",
  lastName: "Ndlovu",
  email: "tumi@example.com",
  phone: "0821234567",
  address: "12 Training Road, Port Elizabeth",
  primaryGoal: "Build strength and improve body composition",
  experienceLevel: "intermediate" as const,
  availability: "Weekday evenings",
};

describe("coaching enquiries", () => {
  beforeEach(() => vi.clearAllMocks());

  it("accepts a public coaching enquiry and attaches an authenticated user when available", async () => {
    dbMocks.createCoachingEnquiry.mockResolvedValueOnce(41);
    const result = await appRouter.createCaller(makeContext("user")).coaching.submit(enquiryInput);

    expect(result).toEqual({ success: true, enquiryId: 41 });
    expect(dbMocks.createCoachingEnquiry).toHaveBeenCalledWith(expect.objectContaining({ userId: 7, email: "tumi@example.com", primaryGoal: enquiryInput.primaryGoal }));
  });

  it("exposes enquiry review data only to admins and records review metadata", async () => {
    dbMocks.getCoachingEnquiries.mockResolvedValueOnce([{ id: 41, firstName: "Tumi", status: "new" }]);
    const result = await appRouter.createCaller(makeContext("admin")).admin.coachingEnquiries();
    expect(result).toEqual([{ id: 41, firstName: "Tumi", status: "new" }]);

    await appRouter.createCaller(makeContext("admin")).admin.reviewCoachingEnquiry({ enquiryId: 41, status: "reviewing", adminNotes: "Book a discovery call" });
    expect(dbMocks.reviewCoachingEnquiry).toHaveBeenCalledWith({ enquiryId: 41, status: "reviewing", adminNotes: "Book a discovery call", adminId: 7 });
    await expect(appRouter.createCaller(makeContext("user")).admin.coachingEnquiries()).rejects.toMatchObject({ code: "FORBIDDEN" });
  });
});
