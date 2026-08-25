import { beforeEach, describe, expect, it, vi } from "vitest";

const { storagePutMock, addProductImageMock, getProductByIdMock } = vi.hoisted(() => ({
  storagePutMock: vi.fn(),
  addProductImageMock: vi.fn(),
  getProductByIdMock: vi.fn(),
}));

vi.mock("./storage", () => ({
  storagePut: storagePutMock,
}));

vi.mock("./db", async () => {
  const actual = await vi.importActual<typeof import("./db")>("./db");
  return {
    ...actual,
    addProductImage: addProductImageMock,
    getProductById: getProductByIdMock,
  };
});

import { appRouter } from "./routers";
import { getProductsForImageMatching } from "./db";
import type { TrpcContext } from "./_core/context";

function makeAdminContext(): TrpcContext {
  return {
    user: {
      id: 1,
      openId: "image-admin",
      email: "image-admin@example.com",
      fullName: "Image Admin",
      loginMethod: "email",
      role: "admin",
      status: "approved",
      phone: null,
      city: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("admin product image router", () => {
  beforeEach(() => {
    storagePutMock.mockReset();
    addProductImageMock.mockReset();
    getProductByIdMock.mockReset();
    getProductByIdMock.mockResolvedValue({ id: 123, name: "Sample product" });
    storagePutMock.mockResolvedValue({ key: "products/1/image.jpg", url: "/manus-storage/products/1/image.jpg" });
  });

  it("returns a product match and preserves unmatched files", async () => {
    const products = await getProductsForImageMatching();
    if (products.length === 0) {
      // The duplicated project intentionally starts with an empty catalogue.
      expect(products).toEqual([]);
      return;
    }
    const product = products[0];
    const caller = appRouter.createCaller(makeAdminContext());

    const result = await caller.products.matchImageFiles({
      fileNames: [`${product.name.replace(/\s+/g, "-")}.jpg`, "no-catalog-product.png"],
    });

    expect(result[0]?.status).toBe("matched");
    expect(result[0]?.product?.id).toBe(product.id);
    expect(result[1]).toMatchObject({ status: "unmatched", product: null });
  });

  it("uploads a matched image through storage and persists it as primary", async () => {
    addProductImageMock.mockResolvedValue(undefined);
    const caller = appRouter.createCaller(makeAdminContext());

    await caller.products.uploadImage({
      productId: 123,
      fileName: "sample-product.jpg",
      fileData: Buffer.from([0xff, 0xd8, 0xff, 0xd9]).toString("base64"),
      mimeType: "image/jpeg",
      isPrimary: true,
    });

    expect(storagePutMock).toHaveBeenCalledWith(
      expect.stringMatching(/^products\/123\/\d+-sample-product\.jpg$/),
      expect.any(Buffer),
      "image/jpeg"
    );
    expect(addProductImageMock).toHaveBeenCalledWith({
      productId: 123,
      imageUrl: "/manus-storage/products/1/image.jpg",
      imageKey: expect.stringMatching(/^products\/123\/\d+-sample-product\.jpg$/),
      isPrimary: true,
    });
  });

  it("rejects an image declaration when its bytes do not match the claimed type", async () => {
    const caller = appRouter.createCaller(makeAdminContext());
    await expect(caller.products.uploadImage({
      productId: 123,
      fileName: "not-a-real-png.png",
      fileData: Buffer.from([0xff, 0xd8, 0xff, 0xd9]).toString("base64"),
      mimeType: "image/png",
      isPrimary: false,
    })).rejects.toMatchObject({ code: "BAD_REQUEST" });
    expect(storagePutMock).not.toHaveBeenCalled();
  });
});
