import { describe, expect, it } from "vitest";
import { previewBulkImport } from "./bulkImportPreview";

describe("bulk import preview", () => {
  it("normalizes categories and preserves commas inside quoted descriptions", () => {
    const result = previewBulkImport([
      "name,category,dosageInfo,description,brand,price",
      'Retatrutide,Peptide,30mg,"GLP-1, GIP, glucagon",Keifei Pharmaceuticals,R2 000',
      "Test E 250,Injectables,10ml vial; 250mg,Testosterone Enanthate,Keifei Pharmaceuticals,490",
    ].join("\n"));

    expect(result.ready).toBe(true);
    expect(result.rows[0]).toMatchObject({ category: "Peptides", description: "GLP-1, GIP, glucagon", price: "2000.00" });
    expect(result.rows[1].category).toBe("Injectables");
    expect(result.categoryCounts).toEqual({ Peptides: 1, Injectables: 1 });
  });

  it("blocks finalization when a required field or price is invalid", () => {
    const result = previewBulkImport([
      "name,category,dosageInfo,description,brand,price",
      ",Injectable,,,,450",
      "Invalid price,Peptides,,,Brand,not-a-price",
    ].join("\n"));

    expect(result.ready).toBe(false);
    expect(result.errors).toHaveLength(2);
    expect(result.errors[0]).toContain("Product name is required");
    expect(result.errors[1]).toContain("Price must be a non-negative ZAR amount");
  });

  it("rejects files without a category column before import", () => {
    const result = previewBulkImport("name,price\nProduct,450");
    expect(result.ready).toBe(false);
    expect(result.errors[0]).toContain("name and category columns");
  });
});
