import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const navbarSource = readFileSync(resolve(process.cwd(), "client/src/components/Navbar.tsx"), "utf8");

describe("mobile header navigation", () => {
  it("uses public collection browsing for visitors and full catalogue access for approved members", () => {
    expect(navbarSource).toContain('const shopHref = isApproved ? "/products" : "/#collections"');
    expect(navbarSource).toContain('mobileLabel: isApproved ? "Browse full catalogue" : "Shop public collections"');
    expect(navbarSource).toContain('mobileLabel: "Coaching Plans"');
    expect(navbarSource).not.toContain('desktopLabel: "Apply"');
    expect(navbarSource).toContain(">Apply Access</Button>");
    expect(navbarSource).toContain('href="/register" onClick={() => setMobileOpen(false)}');
    expect(navbarSource).toContain("mobile-nav-panel");
    expect(navbarSource).toContain("backdrop-blur-[2px]");
    expect(navbarSource).toContain("Application awaiting review");
    expect(navbarSource).toContain("Member access active");
    expect(navbarSource).toContain("Quote Cart");
    expect(navbarSource).toContain("My Account");
    expect(navbarSource).toContain('aria-label="Open navigation menu"');
  });
});
