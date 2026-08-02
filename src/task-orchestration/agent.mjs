const targetAgentFor = (taskType) => taskType === "video" ? "text_to_video_agent" : "text_to_image_agent";

const list = (value) => Array.isArray(value) ? value : value ? [value] : [];

export function buildTaskOrchestrationBrief({ taskType, requirement = {}, products = [], assets = [] } = {}) {
  const normalizedType = taskType === "video" ? "video" : "image";
  const missingInputs = [];
  if (!Object.keys(requirement).length) missingInputs.push("requirement");
  if (!products.length) missingInputs.push("products");
  if (!assets.length) missingInputs.push("assets");

  const objective = requirement.objective || "强化优惠心智并提升点击转化";
  const audience = requirement.audience || "18–35岁、近期浏览数码商品的价格敏感用户";
  const channel = requirement.channel || "信息流";
  const aspectRatio = requirement.aspectRatio || (normalizedType === "video" ? "9:16" : "4:5");
  const styleTags = list(requirement.styleTags).length ? list(requirement.styleTags) : ["真实", "可信", "轻促销"];
  const compliance = list(requirement.compliance).length ? list(requirement.compliance) : ["避免绝对低价", "避免夸大功效", "避免虚假稀缺"];
  const targetAgent = targetAgentFor(normalizedType);
  const productNames = products.map((item) => item.name).filter(Boolean).join("、");

  const creativeBrief = {
    objective,
    audience,
    channel,
    format: normalizedType === "video" ? `${aspectRatio} 竖版短视频` : `${aspectRatio} 信息流图片`,
    productStrategy: products.map((item, index) => ({
      priority: index + 1,
      productId: item.id,
      productName: item.name,
      category: item.category,
      selectionReason: item.reason || "运营已确认"
    })),
    messageHierarchy: ["核心利益点", "商品主体与关键卖点", "信任证据", "行动引导"],
    creativeStructure: normalizedType === "video"
      ? ["前3秒价格反差 Hook", "场景与商品演示", "权益和信任证据", "尾帧 CTA"]
      : ["商品主视觉", "核心利益点", "信任证据", "CTA 与品牌落版"],
    visualStyle: styleTags,
    brandConstraints: [requirement.brand || "平台品牌", "Logo 位于媒体安全区"],
    complianceConstraints: compliance,
    outputSpec: {
      aspectRatio,
      variantsPerProduct: normalizedType === "video" ? 2 : 3,
      durationSeconds: normalizedType === "video" ? 25 : null
    }
  };

  return {
    briefId: `BRIEF-${normalizedType.toUpperCase()}-MVP-001`,
    briefVersion: "1.0",
    orchestrationAgent: "task_orchestration_agent",
    targetAgent,
    status: missingInputs.length ? "needs_input" : "ready_for_generation",
    missingInputs,
    sourceSummary: { requirements: Object.keys(requirement).length ? 1 : 0, products: products.length, assets: assets.length },
    sourceSnapshots: {
      requirement: structuredClone(requirement),
      products: structuredClone(products),
      assets: structuredClone(assets)
    },
    creativeBrief,
    generationPayload: {
      agent: targetAgent,
      prompt: `面向${audience}，为${productNames || "已选商品"}生成${creativeBrief.format}，目标是${objective}。创意结构：${creativeBrief.creativeStructure.join(" → ")}。视觉风格：${styleTags.join("、")}。`,
      negativePrompt: compliance.join("；"),
      productReferences: products.map((item) => ({ productId: item.id, name: item.name, category: item.category })),
      assetReferences: assets.map((item) => ({ assetId: item.assetId, assetType: item.assetType, name: item.name, version: item.version, filePath: item.filePath })),
      output: creativeBrief.outputSpec
    }
  };
}
