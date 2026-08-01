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

test("image and video generation expose the knowledge asset step and trigger", () => {
  for (const type of ["image", "video"]) {
    const html = renderGeneration(type, state);
    assert.match(html, /知识库资产/);
    assert.match(html, /data-action="run-knowledge-agent"/);
    assert.match(html, /调用知识库 Agent/);
  }
});
