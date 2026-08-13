import { describe, expect, it } from "vitest";
import { generateMockCourierEvents, getMockCourierScenarioMeta, MOCK_COURIER_SCENARIOS } from "../shared/mockCourierEvents";

describe("mock courier events", () => {
  it("provides a named scenario for every supported preview state", () => {
    expect(MOCK_COURIER_SCENARIOS.map((scenario) => getMockCourierScenarioMeta(scenario.value).value)).toEqual([
      "label_created",
      "in_transit",
      "out_for_delivery",
      "delivered",
      "exception",
    ]);
  });

  it.each([
    ["label_created", 1],
    ["in_transit", 3],
    ["out_for_delivery", 4],
    ["delivered", 5],
    ["exception", 4],
  ] as const)("generates deterministic %s events with no production source", (scenario, expectedCount) => {
    const baseDate = new Date("2026-08-13T12:00:00.000Z");
    const first = generateMockCourierEvents(scenario, baseDate);
    const second = generateMockCourierEvents(scenario, baseDate);

    expect(first).toHaveLength(expectedCount);
    expect(first).toEqual(second);
    expect(first.every((event) => event.source === "mock_courier")).toBe(true);
    expect(first.every((event) => event.externalEventId?.startsWith(`mock-${scenario}-`))).toBe(true);
    if (first.length > 1) {
      expect(first[0]?.occurredAt.getTime()).toBeGreaterThan(first.at(-1)?.occurredAt.getTime() ?? 0);
    }
  });
});
