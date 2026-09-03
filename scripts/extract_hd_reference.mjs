import fs from "node:fs/promises";

const pages = [1, 2, 3, 4];
const handles = new Set();
for (const page of pages) {
  const url = `https://anabolichyper.com/search?q=HD%20Labs&page=${page}`;
  const html = await (await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } })).text();
  const patterns = [
    /https:\/\/anabolichyper\.com\/products\/([a-z0-9-]+)/gi,
    /href="\/products\/([a-z0-9-]+)/gi,
  ];
  for (const pattern of patterns) {
    for (const match of html.matchAll(pattern)) handles.add(match[1]);
  }
}

const products = [];
for (const handle of handles) {
  try {
    const response = await fetch(`https://anabolichyper.com/products/${handle}.js`, { headers: { "User-Agent": "Mozilla/5.0" } });
    if (!response.ok) continue;
    const product = await response.json();
    if (/\bhd\s*labs\b/i.test(product.title ?? "") || handle.startsWith("hd-labs-")) {
      products.push({
        title: product.title,
        handle: product.handle ?? handle,
        description: product.description,
        images: product.images ?? [],
        variants: (product.variants ?? []).map((variant) => ({ title: variant.title, price: variant.price, available: variant.available })),
      });
    }
  } catch (error) {
    console.error(`WARN ${handle}: ${error.message}`);
  }
}
products.sort((a, b) => a.title.localeCompare(b.title));
const output = { generatedAt: new Date().toISOString(), discoveredHandles: handles.size, productCount: products.length, products };
await fs.writeFile("/tmp/hd-reference-catalogue.json", JSON.stringify(output, null, 2));
console.log(JSON.stringify({ outputPath: "/tmp/hd-reference-catalogue.json", discoveredHandles: handles.size, productCount: products.length, titles: products.map((product) => product.title) }, null, 2));
