import { describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "./_core/context";

const dbMocks = vi.hoisted(() => ({
  getCategories: vi.fn(),
  getProductsPage: vi.fn(),
  getProductBySlug: vi.fn(),
}));

vi.mock("./db", async () => ({
  ...(await vi.importActual<typeof import("./db")>("./db")),
  ...dbMocks,
}));

import { appRouter } from "./routers";

function context(user: TrpcContext["user"] = null): TrpcContext {
  return {
    user,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("private catalogue access", () => {
  it("returns no unscoped private catalogue data to a visitor", async () => {
    dbMocks.getCategories.mockResolvedValue([
      { id: 1, slug: "supplements" },
      { id: 2, slug: "peptides" },
    ]);

    const result = await appRouter.createCaller(context()).products.listPage({ limit: 24, offset: 0 });

    expect(result).toEqual({ items: [], total: 0 });
    expect(dbMocks.getProductsPage).not.toHaveBeenCalled();
  });

  it("permits visitor browsing only for the public supplements collection and strips its price", async () => {
    dbMocks.getCategories.mockResolvedValue([
      { id: 1, slug: "supplements" },
      { id: 2, slug: "peptides" },
    ]);
    dbMocks.getProductsPage.mockResolvedValue({ items: [{ id: 10, price: "450.00" }], total: 1 });

    const result = await appRouter.createCaller(context()).products.listPage({ categoryId: 1, limit: 24, offset: 0 });

    expect(result).toEqual({ items: [{ id: 10, price: null }], total: 1 });
  });

  it("does not disclose a private product detail to an unauthenticated visitor", async () => {
    dbMocks.getProductBySlug.mockResolvedValue({ id: 8, price: "900.00", category: { slug: "peptides" } });

    await expect(appRouter.createCaller(context()).products.bySlug({ slug: "private-peptide" })).rejects.toMatchObject({ code: "NOT_FOUND" });
  });
});
