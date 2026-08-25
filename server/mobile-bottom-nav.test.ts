import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const projectRoot = resolve(import.meta.dirname, "..");

describe("simplified mobile navigation", () => {
  it("does not render or reserve space for a fixed mobile footer navigation", () => {
    const app = readFileSync(resolve(projectRoot, "client/src/App.tsx"), "utf8");
    expect(app).not.toContain("MobileBottomNav");
    expect(app).not.toContain("shouldShowMobileNav");
    expect(app).not.toContain("pb-24 md:pb-0");
  });
});
