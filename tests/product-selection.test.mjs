import test from "node:test";
import assert from "node:assert/strict";
import { filterAndRankProducts } from "../src/product-selection.mjs";
import { renderProductSelectionModal } from "../src/generation.mjs";

const candidate = (overrides = {}) => ({
  id: "ITEM-001",
  name: "高质量候选商品",
  category: "手机数码",
  status: "active",
  duplicateOf: "",
  blacklisted: false,
  imageCount: 6,
  descriptionLength: 96,
  match: { channel: 80, audience: 80 },
  material: { image: 80, description: 80, category: 80 },
  data: { sales: 80, exposure: 80, clicks: 80 },
  ...overrides
});

test("filters invalid, duplicate, low-quality and blacklisted products before ranking", () => {
  const result = filterAndRankProducts([
    candidate(),
    candidate({ id: "ITEM-EXPIRED", status: "expired" }),
    candidate({ id: "ITEM-DUPLICATE", duplicateOf: "ITEM-001" }),
    candidate({ id: "ITEM-IMAGE-POOR", imageCount: 1 }),
    candidate({ id: "ITEM-COPY-POOR", descriptionLength: 18 }),
    candidate({ id: "ITEM-BLACKLIST", blacklisted: true })
  ]);

  assert.deepEqual(result.ranked.map((item) => item.id), ["ITEM-001"]);
  assert.deepEqual(result.filteredCounts, {
    expired: 1,
    duplicate: 1,
    lowQuality: 2,
    blacklist: 1
  });
  assert.equal(result.recalledCount, 6);
  assert.equal(result.eligibleCount, 1);
});

test("uses match, material and main-site data scores for weighted ranking and TopN", () => {
  const candidates = Array.from({ length: 22 }, (_, index) => candidate({
    id: `ITEM-${String(index + 1).padStart(3, "0")}`,
    name: `候选商品 ${index + 1}`,
    match: { channel: 60 + index, audience: 60 + index },
    material: { image: 65 + index, description: 65 + index, category: 65 + index },
    data: { sales: 55 + index, exposure: 55 + index, clicks: 55 + index }
  }));

  const top10 = filterAndRankProducts(candidates, { limit: 10 });
  const top20 = filterAndRankProducts(candidates, { limit: 20 });

  assert.equal(top10.visible.length, 10);
  assert.equal(top20.visible.length, 20);
  assert.equal(top10.visible[0].id, "ITEM-022");
  assert.ok(top10.visible[0].scores.overall > top10.visible[1].scores.overall);
  assert.deepEqual(Object.keys(top10.visible[0].scores), ["match", "material", "data", "overall"]);
  assert.equal(top10.limit, 10);
  assert.equal(top20.limit, 20);
});

test("product management UI explains the funnel and supports operating confirmation", () => {
  const html = renderProductSelectionModal({ limit: 10 });

  for (const label of ["意图召回", "失效过滤", "重复过滤", "低质量过滤", "黑名单过滤", "渠道/人群匹配", "素材质量", "数据质量", "综合推荐分"]) {
    assert.match(html, new RegExp(label));
  }
  assert.match(html, /data-product-limit="10"/);
  assert.match(html, /data-product-limit="20"/);
  assert.match(html, /data-action="product-score-detail"/);
  assert.match(html, /data-action="confirm-product-selection"/);
  assert.match(html, /确认选中 10 个商品/);
});
