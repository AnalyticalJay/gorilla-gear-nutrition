/**
 * @vitest-environment jsdom
 */
import React from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

const submitMutation = vi.fn();

vi.mock("@/lib/trpc", () => ({
  trpc: { coaching: { submit: { useMutation: () => ({ mutate: submitMutation, isPending: false, error: null }) } } },
}));
vi.mock("@/_core/hooks/useAuth", () => ({ useAuth: () => ({ user: null, isAuthenticated: false, logout: vi.fn() }) }));
vi.mock("@/components/Navbar", () => ({ default: () => <nav>Navigation</nav> }));
vi.mock("@/components/Footer", () => ({ default: () => <footer>Footer</footer> }));
vi.mock("wouter", () => ({ Link: ({ href, children, className }: any) => <a href={href} className={className}>{children}</a> }));

import Coaching from "./Coaching";

describe("Coaching enquiry page", () => {
  it("renders required client contact, physical address and coaching-intake fields", () => {
    render(<Coaching />);
    expect(screen.getByRole("heading", { name: "Build a plan that earns results." })).toBeTruthy();
    expect(screen.getByLabelText("First name")).toBeTruthy();
    expect(screen.getByLabelText("Last name")).toBeTruthy();
    expect(screen.getByLabelText("Email address")).toBeTruthy();
    expect(screen.getByLabelText("Cellphone number")).toBeTruthy();
    expect(screen.getByLabelText("Physical address")).toBeTruthy();
    expect(screen.getByLabelText("Primary goal")).toBeTruthy();
    expect(screen.getByRole("button", { name: /submit coaching enquiry/i })).toBeTruthy();
  });
});
