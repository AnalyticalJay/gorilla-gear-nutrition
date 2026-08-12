import { describe, expect, it } from "vitest";
import { countPendingQuotes } from "../shared/adminStats";

describe("countPendingQuotes", () => {
  it("counts only quote requests awaiting review", () => {
    expect(
      countPendingQuotes([
        { status: "quote_pending" },
        { status: "quote_approved" },
        { status: "paid" },
        { status: "quote_pending" },
      ]),
    ).toBe(2);
  });

  it("returns zero when there are no pending quotes", () => {
    expect(countPendingQuotes([{ status: "quote_rejected" }, { status: "paid" }])).toBe(0);
  });
});
