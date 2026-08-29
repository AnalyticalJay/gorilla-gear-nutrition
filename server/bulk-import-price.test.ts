import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { normalizeBulkImportCategory, parseBulkImportPrice } from "./bulkImport";

describe("bulk import price parsing", () => {
  it("normalizes common category aliases to the active taxonomy", () => {
    expect(normalizeBulkImportCategory("Peptide")).toBe("Peptides");
    expect(normalizeBulkImportCategory("injectable")).toBe("Injectables");
    expect(normalizeBulkImportCategory("ORAL STEROIDS")).toBe("Orals");
    expect(normalizeBulkImportCategory("Weight Loss")).toBe("Fat Loss");
    expect(normalizeBulkImportCategory("SARMs")).toBe("SARMs");
  });

  it("normalizes valid ZAR prices to two decimals", () => {
    expect(parseBulkImportPrice("450")).toBe("450.00");
    expect(parseBulkImportPrice("R 1,250.50".replace(",", ""))).toBe("1250.50");
  });

  it("defaults blank prices to zero for backwards-compatible imports", () => {
    expect(parseBulkImportPrice("")).toBe("0.00");
    expect(parseBulkImportPrice(undefined)).toBe("0.00");
  });

  it("rejects malformed or negative prices", () => {
    expect(() => parseBulkImportPrice("-10")).toThrow(/non-negative/);
    expect(() => parseBulkImportPrice("450.999")).toThrow(/two decimal/);
    expect(() => parseBulkImportPrice("free")).toThrow(/non-negative/);
  });

  it("keeps the admin template and guidance aligned with the price column", () => {
    const source = readFileSync(resolve(process.cwd(), "client/src/pages/admin/AdminBulkImport.tsx"), "utf8");
    expect(source).toContain("name,category,dosageInfo,description,brand,price");
    expect(source).toContain("price</span>");
    expect(source).toContain("Price (ZAR)");
    expect(source).toContain("Injectables, Orals, SARMs, Peptides, Fat Loss, Healthcare, Supplements, Clothing");
    expect(source).toContain("Not Mixed),Peptides,30mg");
    expect(source).toContain("XLSX.utils.sheet_to_csv(worksheet");
    expect(source).toContain("const nextPreview = previewBulkImport(nextCsv)");
    expect(source).toContain("Prepared ${rowCount} products for review");
  });
});
