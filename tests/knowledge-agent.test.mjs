import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { inferAssetNeeds, loadKnowledgeCatalog, runKnowledgeAgent } from "../src/knowledge-base/agent.mjs";
import { renderKnowledgeAgentModal } from "../src/knowledge-base/ui.mjs";

const asset = (overrides = {}) => ({
  assetId: "AST-001",
  name: "默认资产",
  assetType: "background_image",
  mediaType: "image",
  status: "active",
  fileHealthy: true,
  duplicateOf: "",
  quality: { resolution: 90, completeness: 90 },
  license: { status: "available", expiresAt: "2099-12-31" },
  brandScopes: ["平台品牌"],
  channels: ["信息流"],
  aspectRatios: ["4:5"],
  tags: ["真实", "轻促销", "数码"],
  categories: ["手机数码"],
  productIds: ["ITM-88310"],
  ...overrides
});

const requirement = {
  channel: "信息流",
  brand: "平台品牌",
  aspectRatio: "4:5",
  styleTags: ["真实", "轻促销", "数码"],
  categories: ["手机数码"]
};

test("infers different required asset types for image and video tasks", () => {
  const imageNeeds = inferAssetNeeds("image");
  const videoNeeds = inferAssetNeeds("video");

  assert.deepEqual(imageNeeds.map((item) => item.type), ["product_image", "background_image", "brand_logo", "font", "image_layout"]);
  assert.deepEqual(videoNeeds.map((item) => item.type), ["product_image", "video_template", "digital_human", "video_background", "subtitle_style", "brand_logo", "bgm"]);
  assert.equal(videoNeeds.find((item) => item.type === "digital_human").count, 3);
});

test("recalls only assets needed by the current generation form", () => {
  const result = runKnowledgeAgent({
    taskType: "image",
    requirement,
    products: [{ id: "ITM-88310", category: "手机数码" }],
    catalog: [
      asset({ assetId: "IMG-BG", assetType: "background_image", mediaType: "image" }),
      asset({ assetId: "VID-TPL", assetType: "video_template", mediaType: "video" })
    ]
  });

  assert.deepEqual(result.recalled.map((item) => item.assetId), ["IMG-BG"]);
});

test("filters every unusable asset reason before ranking", () => {
  const catalog = [
    asset({ assetId: "GOOD" }),
    asset({ assetId: "EXPIRED", status: "expired" }),
    asset({ assetId: "UNLISTED", status: "unlisted" }),
    asset({ assetId: "DUP", duplicateOf: "GOOD" }),
    asset({ assetId: "CORRUPT", fileHealthy: false }),
    asset({ assetId: "LOW-RES", quality: { resolution: 40, completeness: 90 } }),
    asset({ assetId: "NO-RIGHTS", license: { status: "unavailable", expiresAt: "2099-12-31" } }),
    asset({ assetId: "WRONG-BRAND", brandScopes: ["其他品牌"] }),
    asset({ assetId: "WRONG-CHANNEL", channels: ["线下大屏"] })
  ];
  const result = runKnowledgeAgent({ taskType: "image", requirement, products: [], catalog });

  assert.deepEqual(result.eligible.map((item) => item.assetId), ["GOOD"]);
  assert.deepEqual(result.filteredCounts, {
    expired: 1,
    unlisted: 1,
    duplicate: 1,
    corrupt: 1,
    lowResolution: 1,
    copyright: 1,
    brandMismatch: 1,
    channelMismatch: 1,
    sizeMismatch: 0
  });
});

test("ranks eligible assets against requirement, product, channel, style and quality", () => {
  const result = runKnowledgeAgent({
    taskType: "image",
    requirement,
    products: [{ id: "ITM-88310", category: "手机数码" }],
    catalog: [
      asset({ assetId: "GENERIC", tags: ["极简"], categories: ["家居"], productIds: [], quality: { resolution: 98, completeness: 98 } }),
      asset({ assetId: "MATCHED", quality: { resolution: 85, completeness: 88 } })
    ]
  });

  assert.equal(result.rankedByType.background_image[0].assetId, "MATCHED");
  assert.ok(result.rankedByType.background_image[0].score > result.rankedByType.background_image[1].score);
  assert.deepEqual(Object.keys(result.rankedByType.background_image[0].scoreBreakdown), ["requirement", "product", "channel", "style", "quality"]);
});

test("returns a human decision branch when a required asset type is insufficient", () => {
  const digitalHumans = [
    asset({ assetId: "HUM-01", assetType: "digital_human", mediaType: "video", aspectRatios: ["9:16"] }),
    asset({ assetId: "HUM-02", assetType: "digital_human", mediaType: "video", aspectRatios: ["9:16"] })
  ];
  const result = runKnowledgeAgent({
    taskType: "video",
    requirement: { ...requirement, aspectRatio: "9:16" },
    products: [{ id: "ITM-88310", category: "手机数码" }],
    catalog: digitalHumans
  });
  const humanGap = result.missingAssets.find((item) => item.type === "digital_human");

  assert.equal(result.status, "needs_decision");
  assert.equal(humanGap.missingCount, 1);
  assert.deepEqual(humanGap.actions, ["补充相应资产", "补充数字人", "不补充，继续生产", "调整当前创意方案"]);
});

test("loads one or two local records for every knowledge asset type", async () => {
  const fileFetch = async (url) => ({
    ok: true,
    json: async () => JSON.parse(await readFile(fileURLToPath(url), "utf8"))
  });
  const catalog = await loadKnowledgeCatalog(fileFetch);
  const counts = catalog.reduce((result, item) => ({ ...result, [item.assetType]: (result[item.assetType] || 0) + 1 }), {});

  for (const type of ["product_image", "background_image", "brand_logo", "font", "image_layout", "video_template", "digital_human", "video_background", "subtitle_style", "bgm"]) {
    assert.ok(counts[type] >= 1 && counts[type] <= 2, `${type} should contain one or two records`);
  }
});

test("knowledge Agent result UI exposes coverage, selected assets and every missing decision", () => {
  const result = runKnowledgeAgent({
    taskType: "video",
    requirement: { ...requirement, aspectRatio: "9:16" },
    products: [{ id: "ITM-88310", category: "手机数码" }],
    catalog: [asset({ assetId: "HUM-01", assetType: "digital_human", mediaType: "video", aspectRatios: ["9:16"] })]
  });
  const html = renderKnowledgeAgentModal(result, { taskType: "video" });

  for (const label of ["意图理解", "资产召回", "资产过滤", "资产排序", "数量和类型校验", "缺失资产处理", "资产覆盖校验", "人工决策"] ) {
    assert.match(html, new RegExp(label));
  }
  for (const decision of ["add_asset", "add_digital_human", "continue_with_gap", "adjust_plan"]) {
    assert.match(html, new RegExp(`data-knowledge-decision="${decision}"`));
  }
});
