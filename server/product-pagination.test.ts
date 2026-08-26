import { describe, expect, it, vi } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function makeCtx(overrides: Partial<TrpcContext> = {}): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
      cookie: vi.fn(),
    } as unknown as TrpcContext["res"],
    ...overrides,
  };
}

describe("products.listPage", () => {
  it("does not return an unscoped private catalogue page to an unauthenticated caller", async () => {
    const caller = appRouter.createCaller(makeCtx());
    const page = await caller.products.listPage({ limit: 3, offset: 0 });

    expect(page).toEqual({ items: [], total: 0 });
  });

  it("keeps the unauthenticated private-catalogue result empty", async () => {
    const caller = appRouter.createCaller(makeCtx());
    const page = await caller.products.listPage({ limit: 5, offset: 0 });

    expect(page.items).toHaveLength(0);
  });
});
