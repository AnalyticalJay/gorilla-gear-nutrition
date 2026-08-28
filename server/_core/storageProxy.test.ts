import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("./env", () => ({
  ENV: { forgeApiUrl: "https://forge.example", forgeApiKey: "storage-test-key" },
}));

import { registerStorageProxy } from "./storageProxy";

describe("managed storage image proxy", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("relays image bytes with a browser-safe MIME type and immutable cache policy", async () => {
    const upstreamFetch = vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => ({ url: "https://signed-storage.example/logo" }) })
      .mockResolvedValueOnce({
        ok: true,
        headers: new Headers({ "content-type": "application/octet-stream" }),
        arrayBuffer: async () => new Uint8Array([137, 80, 78, 71]).buffer,
      });
    vi.stubGlobal("fetch", upstreamFetch);

    const get = vi.fn();
    registerStorageProxy({ get } as any);
    expect(get).toHaveBeenCalledWith("/api/media/*", expect.any(Function));
    const handler = get.mock.calls[0]?.[1] as (req: any, res: any) => Promise<void>;
    const res = {
      set: vi.fn(),
      status: vi.fn().mockReturnThis(),
      send: vi.fn(),
    };

    await handler({ params: { 0: "brand/logo.png" } }, res);

    expect(upstreamFetch).toHaveBeenCalledTimes(2);
    expect(res.set).toHaveBeenCalledWith("Content-Type", "image/png");
    expect(res.set).toHaveBeenCalledWith("Cache-Control", "public, max-age=31536000, immutable");
    expect(res.set).toHaveBeenCalledWith("X-Content-Type-Options", "nosniff");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith(expect.any(Buffer));
  });

  it("rejects keys outside the approved public media prefixes", async () => {
    const upstreamFetch = vi.fn();
    vi.stubGlobal("fetch", upstreamFetch);
    const get = vi.fn();
    registerStorageProxy({ get } as any);
    const handler = get.mock.calls[0]?.[1] as (req: any, res: any) => Promise<void>;
    const res = { status: vi.fn().mockReturnThis(), send: vi.fn() };

    await handler({ params: { 0: "private/customer-document.png" } }, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.send).toHaveBeenCalledWith("Media not found");
    expect(upstreamFetch).not.toHaveBeenCalled();
  });

  it("rejects an upstream media response that exceeds the public size limit", async () => {
    const upstreamFetch = vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => ({ url: "https://signed-storage.example/large" }) })
      .mockResolvedValueOnce({
        ok: true,
        headers: new Headers({ "content-length": String(9 * 1024 * 1024) }),
        arrayBuffer: async () => new ArrayBuffer(0),
      });
    vi.stubGlobal("fetch", upstreamFetch);
    const get = vi.fn();
    registerStorageProxy({ get } as any);
    const handler = get.mock.calls[0]?.[1] as (req: any, res: any) => Promise<void>;
    const res = { status: vi.fn().mockReturnThis(), send: vi.fn() };

    await handler({ params: { 0: "brand/large.png" } }, res);

    expect(res.status).toHaveBeenCalledWith(413);
    expect(res.send).toHaveBeenCalledWith("Media file too large");
  });
});
