import { describe, expect, it } from "vitest";
import { normalizeCourierEvents, syncCourierTracking } from "./courierTracking";

describe("courier tracking adapter", () => {
  it("stays disabled when the API key exists without an official endpoint template", async () => {
    const result = await syncCourierTracking("TCG123456789");

    expect(result.configured).toBe(false);
    expect(result.synced).toBe(0);
    expect(result.events).toEqual([]);
    expect(result.message).toMatch(/endpoint is not configured/i);
  });

  it("normalizes common tracking event response shapes without exposing raw credentials", () => {
    const events = normalizeCourierEvents({
      data: {
        events: [
          {
            id: "scan-2",
            status: "Out for delivery",
            description: "Courier vehicle departed the depot.",
            location: "Gqeberha depot",
            timestamp: "2026-08-13T10:00:00.000Z",
          },
          {
            id: "scan-1",
            status_code: "ARRIVED_DEPOT",
            status_label: "Arrived at depot",
            occurred_at: "2026-08-13T08:00:00.000Z",
            facility: "Gqeberha depot",
          },
        ],
      },
    });

    expect(events).toHaveLength(2);
    expect(events[0]).toMatchObject({
      externalEventId: "scan-2",
      statusLabel: "Out for delivery",
      description: "Courier vehicle departed the depot.",
      location: "Gqeberha depot",
      source: "courier_api",
    });
    expect(events[0]?.occurredAt).toEqual(new Date("2026-08-13T10:00:00.000Z"));
    expect(events[1]?.eventCode).toBe("ARRIVED_DEPOT");
  });
});
