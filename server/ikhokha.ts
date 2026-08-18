import crypto from "crypto";

const API_BASE = "https://api.ikhokha.com/public-api/v1/api";

export type IkhokhaConfig = {
  appId: string;
  appSecret: string;
  entityId: string;
};

export type IkhokhaPaymentRequest = {
  entityID: string;
  externalEntityID: string;
  amount: number;
  currency: "ZAR";
  requesterUrl: string;
  description: string;
  paymentReference: string;
  mode: "live";
  externalTransactionID: string;
  urls: {
    callbackUrl: string;
    successPageUrl: string;
    failurePageUrl: string;
    cancelUrl: string;
  };
};

export type IkhokhaPaylink = {
  paylinkID: string;
  paylinkUrl: string;
  externalTransactionID: string;
  responseCode?: string;
};

export function getIkhokhaConfig(): IkhokhaConfig {
  const appId = process.env.IKHOKHA_APP_ID?.trim() ?? "";
  const appSecret = process.env.IKHOKHA_APP_SECRET?.trim() ?? "";
  const entityId = process.env.IKHOKHA_ENTITY_ID?.trim() ?? "";
  if (!appId || !appSecret || !entityId) throw new Error("iKhokha payment credentials are not configured");
  return { appId, appSecret, entityId };
}

export function signIkhokhaRequest(endpoint: string, body: string, appSecret: string) {
  const path = new URL(endpoint).pathname;
  const payload = `${path}${body}`.replace(/[\\"']/g, "\\$&").replace(/\u0000/g, "\\0");
  return crypto.createHmac("sha256", appSecret.trim()).update(payload).digest("hex");
}

export function signIkhokhaPath(endpoint: string, appSecret: string) {
  return crypto.createHmac("sha256", appSecret.trim()).update(new URL(endpoint).pathname).digest("hex");
}

async function parseGatewayJson(response: Response) {
  const text = await response.text();
  let body: any = null;
  try { body = text ? JSON.parse(text) : null; } catch { /* gateway response remains non-sensitive */ }
  if (!response.ok) {
    const gatewayMessage = typeof body?.message === "string" ? `: ${body.message.slice(0, 180)}` : "";
    throw new Error(`iKhokha payment request failed (${response.status})${gatewayMessage}`);
  }
  return body ?? {};
}

export async function createIkhokhaPaylink(request: IkhokhaPaymentRequest): Promise<IkhokhaPaylink> {
  const config = getIkhokhaConfig();
  const endpoint = `${API_BASE}/payment`;
  const body = JSON.stringify(request);
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "IK-APPID": config.appId,
      "IK-SIGN": signIkhokhaRequest(endpoint, body, config.appSecret),
    },
    body,
  });
  const data = await parseGatewayJson(response);
  if (!data.paylinkID || !data.paylinkUrl) throw new Error("iKhokha returned an incomplete payment link response");
  return data as IkhokhaPaylink;
}

export async function getIkhokhaPaymentStatus(paylinkId: string) {
  const config = getIkhokhaConfig();
  const endpoint = `${API_BASE}/getStatus/${encodeURIComponent(paylinkId)}`;
  const response = await fetch(endpoint, {
    headers: {
      Accept: "application/json",
      "IK-APPID": config.appId,
      "IK-SIGN": signIkhokhaPath(endpoint, config.appSecret),
    },
  });
  return parseGatewayJson(response);
}

export function getIkhokhaPaymentOutcome(payload: Record<string, unknown>): "paid" | "failed" | "pending" {
  const candidate = [payload.paymentStatus, payload.status, payload.transactionStatus, payload.responseCode]
    .find((value) => typeof value === "string");
  const value = String(candidate ?? "").trim().toUpperCase();
  if (["PAID", "COMPLETE", "COMPLETED", "SUCCESS", "SUCCESSFUL", "APPROVED"].includes(value)) return "paid";
  if (["FAILED", "FAIL", "CANCELLED", "CANCELED", "DECLINED", "EXPIRED"].includes(value)) return "failed";
  return "pending";
}
