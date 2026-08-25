import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";

describe("iKhokha-only payment router", () => {
  it("does not expose a customer EFT proof-upload procedure", () => {
    const procedures = appRouter._def.procedures as Record<string, unknown>;
    expect(procedures["orders.uploadProof"]).toBeUndefined();
  });
});
