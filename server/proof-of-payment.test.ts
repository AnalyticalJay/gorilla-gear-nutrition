import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const routerSource = readFileSync(resolve(process.cwd(), "server/routers.ts"), "utf8");

describe("iKhokha-only payment policy", () => {
  it("does not expose an active proof-of-payment upload procedure", () => {
    expect(routerSource).not.toContain("uploadProof: protectedProcedure");
    expect(routerSource).not.toContain("confirmEft: adminProcedure");
    expect(routerSource).not.toContain("rejectProof: adminProcedure");
  });
});
