import fs from "node:fs/promises";

const current = JSON.parse(await fs.readFile("/tmp/upa-catalogue-audit.json", "utf8"));
const reference = JSON.parse(await fs.readFile("/tmp/upa-reference-catalogue.json", "utf8"));

function normalize(value) {
  return String(value ?? "")
    .toLowerCase()
    .replace(/^upa\s*[-:]?\s*/i, "")
    .replace(/\b(self\s*mix|not\s*mixed|special\s*request|mounjaro|glp[- ]?1|3ml|pen|tabs?|vial|bottle|default\s*title)\b/g, " ")
    .replace(/\b(lr3)\b/g, "lr3")
    .replace(/\b(anabolicum)\b/g, "anabolicum")
    .replace(/\b(arimadex)\b/g, "arimidex")
    .replace(/\b(mastron)\b/g, "masteron")
    .replace(/\b(tertroxin)\b/g, "tertroxin")
    .replace(/\b(igf1lr3)\b/g, "igf 1 lr3")
    .replace(/\b(igf[- ]?1[- ]?lr3)\b/g, "igf 1 lr3")
    .replace(/\b(testolone)\b/g, "testolone")
    .replace(/\b(nutrobal)\b/g, "nutrobal")
    .replace(/\b(osterine)\b/g, "osterine")
    .replace(/\b(cardarine|cardirine)\b/g, "cardarine")
    .replace(/\b(anavar)\b/g, "anavar")
    .replace(/\b(anapolon|anapolan)\b/g, "anapolon")
    .replace(/\b(trenbolone)\b/g, "tren")
    .replace(/\b(acetate|fast|short|long|slow|e|p|c|a)\b/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokens(value) {
  return new Set(normalize(value).split(" ").filter((token) => token.length > 1));
}

function score(a, b) {
  const at = tokens(a);
  const bt = tokens(b);
  if (!at.size || !bt.size) return 0;
  let common = 0;
  for (const token of at) if (bt.has(token)) common += 1;
  return common / Math.max(at.size, bt.size);
}

const matches = current.products.map((product) => {
  const candidates = reference.products
    .map((ref) => ({ ref, score: score(product.name, ref.title) }))
    .sort((a, b) => b.score - a.score);
  const best = candidates[0];
  return {
    id: product.id,
    currentName: product.name,
    dosageInfo: product.dosageInfo,
    currentImage: product.images[0]?.imageUrl ?? null,
    bestScore: best?.score ?? 0,
    referenceTitle: best?.ref.title ?? null,
    referenceHandle: best?.ref.handle ?? null,
    referenceImage: best?.ref.images[0]?.src ?? null,
    classification: best?.score >= 0.8 ? "high_confidence_candidate" : best?.score >= 0.6 ? "review_candidate" : "unmatched",
  };
});

const output = { generatedAt: new Date().toISOString(), matches };
await fs.writeFile("/tmp/upa-match-report.json", JSON.stringify(output, null, 2));
console.log(JSON.stringify({
  products: matches.length,
  highConfidence: matches.filter((m) => m.classification === "high_confidence_candidate").length,
  reviewCandidates: matches.filter((m) => m.classification === "review_candidate").length,
  unmatched: matches.filter((m) => m.classification === "unmatched").length,
}, null, 2));
