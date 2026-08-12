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
  it("returns page metadata and no more than the requested page size", async () => {
    const caller = appRouter.createCaller(makeCtx());
    const page = await caller.products.listPage({ limit: 3, offset: 0 });

    expect(Array.isArray(page.items)).toBe(true);
    expect(page.items.length).toBeLessThanOrEqual(3);
    expect(page.limit).toBe(3);
    expect(page.offset).toBe(0);
    expect(page.total).toBeGreaterThanOrEqual(page.items.length);
  });

  it("keeps prices hidden for unauthenticated catalogue requests", async () => {
    const caller = appRouter.createCaller(makeCtx());
    const page = await caller.products.listPage({ limit: 5, offset: 0 });

    page.items.forEach((product) => expect(product.price).toBeNull());
  });
});
