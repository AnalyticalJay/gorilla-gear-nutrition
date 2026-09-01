import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { buildProductsCsv } from "./productExport";

describe("product CSV export", () => {
  it("uses the bulk-import columns and safely escapes product fields", () => {
    const csv = buildProductsCsv([{
      name: "Compound, Premium",
      categoryName: "Injectables",
      dosageInfo: "10ml vial",
      description: "Line one\nLine two",
      brand: "Gorilla Gear",
      price: "450",
    }]);

    expect(csv).toBe(
      "name,category,dosageInfo,description,brand,price,subcategory,shopCollection\r\n" +
      '"Compound, Premium",Injectables,10ml vial,"Line one\nLine two",Gorilla Gear,450.00,,\r\n',
    );
  });

  it("exports blank optional fields and formats missing prices compatibly", () => {
    const csv = buildProductsCsv([{
      name: "Unpriced product",
      categoryName: null,
      dosageInfo: null,
      description: null,
      brand: null,
      price: null,
      subcategoryName: "",
      shopCollectionSlug: "",
    }]);

    expect(csv).toContain("Unpriced product,,,,,0.00,,");
  });

  it("round-trips taxonomy metadata for admin re-imports", () => {
    const csv = buildProductsCsv([{
      name: "Pharma - Example",
      categoryName: "Injectables",
      dosageInfo: "10ml",
      description: "Example",
      brandName: "Pharmaceuticals",
      subcategoryName: "Injectable Oils",
      shopCollectionSlug: "peptides-wellness",
      price: "125.5",
    }]);

    expect(csv).toContain("Pharma - Example,Injectables,10ml,Example,Pharmaceuticals,125.50,Injectable Oils,peptides-wellness");
  });

  it("keeps the export procedure restricted to administrators", () => {
    const routerSource = readFileSync(resolve(process.cwd(), "server/routers.ts"), "utf8");
    const adminProductsSource = readFileSync(resolve(process.cwd(), "client/src/pages/admin/AdminProducts.tsx"), "utf8");

    expect(routerSource).toContain("exportCSV: adminProcedure");
    expect(routerSource).toContain("buildProductsCsv(products)");
    expect(adminProductsSource).toContain("trpc.products.exportCSV.useMutation()");
    expect(adminProductsSource).toContain("Export CSV");
  });
});
