import test from "node:test";
import assert from "node:assert/strict";
import { renderGeneration } from "../src/generation.mjs";
import * as generation from "../src/generation.mjs";

const state = { generationMode: "native" };

test("image generation uses approved fields and hides font controls", () => {
  const html = renderGeneration("image", state);
  for (const field of ["价格表达", "标签", "品牌", "风提"]) assert.match(html, new RegExp(field));
  assert.doesNotMatch(html, /字体风格/);
  assert.match(html, /单商品生成素材数/);
});

test("video generation uses approved creative structure and component set", () => {
  const html = renderGeneration("video", state);
  for (const field of ["Hook", "玩法", "利益点", "CTA", "镜头目标", "字幕渲染", "CTA展示方式"]) assert.match(html, new RegExp(field));
  assert.doesNotMatch(html, /视频总量/);
  assert.doesNotMatch(html, /Solution/);
});

test("replica mode keeps Agent and shows upload parsing", () => {
  const html = renderGeneration("image", { generationMode: "replica" });
  assert.match(html, /爆款复刻素材/);
  assert.match(html, /上传 JPG、PNG 或输入图片 URL/);
  assert.match(html, /创意 Agent/);
});

test("requirement clarification covers high-dimensional operating inputs", () => {
  assert.equal(typeof generation.buildRequirementClarification, "function");
  const imageModel = generation.buildRequirementClarification("image", { clarificationResolved: false });
  const videoModel = generation.buildRequirementClarification("video", { clarificationResolved: false });

  assert.ok(imageModel.dimensions.length >= 12, "image clarification should cover at least 12 dimensions");
  assert.ok(videoModel.dimensions.length > imageModel.dimensions.length, "video clarification should add production dimensions");
  for (const required of ["业务目标", "目标人群", "使用场景", "核心利益点", "渠道媒体", "合规边界", "交付排期"]) {
    assert.ok(imageModel.dimensions.some((item) => item.label === required), `missing clarification dimension: ${required}`);
  }
  for (const required of ["视频时长与节奏", "人物与口播", "声音与字幕"]) {
    assert.ok(videoModel.dimensions.some((item) => item.label === required), `missing video clarification dimension: ${required}`);
  }
  assert.ok(imageModel.questions.length >= 3, "missing information should produce targeted follow-up questions");
  assert.equal(imageModel.canConfirm, false);
});

test("requirement panel exposes follow-up questions and an explicit confirmation state", () => {
  const pendingHtml = renderGeneration("image", { generationMode: "native", clarificationResolved: false });
  const readyHtml = renderGeneration("image", { generationMode: "native", clarificationResolved: true });

  assert.match(pendingHtml, /待补追问/);
  assert.match(pendingHtml, /data-action="confirm-requirement" disabled/);
  assert.match(readyHtml, /信息已齐，可确认需求/);
  assert.match(readyHtml, /data-action="confirm-requirement"(?! disabled)/);
});

test("Enter submits an Agent message while Shift+Enter keeps a new line", () => {
  assert.equal(typeof generation.isAgentSubmitKey, "function");
  assert.equal(generation.isAgentSubmitKey({ key: "Enter", shiftKey: false, isComposing: false }), true);
  assert.equal(generation.isAgentSubmitKey({ key: "Enter", shiftKey: true, isComposing: false }), false);
  assert.equal(generation.isAgentSubmitKey({ key: "Enter", shiftKey: false, isComposing: true }), false);
  assert.equal(generation.isAgentSubmitKey({ key: "Space", shiftKey: false, isComposing: false }), false);
});

test("generation flow hands structured demand and selected products to the knowledge Agent", () => {
  assert.equal(typeof generation.buildKnowledgeAgentInput, "function");
  const selectedProducts = [{ id: "ITM-88310", name: "轻薄旗舰笔记本", category: "电脑办公" }];
  const imageInput = generation.buildKnowledgeAgentInput("image", selectedProducts);
  const videoInput = generation.buildKnowledgeAgentInput("video", selectedProducts);

  assert.equal(imageInput.taskType, "image");
  assert.equal(imageInput.requirement.aspectRatio, "4:5");
  assert.equal(videoInput.requirement.aspectRatio, "9:16");
  assert.deepEqual(imageInput.products, selectedProducts);
});

test("task orchestration Agent merges requirement, products and assets into a generation-ready creative Brief", () => {
  assert.equal(typeof generation.buildTaskOrchestrationBrief, "function");
  const result = generation.buildTaskOrchestrationBrief({
    taskType: "video",
    requirement: {
      objective: "提升点击转化",
      audience: "18–35岁价格敏感数码用户",
      channel: "信息流",
      aspectRatio: "9:16",
      styleTags: ["真实", "轻促销", "快节奏"],
      compliance: ["避免绝对低价"]
    },
    products: [{ id: "ITM-88310", name: "轻薄旗舰笔记本", category: "电脑办公", reason: "高意向人群点击增长" }],
    assets: [{ assetId: "VTPL-HOOK-001", name: "Hook-场景-利益-CTA 竖版模板", assetType: "video_template", version: "v2.1", filePath: "knowledge/video/hook-benefit-cta.json" }]
  });

  assert.equal(result.status, "ready_for_generation");
  assert.equal(result.targetAgent, "text_to_video_agent");
  assert.deepEqual(result.sourceSummary, { requirements: 1, products: 1, assets: 1 });
  assert.equal(result.creativeBrief.audience, "18–35岁价格敏感数码用户");
  assert.equal(result.creativeBrief.productStrategy[0].productId, "ITM-88310");
  assert.equal(result.generationPayload.assetReferences[0].assetId, "VTPL-HOOK-001");
  assert.match(result.generationPayload.prompt, /提升点击转化/);
  assert.match(result.generationPayload.prompt, /轻薄旗舰笔记本/);
});

test("generation page exposes the orchestration handoff only after knowledge assets are confirmed", () => {
  const beforeKnowledge = renderGeneration("image", {
    generationMode: "native",
    generationClarification: { image: { resolved: true, confirmed: true } },
    generationWorkflow: { image: { productConfirmed: true, productCount: 10, knowledgeConfirmed: false } }
  });
  assert.doesNotMatch(beforeKnowledge, /data-task-orchestration-brief/);

  const afterKnowledge = renderGeneration("image", {
    generationMode: "native",
    generationClarification: { image: { resolved: true, confirmed: true } },
    generationWorkflow: { image: { productConfirmed: true, productCount: 10, knowledgeConfirmed: true, knowledgeCount: 5 } }
  });
  assert.match(afterKnowledge, /data-task-orchestration-brief/);
  assert.match(afterKnowledge, /任务编排 Agent/);
  assert.match(afterKnowledge, /需求快照/);
  assert.match(afterKnowledge, /选品信息/);
  assert.match(afterKnowledge, /知识资产包/);
  assert.match(afterKnowledge, /结构化创意 Brief/);
  assert.match(afterKnowledge, /文生图 Agent/);
});

test("image and video generation expose the knowledge asset step and trigger", () => {
  for (const type of ["image", "video"]) {
    const html = renderGeneration(type, state);
    assert.match(html, /知识库资产/);
    assert.match(html, /data-action="run-knowledge-agent"/);
    assert.match(html, /调用知识库 Agent/);
  }
});

test("left Agent requires operator confirmation for product ranking and knowledge assets in order", () => {
  const requirementConfirmed = {
    generationMode: "native",
    generationClarification: { image: { resolved: true, confirmed: true } },
    generationWorkflow: { image: { productConfirmed: false, productCount: 0, knowledgeConfirmed: false, knowledgeCount: 0 } }
  };
  const productPending = renderGeneration("image", requirementConfirmed);
  assert.match(productPending, /data-workflow-confirmation="product"/);
  assert.match(productPending, /选品排序待运营确认/);
  assert.match(productPending, /查看排序并确认/);
  assert.match(productPending, /data-action="run-knowledge-agent" disabled/);

  const productConfirmed = renderGeneration("image", {
    ...requirementConfirmed,
    generationWorkflow: { image: { productConfirmed: true, productCount: 10, knowledgeConfirmed: false, knowledgeCount: 0 } }
  });
  assert.match(productConfirmed, /已确认 10 个商品/);
  assert.match(productConfirmed, /知识资产待运营确认/);
  assert.match(productConfirmed, /data-action="run-knowledge-agent"(?! disabled)/);

  const workflowConfirmed = renderGeneration("image", {
    ...requirementConfirmed,
    generationWorkflow: { image: { productConfirmed: true, productCount: 10, knowledgeConfirmed: true, knowledgeCount: 5 } }
  });
  assert.match(workflowConfirmed, /已确认 5 个知识资产/);
  assert.match(workflowConfirmed, /data-workflow-confirmation="creative"/);
  assert.match(workflowConfirmed, /data-action="preview" disabled/);
});

test("operator confirmations stay in chat order and reveal only reached stages", () => {
  const requirementConfirmed = {
    generationMode: "native",
    generationClarification: { image: { resolved: true, confirmed: true } },
    generationWorkflow: { image: { productConfirmed: false, productCount: 0, knowledgeConfirmed: false, knowledgeCount: 0 } }
  };
  const productPending = renderGeneration("image", requirementConfirmed);
  const requirementIndex = productPending.indexOf('data-action="confirm-requirement"');
  const productIndex = productPending.indexOf('data-workflow-confirmation="product"');
  const fieldDiffIndex = productPending.indexOf('class="field-diff"');

  assert.ok(requirementIndex >= 0 && requirementIndex < productIndex, "product confirmation should follow the requirement conversation");
  assert.ok(fieldDiffIndex < productIndex, "the active confirmation should be the latest item in the chronological chat flow");
  assert.doesNotMatch(productPending, /data-workflow-confirmation="knowledge"/, "future confirmation stages should stay hidden");

  const productConfirmed = renderGeneration("image", {
    ...requirementConfirmed,
    generationWorkflow: { image: { productConfirmed: true, productCount: 10, knowledgeConfirmed: false, knowledgeCount: 0 } }
  });
  const confirmedProductIndex = productConfirmed.indexOf('data-workflow-confirmation="product"');
  const knowledgeIndex = productConfirmed.indexOf('data-workflow-confirmation="knowledge"');
  assert.ok(confirmedProductIndex >= 0 && confirmedProductIndex < knowledgeIndex, "knowledge confirmation should follow the completed product step");
});

test("creative, preview and batch confirmations appear progressively after knowledge assets", () => {
  const base = {
    generationMode: "native",
    generationClarification: { video: { resolved: true, confirmed: true } },
    generationWorkflow: {
      video: {
        productConfirmed: true,
        productCount: 10,
        knowledgeConfirmed: true,
        knowledgeCount: 9,
        creativeConfirmed: false,
        previewConfirmed: false
      }
    }
  };

  const creativePending = renderGeneration("video", base);
  assert.match(creativePending, /data-workflow-confirmation="creative"/);
  assert.match(creativePending, /确认 Brief 并交给文生视频 Agent/);
  assert.doesNotMatch(creativePending, /data-workflow-confirmation="preview"/);
  assert.doesNotMatch(creativePending, /data-workflow-confirmation="batch"/);
  assert.match(creativePending, /data-action="preview" disabled/);

  const previewPending = renderGeneration("video", {
    ...base,
    generationWorkflow: { video: { ...base.generationWorkflow.video, creativeConfirmed: true } }
  });
  assert.match(previewPending, /data-workflow-confirmation="preview"/);
  assert.match(previewPending, /生成预览并确认/);
  assert.doesNotMatch(previewPending, /data-workflow-confirmation="batch"/);
  assert.match(previewPending, /data-action="preview"(?! disabled)/);

  const batchPending = renderGeneration("video", {
    ...base,
    generationWorkflow: { video: { ...base.generationWorkflow.video, creativeConfirmed: true, previewConfirmed: true } }
  });
  const creativeIndex = batchPending.indexOf('data-workflow-confirmation="creative"');
  const previewIndex = batchPending.indexOf('data-workflow-confirmation="preview"');
  const batchIndex = batchPending.indexOf('data-workflow-confirmation="batch"');
  assert.ok(creativeIndex >= 0 && creativeIndex < previewIndex && previewIndex < batchIndex, "steps 4, 5 and 6 should stay in chronological order");
  assert.match(batchPending, /data-action="create-batch"/);
});
