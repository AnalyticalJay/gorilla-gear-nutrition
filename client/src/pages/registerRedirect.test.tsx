// @vitest-environment jsdom
import React from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ navigate: vi.fn() }));

vi.mock("@/components/RegistrationForm", () => ({
  RegistrationForm: ({ onSubmitted }: { onSubmitted: () => void }) => <button type="button" onClick={onSubmitted}>Complete application</button>,
  RegistrationSubmitted: () => <div role="status">Application received. Redirecting you to sign in…</div>,
}));

vi.mock("wouter", () => ({
  Link: ({ children, href, ...props }: any) => <a href={href} {...props}>{children}</a>,
  useLocation: () => ["/register", mocks.navigate],
}));

import Register from "./Register";

describe("registration completion", () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it("confirms submission and redirects to sign in after four seconds", () => {
    vi.useFakeTimers();
    render(<Register />);

    fireEvent.click(screen.getByRole("button", { name: /complete application/i }));
    expect(screen.getByRole("status").textContent).toContain("Redirecting you to sign in");

    act(() => vi.advanceTimersByTime(4000));
    expect(mocks.navigate).toHaveBeenCalledWith("/login?registration=complete");
  });
});
