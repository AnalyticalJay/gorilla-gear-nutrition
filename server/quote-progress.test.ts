import { describe, expect, it } from "vitest";
import { getQuoteProgress } from "../shared/quoteProgress";

describe("quote progress tracker", () => {
  it("starts with submission current and later steps upcoming", () => {
    const steps = getQuoteProgress("quote_pending");
    expect(steps.map((step) => step.state)).toEqual([
      "complete",
      "current",
      "upcoming",
      "upcoming",
      "upcoming",
    ]);
  });

  it("marks review complete and approval current after admin approval", () => {
    const steps = getQuoteProgress("quote_approved");
    expect(steps.map((step) => step.state)).toEqual([
      "complete",
      "complete",
      "current",
      "upcoming",
      "upcoming",
    ]);
  });

  it("marks payment current while awaiting payment and all steps complete after payment", () => {
    expect(getQuoteProgress("awaiting_payment").map((step) => step.state)).toEqual([
      "complete",
      "complete",
      "complete",
      "current",
      "upcoming",
    ]);
    expect(getQuoteProgress("paid", "paid").map((step) => step.state)).toEqual([
      "complete",
      "complete",
      "complete",
      "complete",
      "current",
    ]);
  });

  it("stops the tracker at review and marks the rejected step clearly", () => {
    const steps = getQuoteProgress("quote_rejected");
    expect(steps[1]?.state).toBe("rejected");
    expect(steps.slice(2).every((step) => step.state === "upcoming")).toBe(true);
  });
});
