import { describe, expect, it } from "vitest";
import { getInsertId } from "./insertResult";

describe("getInsertId", () => {
  it("uses the MySQL result header from the first tuple element", () => {
    expect(getInsertId([{ insertId: 1827 }, []], "quote")).toBe(1827);
  });

  it("also supports direct adapter result headers", () => {
    expect(getInsertId({ insertId: 44 }, "product")).toBe(44);
  });

  it("rejects missing IDs before a dependent insert can be attempted", () => {
    expect(() => getInsertId([{}, []], "quote")).toThrow("Unable to determine the inserted quote ID");
  });
});
