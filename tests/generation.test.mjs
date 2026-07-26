import test from "node:test";
import assert from "node:assert/strict";
import { renderGeneration } from "../src/generation.mjs";

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
