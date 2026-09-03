import fs from "node:fs/promises";

const current = JSON.parse(await fs.readFile("/tmp/hd-labs-catalogue-audit.json", "utf8"));
const reference = JSON.parse(await fs.readFile("/tmp/hd-reference-catalogue.json", "utf8"));

const normalize = (value) => String(value ?? "")
  .toLowerCase()
  .replace(/hd\s*[-_]?\s*labs?|hd\s*[-_]?/g, "")
  .replace(/\b(tabs?|tablets?|vials?|caps?|capsules?|pre[- ]?workout)\b/g, "")
  .replace(/[^a-z0-9]+/g, "")
  .trim();

const aliases = new Map([
  ["cialis", "cialis"],
  ["clomid", "clomid"],
  ["proviron", "provirion"],
  ["tren", "tren"],
  ["trenaject", "trenaject"],
  ["trenaject200", "trenaject200"],
  ["trenaject100", "trenaject100"],
  ["trenaject", "trenaject"],
  ["trenaject", "trenaject"],
  ["trinaject200", "trinaject200"],
  ["sustaject325", "sustaject325"],
  ["retatrutide32mg", "retatrutide32mg"],
  ["tirzepatide30mg", "tirzepatide30mg"],
]);
const canonicalKey = (value) => aliases.get(normalize(value)) ?? normalize(value);

const matches = [];
for (const product of current.products) {
  const key = canonicalKey(product.name);
  const candidates = reference.products.filter((candidate) => canonicalKey(candidate.title) === key);
  const primary = product.images.find((image) => image.isPrimary)?.imageUrl ?? null;
  matches.push({
    productId: product.id,
    currentName: product.name,
    dosageInfo: product.dosageInfo,
    currentPrimary: primary,
    matchCount: candidates.length,
    candidates: candidates.map((candidate) => ({ title: candidate.title, handle: candidate.handle, image: candidate.images[0] ?? null })),
    classification: candidates.length === 1 ? "exact_title_match" : candidates.length > 1 ? "review_multiple_reference_matches" : "unmatched",
  });
}
const result = { generatedAt: new Date().toISOString(), currentCount: current.products.length, referenceCount: reference.products.length, matches };
await fs.writeFile("/tmp/hd-reference-match.json", JSON.stringify(result, null, 2));
console.log(JSON.stringify({
  exactTitleMatches: matches.filter((item) => item.classification === "exact_title_match").length,
  multipleReferenceMatches: matches.filter((item) => item.classification === "review_multiple_reference_matches").length,
  unmatched: matches.filter((item) => item.classification === "unmatched").length,
  unmatchedProducts: matches.filter((item) => item.classification === "unmatched").map((item) => ({ id: item.productId, name: item.currentName })),
  exactExamples: matches.filter((item) => item.classification === "exact_title_match").slice(0, 10),
}, null, 2));
