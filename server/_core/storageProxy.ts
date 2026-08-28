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

const MAX_PUBLIC_MEDIA_BYTES = 8 * 1024 * 1024;
const MEDIA_SEGMENT_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._-]*$/;
const PUBLIC_MEDIA_PREFIXES = ["catalogue", "products", "generated", "brand", "homepage"];

function isPublicMediaKey(key: string) {
  if (!key || key.length > 512 || key.startsWith("/") || key.includes("\\") || key.includes("..") || key.includes("?")) return false;
  const segments = key.split("/");
  if (segments.some((segment) => !MEDIA_SEGMENT_PATTERN.test(segment))) return false;
  const extension = key.split(".").pop()?.toLowerCase();
  if (!extension || !imageContentTypes[extension]) return false;

  const firstSegment = segments[0] ?? "";
  const isApprovedPrefix = segments.length > 1 && PUBLIC_MEDIA_PREFIXES.includes(firstSegment);
  const isApprovedRootAsset = segments.length === 1 && (/^\d+_[a-z0-9-]+\./i.test(key) || /^ggn-[a-z0-9._-]+\./i.test(key));
  return isApprovedPrefix || isApprovedRootAsset;
}

function contentTypeForStorageKey(key: string, upstreamContentType: string | null) {
  const extension = key.split(".").pop()?.toLowerCase();
  return (extension && imageContentTypes[extension]) || upstreamContentType || "application/octet-stream";
}

class MediaTooLargeError extends Error {}

async function readBoundedMediaBody(response: Response) {
  const advertisedLength = Number(response.headers.get("content-length"));
  if (Number.isFinite(advertisedLength) && advertisedLength > MAX_PUBLIC_MEDIA_BYTES) {
    throw new MediaTooLargeError("Media file too large");
  }

  if (!response.body) {
    const bytes = Buffer.from(await response.arrayBuffer());
    if (bytes.length > MAX_PUBLIC_MEDIA_BYTES) throw new MediaTooLargeError("Media file too large");
    return bytes;
  }

  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let totalBytes = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      totalBytes += value.byteLength;
      if (totalBytes > MAX_PUBLIC_MEDIA_BYTES) {
        await reader.cancel();
        throw new MediaTooLargeError("Media file too large");
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  return Buffer.concat(chunks.map((chunk) => Buffer.from(chunk)), totalBytes);
}

export function registerStorageProxy(app: Express) {
  app.get("/api/media/*", async (req, res) => {
    const key = (req.params as Record<string, string>)[0];
    if (!key) {
      res.status(400).send("Missing storage key");
      return;
    }
    if (!isPublicMediaKey(key)) {
      res.status(404).send("Media not found");
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
        signal: AbortSignal.timeout(10_000),
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

      const storageResp = await fetch(url, { signal: AbortSignal.timeout(15_000) });
      if (!storageResp.ok) {
        const body = await storageResp.text().catch(() => "");
        console.error(`[StorageProxy] storage error: ${storageResp.status} ${body}`);
        res.status(502).send("Storage backend error");
        return;
      }

      let bytes: Buffer;
      try {
        bytes = await readBoundedMediaBody(storageResp);
      } catch (error) {
        if (error instanceof MediaTooLargeError) {
          res.status(413).send("Media file too large");
          return;
        }
        throw error;
      }

      const contentType = contentTypeForStorageKey(key, storageResp.headers.get("content-type"));
      res.set("Content-Type", contentType);
      res.set("Content-Length", String(bytes.length));
      res.set("Cache-Control", "public, max-age=31536000, immutable");
      res.set("X-Content-Type-Options", "nosniff");
      res.status(200).send(bytes);
    } catch (err) {
      console.error("[StorageProxy] failed:", err);
      res.status(502).send("Storage proxy error");
    }
  });
}
