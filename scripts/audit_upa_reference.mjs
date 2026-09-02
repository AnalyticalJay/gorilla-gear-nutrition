import fs from "node:fs/promises";

const sourceUrl = "https://anabolichyper.com/products.json?limit=250";
const response = await fetch(sourceUrl, { headers: { "User-Agent": "Gorilla-Gear-Nutrition-catalogue-audit/1.0" } });
if (!response.ok) throw new Error(`Reference catalogue request failed: ${response.status}`);
const payload = await response.json();
const products = (payload.products ?? [])
  .filter((product) => /^UPA\b/i.test(String(product.title ?? "")))
  .map((product) => ({
    id: product.id,
    title: product.title,
    handle: product.handle,
    bodyHtml: product.body_html,
    variants: (product.variants ?? []).map((variant) => ({ id: variant.id, title: variant.title, price: variant.price })),
    images: (product.images ?? []).map((image) => ({ id: image.id, src: image.src, alt: image.alt })),
  }));
const result = { generatedAt: new Date().toISOString(), sourceUrl, productCount: products.length, products };
await fs.writeFile("/tmp/upa-reference-catalogue.json", JSON.stringify(result, null, 2));
console.log(JSON.stringify({ sourceUrl, productCount: products.length, withImages: products.filter((product) => product.images.length > 0).length }, null, 2));
