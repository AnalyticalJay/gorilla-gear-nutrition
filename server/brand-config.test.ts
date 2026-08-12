import { describe, expect, it } from "vitest";

describe("Gorilla Gear Nutrition brand configuration", () => {
  it("exposes the configured application title and logo", () => {
    expect(process.env.VITE_APP_TITLE).toBe("Gorilla Gear Nutrition");
    expect(process.env.VITE_APP_LOGO === "" || /^https?:\/\//.test(process.env.VITE_APP_LOGO ?? "")).toBe(true);
  });
});
