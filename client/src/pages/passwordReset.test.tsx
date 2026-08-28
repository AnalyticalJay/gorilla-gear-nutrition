// @vitest-environment jsdom
import React from "react";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import ForgotPassword from "./ForgotPassword";
import ResetPassword from "./ResetPassword";

const mocks = vi.hoisted(() => ({ navigate: vi.fn(), forgotMutate: vi.fn(), resetMutate: vi.fn() }));

vi.mock("@/lib/trpc", () => ({
  trpc: {
    auth: {
      forgotPassword: { useMutation: (options: any) => ({ isPending: false, error: null, mutate: (input: any) => { mocks.forgotMutate(input); options.onSuccess?.({ success: true }); } }) },
      resetPassword: { useMutation: (options: any) => ({ isPending: false, error: null, mutate: (input: any) => { mocks.resetMutate(input); options.onSuccess?.({ success: true }); } }) },
    },
  },
}));

vi.mock("wouter", () => ({
  Link: ({ children, href, ...props }: any) => <a href={href} {...props}>{children}</a>,
  useLocation: () => ["/", mocks.navigate],
}));

describe("password reset screens", () => {
  afterEach(() => {
    cleanup();
    mocks.forgotMutate.mockReset();
    mocks.resetMutate.mockReset();
    window.history.pushState({}, "", "/");
  });

  it("submits a forgot-password request and keeps the response generic", async () => {
    render(<ForgotPassword />);
    fireEvent.change(screen.getByLabelText("Email Address"), { target: { value: "member@example.com" } });
    fireEvent.click(screen.getByRole("button", { name: /email reset link/i }));

    await waitFor(() => expect(screen.getByRole("status").textContent).toContain("If an active account matches"));
    expect(mocks.forgotMutate).toHaveBeenCalledWith({ email: "member@example.com" });
  });

  it("explains when the reset link is missing", () => {
    window.history.pushState({}, "", "/reset-password");
    render(<ResetPassword />);
    expect(screen.getByRole("alert").textContent).toContain("missing or invalid");
    expect(screen.getByRole("link", { name: /request new link/i }).getAttribute("href")).toBe("/forgot-password");
  });

  it("submits a strong password and confirms the update", async () => {
    window.history.pushState({}, "", "/reset-password?token=" + "a".repeat(64));
    render(<ResetPassword />);
    const password = "Strong#8";
    fireEvent.change(screen.getByLabelText("New Password"), { target: { value: password } });
    fireEvent.change(screen.getByLabelText("Confirm New Password"), { target: { value: password } });
    fireEvent.click(screen.getByRole("button", { name: /update password/i }));

    await waitFor(() => expect(screen.getByRole("status").textContent).toContain("password has been updated"));
    expect(mocks.resetMutate).toHaveBeenCalledWith({ token: "a".repeat(64), newPassword: password });
  });
});
