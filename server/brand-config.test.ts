import { describe, expect, it } from "vitest";

describe("Anabolics Africa brand configuration", () => {
  it("exposes the configured application title and logo", () => {
    expect(process.env.VITE_APP_TITLE).toBe("Anabolics Africa");
    expect(process.env.VITE_APP_LOGO).toMatch(/^https?:\/\//);
  });
});
