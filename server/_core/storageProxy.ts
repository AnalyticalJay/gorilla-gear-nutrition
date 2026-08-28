import type { Express } from "express";
import { ENV } from "./env";

const imageContentTypes: Record<string, string> = {
  avif: "image/avif",
  gif: "image/gif",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  svg: "image/svg+xml",
  webp: "image/webp",
};

function contentTypeForStorageKey(key: string, upstreamContentType: string | null) {
  const extension = key.split(".").pop()?.toLowerCase();
  return (extension && imageContentTypes[extension]) || upstreamContentType || "application/octet-stream";
}

export function registerStorageProxy(app: Express) {
  app.get("/api/media/*", async (req, res) => {
    const key = (req.params as Record<string, string>)[0];
    if (!key) {
      res.status(400).send("Missing storage key");
      return;
    }

    if (!ENV.forgeApiUrl || !ENV.forgeApiKey) {
      res.status(500).send("Storage proxy not configured");
      return;
    }

    try {
      const forgeUrl = new URL(
        "v1/storage/presign/get",
        ENV.forgeApiUrl.replace(/\/+$/, "") + "/",
      );
      forgeUrl.searchParams.set("path", key);

      const forgeResp = await fetch(forgeUrl, {
        headers: { Authorization: `Bearer ${ENV.forgeApiKey}` },
      });

      if (!forgeResp.ok) {
        const body = await forgeResp.text().catch(() => "");
        console.error(`[StorageProxy] forge error: ${forgeResp.status} ${body}`);
        res.status(502).send("Storage backend error");
        return;
      }

      const { url } = (await forgeResp.json()) as { url: string };
      if (!url) {
        res.status(502).send("Empty signed URL from backend");
        return;
      }

      const storageResp = await fetch(url);
      if (!storageResp.ok) {
        const body = await storageResp.text().catch(() => "");
        console.error(`[StorageProxy] storage error: ${storageResp.status} ${body}`);
        res.status(502).send("Storage backend error");
        return;
      }

      const contentType = contentTypeForStorageKey(key, storageResp.headers.get("content-type"));
      const bytes = Buffer.from(await storageResp.arrayBuffer());
      res.set("Content-Type", contentType);
      res.set("Cache-Control", "public, max-age=31536000, immutable");
      res.set("X-Content-Type-Options", "nosniff");
      res.status(200).send(bytes);
    } catch (err) {
      console.error("[StorageProxy] failed:", err);
      res.status(502).send("Storage proxy error");
    }
  });
}
