import test from "node:test";
import assert from "node:assert/strict";
import { renderAudits, renderLibrary, renderTasks } from "../src/operations.mjs";
import { assets, navItems } from "../src/data.mjs";

test("task page separates generation and audit status and supports partial recovery", () => {
  const html = renderTasks();
  assert.match(html, /部分完成/);
  assert.match(html, /任务进度/);
  assert.match(html, /状态说明/);
  assert.match(html, /data-task-audit=/);
  assert.equal(navItems.some(([route]) => route === "audits"), false);
});

test("audit detail is a task-scoped secondary page with consistent counts", () => {
  const html = renderAudits({ auditTaskId: "TASK-20250715-0003" });
  assert.match(html, /任务进度<\/button><span>\/<\/span><strong>审核详情/);
  assert.match(html, /已提交审核<\/dt><dd>14项/);
  assert.doesNotMatch(html, />审核通过<\/button>/);
  assert.doesNotMatch(html, />驳回<\/button>/);
  assert.match(html, /按原因修改方案/);
});

test("library includes approved status model, authorization and trace data", () => {
  const html = renderLibrary({});
  for (const text of ["已入库待投放", "已导出待投放", "投放中", "表现优良", "批量导出"]) assert.match(html, new RegExp(text));
  assert.match(html, /\.\/src\/assets\/eval-images\/IMG-001\.png/);
  assert.ok(assets.filter((asset) => asset.source?.includes("eval-images")).length >= 12);
});
