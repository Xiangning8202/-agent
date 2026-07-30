import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { navItems, partnerNav, tasks } from "../src/data.mjs";
import { renderGeneration } from "../src/generation.mjs";
import * as operations from "../src/operations.mjs";
import * as backoffice from "../src/backoffice.mjs";
import * as ui from "../src/ui.mjs";
import { renderRoute } from "../src/features.mjs";

function selectOptionCounts(html) {
  return [...html.matchAll(/<select\b[^>]*>([\s\S]*?)<\/select>/g)]
    .map((match) => [...match[1].matchAll(/<option\b/g)].length);
}

test("navigation uses real local SVG icons that remain available offline", async () => {
  const entries = [...navItems, ...partnerNav];
  for (const [, label, iconPath] of entries) {
    assert.match(iconPath, /^\.\/src\/assets\/icons\/[a-z0-9-]+\.svg$/, `${label} should reference a local SVG`);
    const file = await readFile(new URL(`../${iconPath.replace("./", "")}`, import.meta.url), "utf8");
    assert.match(file, /^<svg[\s>]/);
  }
});

test("application shell renders icon navigation and functional top panels", () => {
  const html = ui.renderShell?.({
    role: "employee",
    route: "image",
    toast: "",
    topPanel: "notifications"
  }) ?? "";

  assert.match(html, /class="nav-icon"/);
  assert.match(html, /--icon:url\('\/src\/assets\/icons\/image\.svg'\)/);
  assert.doesNotMatch(html, /--icon:url\('\.\/src\/assets\/icons\//);
  assert.match(html, /通知中心/);
  assert.match(html, /data-top-panel="notifications"/);
});

test("clearing the Agent conversation produces a visible empty state", () => {
  const html = renderGeneration("image", {
    generationMode: "native",
    conversationCleared: true
  });

  assert.match(html, /会话已清空/);
  assert.doesNotMatch(html, /为近期热门数码商品做一批信息流图片/);
});

test("task filters only render matching task rows", () => {
  const html = operations.renderTasks({ taskType: "预览生成" });

  assert.match(html, new RegExp(tasks[1].id));
  assert.doesNotMatch(html, new RegExp(tasks[0].id));
});

test("task drawer tabs render distinct detail content", () => {
  const html = operations.renderTaskDrawer?.(tasks[0], "generation") ?? "";

  assert.match(html, /生成明细/);
  assert.match(html, /成功素材/);
  assert.doesNotMatch(html, /知识资产快照 v3/);
});

test("material filters remove nonmatching cards", () => {
  const html = operations.renderLibrary({ assetType: "图片" });

  assert.match(html, /IMG-/);
  assert.doesNotMatch(html, /VID-/);
});

test("knowledge category selection narrows the asset table", () => {
  const html = backoffice.renderKnowledge({
    knowledgeType: "common",
    knowledgeCategory: 2
  });

  assert.match(html, /平台蓝品牌资产/);
  assert.doesNotMatch(html, /全量商品库/);
});

test("account tabs render the selected workflow", () => {
  const html = backoffice.renderAccounts({ accountTab: "applications" });

  assert.match(html, /申请时间/);
  assert.match(html, /通过申请/);
  assert.doesNotMatch(html, /最近登录/);
});

test("analytics and partner filters render only the selected asset type", () => {
  const analyticsHtml = backoffice.renderAnalytics({ assetType: "视频" });
  const partnerHtml = backoffice.renderPartnerAssets({ assetType: "图片" });

  assert.match(analyticsHtml, /VID-/);
  assert.doesNotMatch(analyticsHtml, /data-analytics-asset="IMG-/);
  assert.match(partnerHtml, /IMG-/);
  assert.doesNotMatch(partnerHtml, /<strong>VID-/);
});

test("every visible dropdown offers at least two meaningful choices", () => {
  const routes = ["image", "video", "tasks", "library", "knowledge", "analytics", "accounts", "partner-assets"];
  const baseState = {
    role: "employee",
    generationMode: "native",
    knowledgeType: "common",
    knowledgeCategory: 0,
    accountTab: "accounts",
    assetType: "全部",
    taskType: "全部任务类型",
    selectedAssets: new Set()
  };

  for (const route of routes) {
    const counts = selectOptionCounts(renderRoute({ ...baseState, route }));
    assert.ok(counts.every((count) => count >= 2), `${route} contains a dropdown with only one option: ${counts.join(",")}`);
  }
});
