import { describe, expect, it } from "vitest";

describe("performance audit configuration", () => {
  it("keeps the public application health path available without extra secrets", async () => {
    const response = await fetch("http://127.0.0.1:3000/");
    expect(response.status).toBeLessThan(500);
    expect(process.env.PERFORMANCE_AUDIT_NO_NEW_SECRET).toBeUndefined();
  });
});

