import { describe, expect, it } from "vitest";
import { buildQuoteConfirmationEmail } from "./email";

describe("customer quote confirmation email", () => {
  it("includes the quote breakdown, R140 nationwide delivery, and order link", () => {
    const email = buildQuoteConfirmationEmail({
      quoteId: 42,
      customerName: "Member <Test>",
      customerEmail: "member@example.com",
      items: [{ productName: "Test Product", quantity: 2, lineTotal: 200 }],
      subtotal: 200,
      deliveryFee: 140,
      total: 340,
    });

    expect(email.to).toBe("member@example.com");
    expect(email.subject).toContain("Quote #42");
    expect(email.text).toContain("Subtotal: R200.00");
    expect(email.text).toContain("Nationwide delivery: R140.00");
    expect(email.text).toContain("Estimated total: R340.00");
    expect(email.text).toContain("https://gorillagear.co.za/orders/42");
    expect(email.html).toContain("Nationwide flat delivery:</strong> R140.00");
    expect(email.html).toContain("Member &lt;Test&gt;");
    expect(email.html).not.toContain("<p style=\"font-size:16px;\">Hi Member <Test>");
  });
});
