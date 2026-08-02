import test from "node:test";
import assert from "node:assert/strict";
import { renderAccounts, renderAnalytics, renderKnowledge, renderPartnerAssets } from "../src/backoffice.mjs";
import * as backoffice from "../src/backoffice.mjs";

test("knowledge page includes required public fields and optional far-future expiry", () => {
  const html = renderKnowledge({ knowledgeType: "common" });
  for (const text of ["创建人", "创建时间", "失效时间", "版本", "授权范围", "2099-12-31"]) assert.match(html, new RegExp(text));
});

test("analytics includes date and U1 U2 U3 single asset dimensions", () => {
  const html = renderAnalytics();
  for (const text of ["日期", "U1/U2/U3", "采用率", "跑出率", "审核通过率", "首次采用耗时"]) assert.match(html, new RegExp(text));
  assert.match(html, /不做单一创意因子归因/);
});

test("analytics trend renders switchable metrics with exact values for the selected range", () => {
  const html = renderAnalytics({ analyticsMetric: "ctr", analyticsRange: "近7天" });

  for (const metric of ["adoption", "runout", "ctr", "cpa"]) {
    assert.match(html, new RegExp(`data-analytics-metric="${metric}"`));
  }
  assert.match(html, /data-analytics-metric="ctr" class="analytics-metric-tab active"/);
  assert.equal([...html.matchAll(/data-chart-point=/g)].length, 7);
  assert.match(html, /07-18 · 3\.58%/);
  assert.match(html, /data-chart-value="3\.58%"/);
});

test("analytics filters apply channel and media selections to visible rows", () => {
  const html = renderAnalytics({
    analyticsType: "图片",
    analyticsChannel: "信息流",
    analyticsMedia: "抖音",
    analyticsRange: "近7天"
  });

  assert.match(html, /data-analytics-row="IMG-001"/);
  assert.match(html, /data-analytics-row="IMG-005"/);
  assert.doesNotMatch(html, /data-analytics-row="IMG-002"/);
  assert.match(html, /data-analytics-filter="channel"/);
  assert.match(html, /data-analytics-filter="media"/);
  assert.match(html, /data-analytics-filter="range"/);
});

test("analytics range changes preserve pending channel and media selections", () => {
  assert.equal(typeof backoffice.buildAnalyticsFilterPatch, "function");
  assert.deepEqual(backoffice.buildAnalyticsFilterPatch({
    channel: "信息流",
    media: "抖音",
    range: "近7天",
    start: "2025-07-12",
    end: "2025-07-18"
  }), {
    analyticsChannel: "信息流",
    analyticsMedia: "抖音",
    analyticsRange: "近7天",
    analyticsStart: "2025-07-12",
    analyticsEnd: "2025-07-18"
  });
});

test("analytics export produces a real filtered CSV with metric values", () => {
  assert.equal(typeof backoffice.buildAnalyticsCsv, "function");
  const csv = backoffice.buildAnalyticsCsv({ analyticsType: "视频", analyticsChannel: "信息流" });

  assert.match(csv, /素材ID,类型,渠道,媒体,消耗,曝光,点击,CTR,CPA/);
  assert.match(csv, /VID-001,视频,信息流,抖音/);
  assert.doesNotMatch(csv, /IMG-001/);
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
