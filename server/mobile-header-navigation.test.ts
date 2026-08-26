import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const navbarSource = readFileSync(resolve(process.cwd(), "client/src/components/Navbar.tsx"), "utf8");

describe("mobile header navigation", () => {
  it("uses clear labels and exposes approved-member shortcuts in the mobile menu", () => {
    expect(navbarSource).toContain('mobileLabel: "Shop Products"');
    expect(navbarSource).toContain('mobileLabel: "Coaching Plans"');
    expect(navbarSource).toContain('mobileLabel: "Apply for Access"');
    expect(navbarSource).toContain("Quote Cart");
    expect(navbarSource).toContain("My Account");
    expect(navbarSource).toContain('aria-label="Open navigation menu"');
  });
});
