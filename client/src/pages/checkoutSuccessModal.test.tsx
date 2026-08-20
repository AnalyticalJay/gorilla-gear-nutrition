/** @vitest-environment jsdom */

import React from "react";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import Checkout from "./Checkout";

const mocks = vi.hoisted(() => ({
  navigate: vi.fn(),
}));

vi.mock("@/_core/hooks/useAuth", () => ({
  useAuth: () => ({
    isAuthenticated: true,
    user: {
      status: "approved",
      fullName: "Test Member",
      phone: "0712345678",
      city: "Cape Town",
    },
  }),
}));

vi.mock("@/components/Navbar", () => ({ default: () => <div data-testid="navbar" /> }));
vi.mock("@/components/Footer", () => ({ default: () => <div data-testid="footer" /> }));
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

vi.mock("@/lib/trpc", () => ({
  trpc: {
    cart: {
      get: {
        useQuery: () => ({ data: [{ id: 1, productName: "HD - Anavar", productPrice: "350.00", quantity: 1 }] }),
      },
    },
    delivery: {
      calculate: {
        useQuery: () => ({ data: { fee: 140 } }),
      },
    },
    orders: {
      submitQuote: {
        useMutation: (options: any) => ({
          isPending: false,
          mutate: (variables: any) => options.onSuccess?.({ quoteId: 60002, total: "490.00", deliveryFee: "140.00", status: "quote_pending" }, variables),
        }),
      },
    },
  },
}));

vi.mock("wouter", () => ({
  Link: ({ children, href, ...props }: any) => <a href={href} {...props}>{children}</a>,
  useLocation: () => ["/checkout", mocks.navigate],
}));

describe("Checkout quote submission success modal", () => {
  afterEach(() => {
    cleanup();
    mocks.navigate.mockReset();
  });

  it("shows the submitted quote summary and gives the customer a clear status action", async () => {
    const { container } = render(<Checkout />);

    fireEvent.change(container.querySelector('input[name="fullName"]')!, { target: { value: "Test Member" } });
    fireEvent.change(container.querySelector('input[name="phone"]')!, { target: { value: "0712345678" } });
    fireEvent.change(container.querySelector('input[name="city"]')!, { target: { value: "Cape Town" } });
    fireEvent.change(container.querySelector('input[name="addressLine1"]')!, { target: { value: "12 Test Street" } });
    fireEvent.change(container.querySelector('input[name="postalCode"]')!, { target: { value: "8001" } });
    fireEvent.click(screen.getByRole("button", { name: /submit quote request/i }));

    await waitFor(() => expect(screen.getByRole("dialog")).toBeTruthy());
    expect(screen.getByRole("heading", { name: /we’ve received your request/i })).toBeTruthy();
    expect(screen.getByText("#60002")).toBeTruthy();
    expect(screen.getByText(/1 item/i)).toBeTruthy();
    expect(screen.getAllByText("R490.00").length).toBeGreaterThan(1);
    expect(screen.getByText(/includes R140.00 delivery/i)).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: /view quote status/i }));
    expect(mocks.navigate).toHaveBeenCalledWith("/orders/60002");
  });
});
