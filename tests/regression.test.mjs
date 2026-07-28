import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { renderRoute } from "../src/features.mjs";

const baseState = {
  role: "employee",
  route: "image",
  toast: "",
  drawer: null,
  modal: null,
  generationMode: "native",
  knowledgeType: "common",
  drafts: {},
  selectedAssets: new Set()
};

const routeExpectations = new Map([
  ["image", ["图片素材生成", "创意 Agent", "AI素材方案"]],
  ["video", ["视频素材生成", "分镜脚本", "组件配置"]],
  ["tasks", ["任务进度", "当前进度", "状态说明"]],
  ["audits", ["审核管理", "外部审核中台", "按原因修改方案"]],
  ["library", ["素材库", "批量导出", "表现优良"]],
  ["knowledge", ["知识库", "公共知识", "版本"]],
  ["analytics", ["素材数据", "采用率", "U1/U2/U3"]],
  ["accounts", ["账号管理", "员工申请", "代理商账号"]],
  ["partner-assets", ["授权素材", "授权有效期", "下载"]],
  ["partner-downloads", ["下载记录", "下载时间", "素材ID"]]
]);

test("every MVP route renders its defining content", () => {
  for (const [route, expectedTexts] of routeExpectations) {
    const html = renderRoute({ ...baseState, route });
    assert.ok(html.length > 500, `${route} should render a substantive page`);
    for (const text of expectedTexts) {
      assert.match(html, new RegExp(text), `${route} should include ${text}`);
    }
  }
});

test("rendered routes do not contain unfinished placeholders or corrupted text", () => {
  for (const route of routeExpectations.keys()) {
    const html = renderRoute({ ...baseState, route });
    assert.doesNotMatch(html, /\uFFFD|TODO|FIXME|undefined|null/);
  }
});

test("application entry files declare Chinese UTF-8 metadata and accessible labels", async () => {
  const index = await readFile(new URL("../index.html", import.meta.url), "utf8");
  const app = await readFile(new URL("../src/app.mjs", import.meta.url), "utf8");
  const ui = await readFile(new URL("../src/ui.mjs", import.meta.url), "utf8");

  assert.match(index, /<html lang="zh-CN">/);
  assert.match(index, /<meta charset="UTF-8"/);
  assert.match(index, /aria-live="polite"/);
  assert.match(ui, /aria-label="切换演示角色"/);
  assert.doesNotMatch(index + app + ui, /\uFFFD/);
});
