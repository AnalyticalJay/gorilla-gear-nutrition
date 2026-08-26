import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("mobile bottom navigation", () => {
  it("keeps header navigation as the only mobile app-shell navigation system", () => {
    const appSource = readFileSync(resolve(process.cwd(), "client/src/App.tsx"), "utf8");

    expect(appSource).not.toContain("MobileBottomNav");
    expect(appSource).not.toContain("shouldShowMobileNav");
    expect(appSource).not.toContain("pb-24 md:pb-0");
  });
});
