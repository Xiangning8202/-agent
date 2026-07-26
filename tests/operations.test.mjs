import test from "node:test";
import assert from "node:assert/strict";
import { renderAudits, renderLibrary, renderTasks } from "../src/operations.mjs";

test("task page separates generation and audit status and supports partial recovery", () => {
  const html = renderTasks();
  assert.match(html, /部分完成/);
  assert.match(html, /任务进度/);
  assert.match(html, /状态说明/);
});

test("audit page is read-only and counts total 24 consistently", () => {
  const html = renderAudits();
  assert.match(html, /审核管理/);
  assert.match(html, /生成数量<\/dt><dd>24项/);
  assert.doesNotMatch(html, />审核通过<\/button>/);
  assert.doesNotMatch(html, />驳回<\/button>/);
  assert.match(html, /按原因修改方案/);
});

test("library includes approved status model, authorization and trace data", () => {
  const html = renderLibrary({});
  for (const text of ["已入库待投放", "已导出待投放", "投放中", "表现优良", "批量导出"]) assert.match(html, new RegExp(text));
});
