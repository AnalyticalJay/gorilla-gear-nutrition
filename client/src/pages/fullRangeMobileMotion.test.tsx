/**
 * @vitest-environment jsdom
 */
import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";

vi.mock("@/_core/hooks/useAuth", () => ({
  useAuth: () => ({ user: null, isAuthenticated: false }),
}));

vi.mock("@/hooks/useMobile", () => ({
  useIsMobile: () => true,
}));

vi.mock("@/components/Navbar", () => ({ default: () => <nav>Navigation</nav> }));
vi.mock("@/components/Footer", () => ({ default: () => <footer>Footer</footer> }));
vi.mock("wouter", () => ({
  Link: ({ children, href, className }: any) => <a href={href} className={className}>{children}</a>,
}));

import Home from "@/pages/Home";

afterEach(() => cleanup());

describe("Full Range mobile motion optimization", () => {
  it("uses a static background layer on mobile while retaining the desktop-only hover cue", () => {
    render(<Home />);

    const background = screen.getByAltText("Private member catalogue collection");
    expect(background.className).not.toContain("will-change-transform");
    expect(background.className).not.toContain("-inset-4");
    expect(background.className).toContain("md:group-hover:brightness-110");
  });
});
