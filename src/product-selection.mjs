const clampScore = (value) => Math.max(0, Math.min(100, Number(value) || 0));
const weighted = (values, weights) => Number(values.reduce((total, value, index) => total + clampScore(value) * weights[index], 0).toFixed(1));

export const PRODUCT_QUALITY_RULES = {
  minimumImages: 3,
  minimumDescriptionLength: 50
};

function filterReason(product) {
  if (product.status !== "active") return "expired";
  if (product.duplicateOf) return "duplicate";
  if (product.imageCount < PRODUCT_QUALITY_RULES.minimumImages || product.descriptionLength < PRODUCT_QUALITY_RULES.minimumDescriptionLength) return "lowQuality";
  if (product.blacklisted) return "blacklist";
  return "";
}

function scoreProduct(product) {
  const match = weighted([product.match?.channel, product.match?.audience], [0.5, 0.5]);
  const material = weighted([product.material?.image, product.material?.description, product.material?.category], [0.4, 0.35, 0.25]);
  const data = weighted([product.data?.sales, product.data?.exposure, product.data?.clicks], [0.4, 0.3, 0.3]);
  const overall = weighted([match, material, data], [0.4, 0.3, 0.3]);
  return { match, material, data, overall };
}

export function filterAndRankProducts(candidates, { limit = 10, query = "", excludedIds = [] } = {}) {
  const safeLimit = Number(limit) === 20 ? 20 : 10;
  const filteredCounts = { expired: 0, duplicate: 0, lowQuality: 0, blacklist: 0 };
  const eligible = [];

  for (const product of candidates) {
    const reason = filterReason(product);
    if (reason) filteredCounts[reason] += 1;
    else eligible.push({ ...product, scores: scoreProduct(product) });
  }

  const ranked = eligible.sort((a, b) => b.scores.overall - a.scores.overall || a.id.localeCompare(b.id));
  const normalizedQuery = String(query).trim().toLowerCase();
  const searched = normalizedQuery
    ? ranked.filter((item) => [item.id, item.name, item.category].some((value) => String(value).toLowerCase().includes(normalizedQuery)))
    : ranked;
  const excluded = new Set(excludedIds);
  const matching = searched.filter((item) => !excluded.has(item.id));

  return {
    recalledCount: candidates.length,
    eligibleCount: ranked.length,
    filteredCounts,
    ranked,
    visible: matching.slice(0, safeLimit),
    matchingCount: matching.length,
    limit: safeLimit
  };
}
