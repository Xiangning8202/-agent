import test from "node:test";
import assert from "node:assert/strict";
import { renderAccounts, renderAnalytics, renderKnowledge, renderPartnerAssets } from "../src/backoffice.mjs";

test("knowledge page includes required public fields and optional far-future expiry", () => {
  const html = renderKnowledge({ knowledgeType: "common" });
  for (const text of ["创建人", "创建时间", "失效时间", "版本", "授权范围", "2099-12-31"]) assert.match(html, new RegExp(text));
});

test("analytics includes date and U1 U2 U3 single asset dimensions", () => {
  const html = renderAnalytics();
  for (const text of ["日期", "U1/U2/U3", "采用率", "跑出率", "审核通过率", "首次采用耗时"]) assert.match(html, new RegExp(text));
  assert.match(html, /不做单一创意因子归因/);
});

test("account page includes employee applications and partner records", () => {
  const html = renderAccounts();
  assert.match(html, /员工申请/);
  assert.match(html, /代理商账号/);
  assert.match(html, /代理商下载记录/);
});

test("partner page only presents authorized materials", () => {
  const html = renderPartnerAssets();
  assert.match(html, /仅展示当前账号仍在授权有效期内的素材/);
  assert.doesNotMatch(html, /账号管理/);
});
