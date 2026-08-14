// @vitest-environment jsdom
import React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  refetch: vi.fn(),
}));

vi.mock("@/lib/trpc", () => ({
  trpc: {
    admin: {
      passwordResetAudit: {
        useQuery: () => ({
          data: [{
            id: 7,
            userId: 42,
            maskedEmail: "ch**@example.com",
            eventType: "email_sent",
            tokenHashPrefix: "abcdef1234567890",
            detail: null,
            createdAt: "2026-08-14T04:00:00.000Z",
          }],
          isLoading: false,
          isFetching: false,
          refetch: mocks.refetch,
        }),
      },
    },
  },
}));

vi.mock("wouter", () => ({
  Link: ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a>,
}));

import AdminResetAudit from "./AdminResetAudit";

describe("AdminResetAudit", () => {
  afterEach(() => cleanup());

  it("renders sanitized lifecycle details and privacy guidance", () => {
    render(<AdminResetAudit />);

    expect(screen.getByRole("heading", { name: /reset-token audit/i })).toBeTruthy();
    expect(screen.getByText("ch**@example.com")).toBeTruthy();
    expect(screen.getAllByText("Email sent").length).toBeGreaterThan(0);
    expect(screen.getByText(/raw reset tokens are never stored/i)).toBeTruthy();
    expect(screen.queryByText(/resetToken/i)).toBeNull();
  });

  it("offers event filtering, search, and manual refresh", () => {
    render(<AdminResetAudit />);

    fireEvent.change(screen.getByRole("combobox", { name: /filter reset events/i }), { target: { value: "email_sent" } });
    fireEvent.change(screen.getByRole("textbox", { name: /search reset audit events/i }), { target: { value: "ch**" } });
    fireEvent.click(screen.getByRole("button", { name: /refresh events/i }));

    expect(mocks.refetch).toHaveBeenCalledOnce();
    expect((screen.getByRole("textbox", { name: /search reset audit events/i }) as HTMLInputElement).value).toBe("ch**");
  });
});
