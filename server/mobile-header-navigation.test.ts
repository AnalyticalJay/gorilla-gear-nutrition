import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const navbarSource = readFileSync(resolve(process.cwd(), "client/src/components/Navbar.tsx"), "utf8");

describe("mobile header navigation", () => {
  it("uses member-aware Shop labels and exposes approved-member shortcuts in the mobile menu", () => {
    expect(navbarSource).toContain('const shopHref = isApproved ? "/products" : "/#member-catalogue"');
    expect(navbarSource).toContain('mobileLabel: isApproved ? "Browse full catalogue" : "Unlock member catalogue"');
    expect(navbarSource).toContain('mobileLabel: "Coaching Plans"');
    expect(navbarSource).toContain('mobileLabel: "Apply for Access"');
    expect(navbarSource).toContain("Quote Cart");
    expect(navbarSource).toContain("My Account");
    expect(navbarSource).toContain('aria-label="Open navigation menu"');
  });
});
