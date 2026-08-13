import type { OrderTrackingEventInput } from "./orderTracking";

export const MOCK_COURIER_SCENARIOS = [
  { value: "label_created", label: "Label created", description: "A shipment label exists, but the parcel has not entered the network yet." },
  { value: "in_transit", label: "In transit", description: "The parcel has been collected and is moving between depots." },
  { value: "out_for_delivery", label: "Out for delivery", description: "The parcel is at the destination depot and with a delivery vehicle." },
  { value: "delivered", label: "Delivered", description: "The delivery has been completed successfully." },
  { value: "exception", label: "Delivery exception", description: "A delivery issue requires attention before the parcel can progress." },
] as const;

export type MockCourierScenario = (typeof MOCK_COURIER_SCENARIOS)[number]["value"];

export function getMockCourierScenarioMeta(scenario: MockCourierScenario) {
  return MOCK_COURIER_SCENARIOS.find((item) => item.value === scenario) ?? MOCK_COURIER_SCENARIOS[0];
}

export function generateMockCourierEvents(scenario: MockCourierScenario, baseDate = new Date("2026-08-13T12:00:00.000Z")): OrderTrackingEventInput[] {
  const at = (hoursAgo: number): Date => new Date(baseDate.getTime() - hoursAgo * 60 * 60 * 1000);
  const event = (eventCode: string, statusLabel: string, description: string, location: string, hoursAgo: number): OrderTrackingEventInput => ({
    eventCode,
    statusLabel,
    description,
    location,
    externalEventId: `mock-${scenario}-${eventCode.toLowerCase()}`,
    source: "mock_courier",
    occurredAt: at(hoursAgo),
  });

  switch (scenario) {
    case "label_created":
      return [event("LABEL_CREATED", "Label created", "Shipment information was received by the courier.", "Johannesburg fulfilment centre", 8)];
    case "in_transit":
      return [
        event("IN_TRANSIT", "In transit", "Parcel is moving to the destination region.", "N1 linehaul", 3),
        event("DEPARTED_DEPOT", "Departed depot", "Parcel departed the origin depot.", "Johannesburg depot", 16),
        event("PICKED_UP", "Picked up", "Parcel collected from the sender.", "Johannesburg fulfilment centre", 28),
      ];
    case "out_for_delivery":
      return [
        event("OUT_FOR_DELIVERY", "Out for delivery", "Courier vehicle departed for delivery.", "Gqeberha depot", 1),
        event("ARRIVED_DEPOT", "Arrived at destination depot", "Parcel reached the destination depot.", "Gqeberha depot", 5),
        event("IN_TRANSIT", "In transit", "Parcel is moving to the destination region.", "Eastern Cape linehaul", 18),
        event("PICKED_UP", "Picked up", "Parcel collected from the sender.", "Johannesburg fulfilment centre", 30),
      ];
    case "delivered":
      return [
        event("DELIVERED", "Delivered", "Parcel delivered to the recipient.", "Gqeberha", 1),
        event("OUT_FOR_DELIVERY", "Out for delivery", "Courier vehicle departed for delivery.", "Gqeberha depot", 4),
        event("ARRIVED_DEPOT", "Arrived at destination depot", "Parcel reached the destination depot.", "Gqeberha depot", 9),
        event("IN_TRANSIT", "In transit", "Parcel is moving to the destination region.", "Eastern Cape linehaul", 22),
        event("PICKED_UP", "Picked up", "Parcel collected from the sender.", "Johannesburg fulfilment centre", 34),
      ];
    case "exception":
      return [
        event("ADDRESS_QUERY", "Address query", "Courier requires confirmation of the delivery address.", "Gqeberha depot", 2),
        event("DELIVERY_ATTEMPTED", "Delivery attempted", "Delivery could not be completed on the first attempt.", "Gqeberha", 7),
        event("OUT_FOR_DELIVERY", "Out for delivery", "Courier vehicle departed for delivery.", "Gqeberha depot", 12),
        event("ARRIVED_DEPOT", "Arrived at destination depot", "Parcel reached the destination depot.", "Gqeberha depot", 20),
      ];
  }
}
