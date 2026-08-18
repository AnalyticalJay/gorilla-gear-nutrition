/**
 * @vitest-environment jsdom
 */
import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";

const mocks = vi.hoisted(() => ({ query: vi.fn(), refetch: vi.fn() }));

vi.mock("@/lib/trpc", () => ({
  trpc: { admin: { ikhokhaPaymentAudit: { useQuery: mocks.query } } },
}));

vi.mock("wouter", () => ({ Link: ({ href, children }: { href: string; children: React.ReactNode }) => <a href={href}>{children}</a> }));

import AdminIkhokhaPaymentAudit from "./AdminIkhokhaPaymentAudit";

describe("Admin iKhokha payment-attempt audit", () => {
  afterEach(() => cleanup());

  it("renders branded payment-link audit details and supports manual refresh", () => {
    mocks.query.mockReturnValue({
      data: [{ id: 2, orderId: 12, externalReference: "GGN-12-456", paylinkId: "paylink-12", amountCents: 14_500, status: "pending", gatewayStatus: "PAYLINK_CREATED", failureReason: null, createdAt: new Date("2026-08-18T08:00:00Z"), updatedAt: new Date(), completedAt: null, orderStatus: "awaiting_payment", paymentStatus: "pending", customerName: "Test Member", customerEmail: "member@example.com" }],
      isLoading: false,
      isFetching: false,
      refetch: mocks.refetch,
    });

    render(<AdminIkhokhaPaymentAudit />);
    expect(screen.getByRole("heading", { name: /payment-attempt audit/i })).toBeTruthy();
    expect(screen.getByText("GGN-12-456")).toBeTruthy();
    expect(screen.getByText("Test Member")).toBeTruthy();
    expect(screen.getByText(/customer payment links are not exposed/i)).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: /refresh attempts/i }));
    expect(mocks.refetch).toHaveBeenCalledOnce();
  });
});
