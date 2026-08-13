import { ENV } from "./_core/env";

export type NormalizedCourierEvent = {
  eventCode: string;
  statusLabel: string;
  description: string | null;
  location: string | null;
  externalEventId: string | null;
  source: string;
  occurredAt: Date;
};

export type CourierSyncResult = {
  configured: boolean;
  synced: number;
  events: NormalizedCourierEvent[];
  message?: string;
};

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : null;
}

function firstString(record: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) return value.trim();
    if (typeof value === "number") return String(value);
  }
  return null;
}

function firstDate(record: Record<string, unknown>) {
  const value = firstString(record, ["occurredAt", "occurred_at", "timestamp", "eventDate", "event_date", "date", "createdAt", "created_at"]);
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function extractEventArray(payload: unknown): unknown[] {
  if (Array.isArray(payload)) return payload;
  const root = asRecord(payload);
  if (!root) return [];
  for (const key of ["events", "trackingEvents", "tracking_events", "scans", "history"]) {
    if (Array.isArray(root[key])) return root[key] as unknown[];
  }
  const data = asRecord(root.data);
  if (data) {
    for (const key of ["events", "trackingEvents", "tracking_events", "scans", "history"]) {
      if (Array.isArray(data[key])) return data[key] as unknown[];
    }
  }
  return [];
}

export function normalizeCourierEvents(payload: unknown, source = "courier_api"): NormalizedCourierEvent[] {
  return extractEventArray(payload).flatMap((item) => {
    const record = asRecord(item);
    if (!record) return [];
    const occurredAt = firstDate(record);
    if (!occurredAt) return [];
    const statusLabel = firstString(record, ["statusLabel", "status_label", "status", "description", "event"]) ?? "Tracking update";
    const eventCode = firstString(record, ["eventCode", "event_code", "statusCode", "status_code", "code"]) ?? statusLabel.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
    return [{
      eventCode,
      statusLabel,
      description: firstString(record, ["description", "details", "message", "note"]),
      location: firstString(record, ["location", "scanLocation", "scan_location", "depot", "facility"]),
      externalEventId: firstString(record, ["externalEventId", "external_event_id", "eventId", "event_id", "id"]),
      source,
      occurredAt,
    }];
  }).sort((a, b) => b.occurredAt.getTime() - a.occurredAt.getTime());
}

export function isCourierTrackingConfigured() {
  return Boolean(ENV.courierApiKey && ENV.courierApiUrl.includes("{trackingNumber}"));
}

export async function syncCourierTracking(trackingNumber: string): Promise<CourierSyncResult> {
  if (!ENV.courierApiKey || !ENV.courierApiUrl.includes("{trackingNumber}")) {
    return {
      configured: false,
      synced: 0,
      events: [],
      message: "Courier API endpoint is not configured. The official endpoint template is required before live requests can be made.",
    };
  }

  const endpoint = ENV.courierApiUrl.replace("{trackingNumber}", encodeURIComponent(trackingNumber));
  const response = await fetch(endpoint, {
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${ENV.courierApiKey}`,
      "X-API-Key": ENV.courierApiKey,
    },
  });
  if (!response.ok) {
    throw new Error(`Courier tracking request failed with HTTP ${response.status}`);
  }

  const payload = await response.json() as unknown;
  const events = normalizeCourierEvents(payload);
  return { configured: true, synced: events.length, events };
}
