const CATALOG_FILES = ["common-assets.json", "image-assets.json", "video-assets.json"];
const MIN_RESOLUTION_SCORE = 70;
const HUMAN_ACTIONS = ["补充相应资产", "补充数字人", "不补充，继续生产", "调整当前创意方案"];

const ASSET_NEEDS = {
  image: [
    { type: "product_image", count: 1, reason: "提供商品主体和关键细节" },
    { type: "background_image", count: 1, reason: "匹配投放场景与创意风格" },
    { type: "brand_logo", count: 1, reason: "确保品牌身份正确透出" },
    { type: "font", count: 1, reason: "保证文案视觉与授权合规" },
    { type: "image_layout", count: 1, reason: "适配渠道版位和安全区" }
  ],
  video: [
    { type: "product_image", count: 1, reason: "提供商品主体和关键细节" },
    { type: "video_template", count: 1, reason: "定义视频结构和镜头节奏" },
    { type: "digital_human", count: 3, reason: "覆盖产品讲解、场景种草和权益说明三个方向" },
    { type: "video_background", count: 1, reason: "承载口播与商品展示场景" },
    { type: "subtitle_style", count: 1, reason: "保证重点信息清晰可读" },
    { type: "brand_logo", count: 1, reason: "确保品牌身份正确透出" },
    { type: "bgm", count: 1, reason: "匹配节奏并保证音乐版权" }
  ]
};

const includesScope = (values = [], target) => values.includes("all") || values.includes(target);
const overlap = (left = [], right = []) => left.filter((value) => right.includes(value)).length;
const round = (value) => Number(value.toFixed(1));

export function inferAssetNeeds(taskType, quantityOverrides = {}) {
  const key = taskType === "video" ? "video" : "image";
  return ASSET_NEEDS[key].map((item) => ({ ...item, count: quantityOverrides[item.type] ?? item.count }));
}

function filterReason(asset, requirement) {
  if (asset.status === "expired") return "expired";
  if (asset.status === "unlisted") return "unlisted";
  if (asset.duplicateOf) return "duplicate";
  if (!asset.fileHealthy) return "corrupt";
  if ((asset.quality?.resolution ?? 0) < MIN_RESOLUTION_SCORE) return "lowResolution";
  if (asset.license?.status !== "available") return "copyright";
  if (!includesScope(asset.brandScopes, requirement.brand)) return "brandMismatch";
  if (!includesScope(asset.channels, requirement.channel)) return "channelMismatch";
  if (!includesScope(asset.aspectRatios, requirement.aspectRatio)) return "sizeMismatch";
  return "";
}

function scoreAsset(asset, requirement, products) {
  const productIds = products.map((item) => item.id);
  const productCategories = [...new Set([...products.map((item) => item.category), ...(requirement.categories || [])])];
  const categoryMatches = overlap(asset.categories, productCategories);
  const requirementScore = asset.categories?.includes("all") ? 80 : categoryMatches ? 100 : 0;
  const productScore = asset.productIds?.includes("all") ? 70 : overlap(asset.productIds, productIds) ? 100 : asset.productIds?.length ? 0 : 40;
  const channelScore = asset.channels?.includes(requirement.channel) ? 100 : 80;
  const wantedStyles = requirement.styleTags || [];
  const styleScore = wantedStyles.length ? Math.round(overlap(asset.tags, wantedStyles) / wantedStyles.length * 100) : 70;
  const qualityScore = ((asset.quality?.resolution || 0) + (asset.quality?.completeness || 0)) / 2;
  const scoreBreakdown = {
    requirement: round(requirementScore),
    product: round(productScore),
    channel: round(channelScore),
    style: round(styleScore),
    quality: round(qualityScore)
  };
  const score = round(requirementScore * 0.3 + productScore * 0.25 + channelScore * 0.2 + styleScore * 0.15 + qualityScore * 0.1);
  return { ...asset, score, scoreBreakdown };
}

export function runKnowledgeAgent({ taskType, requirement, products = [], catalog = [], quantityOverrides = {} }) {
  const needs = inferAssetNeeds(taskType, quantityOverrides);
  const neededTypes = new Set(needs.map((item) => item.type));
  const recalled = catalog.filter((asset) => neededTypes.has(asset.assetType));
  const filteredCounts = { expired: 0, unlisted: 0, duplicate: 0, corrupt: 0, lowResolution: 0, copyright: 0, brandMismatch: 0, channelMismatch: 0, sizeMismatch: 0 };
  const eligible = [];

  for (const asset of recalled) {
    const reason = filterReason(asset, requirement);
    if (reason) filteredCounts[reason] += 1;
    else eligible.push(scoreAsset(asset, requirement, products));
  }

  const rankedByType = {};
  for (const need of needs) {
    rankedByType[need.type] = eligible
      .filter((asset) => asset.assetType === need.type)
      .sort((a, b) => b.score - a.score || a.assetId.localeCompare(b.assetId));
  }

  const coverage = needs.map((need) => {
    const available = rankedByType[need.type].length;
    const selected = Math.min(need.count, available);
    return { ...need, available, selected, status: available >= need.count ? "ready" : "missing" };
  });
  const selectedAssets = coverage.flatMap((item) => rankedByType[item.type].slice(0, item.selected));
  const missingAssets = coverage.filter((item) => item.status === "missing").map((item) => ({
    type: item.type,
    required: item.count,
    available: item.available,
    missingCount: item.count - item.available,
    reason: `${item.reason}，当前仅有 ${item.available} 个可用资产`,
    actions: HUMAN_ACTIONS
  }));

  return {
    taskType,
    requirement,
    products,
    intent: { needs },
    recalled,
    eligible,
    filteredCounts,
    rankedByType,
    coverage,
    selectedAssets,
    missingAssets,
    status: missingAssets.length ? "needs_decision" : "ready"
  };
}

export async function loadKnowledgeCatalog(fetchImpl = globalThis.fetch) {
  if (typeof fetchImpl !== "function") throw new Error("知识库读取器不可用");
  const groups = await Promise.all(CATALOG_FILES.map(async (fileName) => {
    const response = await fetchImpl(new URL(`./data/${fileName}`, import.meta.url));
    if (!response.ok) throw new Error(`知识资产读取失败：${fileName}`);
    const payload = await response.json();
    if (!Array.isArray(payload.assets)) throw new Error(`知识资产格式错误：${fileName}`);
    return payload.assets;
  }));
  return groups.flat();
}

export const knowledgeAssetTypeLabels = {
  product_image: "商品图",
  background_image: "图片背景",
  brand_logo: "品牌 Logo",
  font: "字体",
  image_layout: "图片版式模板",
  video_template: "视频模板",
  digital_human: "数字人",
  video_background: "视频背景",
  subtitle_style: "字幕样式",
  bgm: "背景音乐"
};
