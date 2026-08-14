import { describe, expect, it } from "vitest";
import { buildPaymentApprovedEmail, buildOrderPackedEmail, buildOrderDispatchedEmail } from "./email";

describe("automated order email notifications", () => {
  it("builds payment approved email with correct total and order link", () => {
    const msg = buildPaymentApprovedEmail({
      orderId: 101,
      customerName: "Sipho Khumalo",
      customerEmail: "sipho@example.com",
      total: 1590.00,
    });
    expect(msg.to).toBe("sipho@example.com");
    expect(msg.subject).toContain("Order #101");
    expect(msg.html).toContain("R1590.00");
    expect(msg.html).toContain("/orders/101");
  });

  it("builds order packed email with waybill reference", () => {
    const msg = buildOrderPackedEmail({
      orderId: 101,
      customerName: "Sipho Khumalo",
      customerEmail: "sipho@example.com",
      total: 1590.00,
      waybillNumber: "WAY-99201",
    });
    expect(msg.subject).toContain("Order #101");
    expect(msg.html).toContain("WAY-99201");
    expect(msg.html).toContain("Packed");
  });

  it("builds order dispatched email with tracking number and carrier", () => {
    const msg = buildOrderDispatchedEmail({
      orderId: 101,
      customerName: "Sipho Khumalo",
      customerEmail: "sipho@example.com",
      total: 1590.00,
      trackingNumber: "TCG998877",
      trackingCarrier: "The Courier Guy",
    });
    expect(msg.subject).toContain("Order #101");
    expect(msg.html).toContain("TCG998877");
    expect(msg.html).toContain("The Courier Guy");
  });
});
