/** @vitest-environment jsdom */
import React from "react";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import Login from "./Login";

const mocks = vi.hoisted(() => ({
  mode: "loading" as "loading" | "error",
  invalidate: vi.fn().mockResolvedValue(undefined),
  navigate: vi.fn(),
}));

vi.mock("@/lib/trpc", () => ({
  trpc: {
    useUtils: () => ({ auth: { me: { invalidate: mocks.invalidate } } }),
    auth: {
      login: {
        useMutation: (options: any) => {
          const [isPending, setIsPending] = React.useState(false);
          return {
            isPending,
            mutate: () => {
              setIsPending(true);
              options.onMutate?.();
              if (mocks.mode === "error") {
                options.onError?.({ message: "Invalid email or password", data: { code: "UNAUTHORIZED" } });
                setIsPending(false);
              }
            },
          };
        },
      },
    },
  },
}));

vi.mock("wouter", () => ({
  Link: ({ children, href }: any) => <a href={href}>{children}</a>,
  useLocation: () => ["/login", mocks.navigate],
}));

vi.mock("@/const", () => ({ getLoginUrl: () => "/oauth/login" }));

describe("Login page", () => {
  afterEach(() => cleanup());

  it("shows an animated loading state while sign-in is being checked", async () => {
    mocks.mode = "loading";
    render(<Login />);

    fireEvent.change(screen.getByLabelText("Email Address"), { target: { value: "member@example.com" } });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "password" } });
    fireEvent.click(screen.getByRole("button", { name: /^Sign In$/ }));

    expect((await screen.findByRole("status")).textContent).toContain("Checking your approved member account");
    expect(screen.getByRole("button", { name: /signing in/i })).toBeTruthy();
  });

  it("shows specific guidance for invalid credentials", async () => {
    mocks.mode = "error";
    render(<Login />);

    fireEvent.change(screen.getByLabelText("Email Address"), { target: { value: "member@example.com" } });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "wrong" } });
    fireEvent.click(screen.getByRole("button", { name: /^Sign In$/ }));

    await waitFor(() => expect(screen.getByRole("status").textContent).toContain("Check your email and password"));
    expect(screen.getByRole("status").className).toContain("text-rose-200");
  });
});
