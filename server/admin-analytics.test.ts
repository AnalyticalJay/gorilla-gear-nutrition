import { describe, expect, it } from "vitest";
import { getAdminAnalytics } from "./db";

describe("Admin analytics metrics", () => {
  it("returns structured analytics metrics with users, products, quotes, orders, and recent lists", async () => {
    const analytics = await getAdminAnalytics();
    expect(analytics).toBeDefined();
    expect(analytics.users).toBeDefined();
    expect(typeof analytics.users.total).toBe("number");
    expect(analytics.products).toBeDefined();
    expect(typeof analytics.products.imageCoveragePercent).toBe("number");
    expect(analytics.quotes).toBeDefined();
    expect(analytics.orders).toBeDefined();
    expect(Array.isArray(analytics.recentUsers)).toBe(true);
    expect(Array.isArray(analytics.recentOrders)).toBe(true);
  });
});
