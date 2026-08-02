import { accounts, assets, knowledgeRows } from "./data.mjs";
import { badge, imageUrl, metric, pageHeader } from "./ui.mjs";
import { getState, setState } from "./state.mjs";

const statusTone = (status) => status === "有效" || status === "正常" ? "green" : status.includes("冻结") || status.includes("失效") ? "red" : "orange";

export function renderKnowledge(state) {
  const categories = {
    common: ["频道库", "商品库", "品牌资产库", "风提库", "标签/文案库"],
    image: ["字体库", "图片风格库", "图片模板库", "Logo布局库", "背景/主体/构图库"],
    video: ["数字人库", "字幕模板库", "音色库", "BGM库", "转场库", "首帧/尾帧", "CTA组件", "视频结构/分镜"]
  };
  const knowledgeType = state.knowledgeType || "common";
  const selectedCategory = Number(state.knowledgeCategory || 0);
  const categoryIndexes = {
    common: [0, 1, 2, 4],
    image: [1, 0, 3, 4],
    video: [0, 7, 1, 3]
  };
  const sourceRows = knowledgeRows[knowledgeType] || knowledgeRows.common;
  const rows = sourceRows
    .map((row, sourceIndex) => ({ row, sourceIndex }))
    .filter((_, index) => categoryIndexes[knowledgeType][index] === selectedCategory);
  return `${pageHeader("知识库", "维护 Agent 可调用的公共、图片与视频知识资产，支持版本、权限与有效期", '<button class="button button-primary" data-action="new-knowledge">新增资产</button>')}
  <div class="knowledge-tabs">${[["common","公共知识"],["image","图片知识"],["video","视频知识"]].map(([key,label]) => `<button data-knowledge="${key}" class="${knowledgeType === key ? "active" : ""}">${label}</button>`).join("")}</div>
  <section class="data-panel">
    <div class="subnav">${categories[knowledgeType].map((item, index) => `<button data-knowledge-category="${index}" class="${index === selectedCategory ? "active" : ""}">${item}</button>`).join("")}</div>
    <div class="toolbar"><input placeholder="资产名称 / 标签 / 资产ID"><select><option>全部适用媒体</option><option>抖音</option><option>快手</option><option>腾讯广告</option><option>百度</option></select><select><option>全部授权状态</option><option>全公司</option><option>指定部门</option><option>未授权</option></select><select><option>全部资产状态</option><option>有效</option><option>即将失效</option><option>已失效</option></select><button class="button button-outline" data-action="import-knowledge">导入</button><button class="button button-outline" data-action="export-knowledge">导出</button></div>
    <table class="data-table"><thead><tr><th>资产名称</th><th>资产ID</th><th>资产类型</th><th>授权范围</th><th>版本</th><th>创建人</th><th>创建时间</th><th>失效时间</th><th>状态</th><th>操作</th></tr></thead><tbody>
      ${rows.length ? rows.map(({ row, sourceIndex }) => `<tr data-knowledge-row="${sourceIndex}"><td><div class="asset-name-cell"><img src="${imageUrl(`knowledge-${row[1]}`, 120, 76)}" alt=""><strong>${row[0]}</strong></div></td><td>${row[1]}</td><td>${row[2]}</td><td>${row[3]}</td><td>${row[4]}</td><td>张小野</td><td>2025-06-01</td><td>${row[5] === "即将失效" ? "2025-07-31" : "2099-12-31"}</td><td>${badge(row[5], statusTone(row[5]))}</td><td><button class="link-button" data-action="edit-knowledge">编辑</button></td></tr>`).join("") : '<tr><td colspan="10" class="table-empty">该分类暂无知识资产</td></tr>'}
    </tbody></table>
  </section><div id="overlay-root"></div>`;
}

function knowledgeDrawer() {
  return `<div class="drawer-backdrop"><aside class="drawer" role="dialog" aria-modal="true"><div class="drawer-head"><div><h2>编辑知识资产</h2><p>修改后资产 ID 不变，版本自动递增</p></div><button class="close-button" data-close>×</button></div><div class="drawer-body form-stack">
    <label>资产名称<input value="清透数码蓝"></label><label>资产标签<input value="科技感、数码、蓝色"></label><label>授权范围<select><option>全公司</option><option>品牌市场部</option></select></label><label>当前版本<input value="v2.1" readonly></label><label>失效时间<input type="date" placeholder="不填默认 2099-12-31"></label><label>参考图<div class="upload-box">点击上传参考图</div></label>
    <div class="note-box">已冻结任务继续使用知识资产快照；资产失效后不再被新任务召回。</div>
    </div><div class="drawer-foot"><button class="button button-outline" data-action="copy-knowledge">复制资产</button><button class="button button-primary" data-action="save-knowledge">保存修改并升版</button></div></aside></div>`;
}

const ANALYTICS_DATES = ["07-05", "07-06", "07-07", "07-08", "07-09", "07-10", "07-11", "07-12", "07-13", "07-14", "07-15", "07-16", "07-17", "07-18"];
const ANALYTICS_SERIES = {
  adoption: { label: "采用率", color: "#1768ff", values: [32.4, 34.1, 33.8, 35.2, 36.7, 35.9, 37.1, 36.5, 38.2, 37.8, 39.1, 38.6, 40.2, 41.4], format: (value) => `${value.toFixed(1)}%` },
  runout: { label: "跑出率", color: "#11a87b", values: [8.6, 9.1, 9.4, 9.8, 10.1, 10.4, 10.8, 10.6, 11.1, 11.5, 11.8, 12.1, 12.5, 12.8], format: (value) => `${value.toFixed(1)}%` },
  ctr: { label: "CTR", color: "#7a5af8", values: [2.86, 2.94, 3.02, 3.11, 3.08, 3.19, 3.24, 3.18, 3.31, 3.36, 3.42, 3.51, 3.47, 3.58], format: (value) => `${value.toFixed(2)}%` },
  cpa: { label: "总CPA", color: "#f59e0b", values: [49.8, 48.6, 48.1, 47.4, 46.8, 46.2, 45.7, 45.1, 44.8, 44.2, 43.9, 43.4, 42.9, 42.6], format: (value) => `¥${value.toFixed(1)}` }
};

const splitMetric = (total) => {
  const first = Math.round(total * .39);
  const second = Math.round(total * .34);
  return [first, second, total - first - second];
};

function analyticsAssetRows(state = {}) {
  const type = state.analyticsType || state.assetType || "全部";
  const channel = state.analyticsChannel || "全部渠道";
  const media = state.analyticsMedia || "全部媒体";
  return assets.map((asset, index) => {
    const spend = Number(String(asset.spend).replace(/[^0-9.]/g, "")) || 10000 + index * 700;
    const ctr = Number(String(asset.ctr).replace(/[^0-9.]/g, "")) || 3;
    const impressions = 318000 + index * 27400;
    const clicks = Math.round(impressions * ctr / 100);
    return { asset, date: ANALYTICS_DATES[Math.max(0, ANALYTICS_DATES.length - 1 - index)], spend, spendParts: splitMetric(spend), impressions, impressionParts: splitMetric(impressions), clicks };
  }).filter(({ asset }) => (type === "全部" || asset.type === type) && (channel === "全部渠道" || asset.channel === channel) && (media === "全部媒体" || asset.media === media));
}

const formatInteger = (value) => Math.round(value).toLocaleString("en-US");
const selectOptions = (values, selected) => values.map((value) => `<option ${value === selected ? "selected" : ""}>${value}</option>`).join("");

function bars(metricKey, range) {
  const series = ANALYTICS_SERIES[metricKey] || ANALYTICS_SERIES.adoption;
  const count = range === "近7天" ? 7 : ANALYTICS_DATES.length;
  const dates = ANALYTICS_DATES.slice(-count);
  const values = series.values.slice(-count);
  const max = Math.max(...values);
  return `<div class="bar-chart" aria-label="${series.label}趋势">${values.map((value, index) => {
    const formatted = series.format(value);
    const height = Math.max(18, Math.round(value / max * 78));
    return `<div data-chart-point="${dates[index]}" aria-label="${dates[index]} · ${formatted}"><b data-chart-value="${formatted}">${formatted}</b><span title="${dates[index]} · ${formatted}" style="height:${height}%;--bar:${series.color}"></span><small>${dates[index]}</small></div>`;
  }).join("")}</div>`;
}

export function buildAnalyticsCsv(state = {}) {
  const header = ["素材ID", "类型", "渠道", "媒体", "消耗", "曝光", "点击", "CTR", "CPA"];
  const rows = analyticsAssetRows(state).map(({ asset, spend, impressions, clicks }) => [asset.id, asset.type, asset.channel, asset.media, Math.round(spend), impressions, clicks, asset.ctr, asset.cpa]);
  const escapeCsv = (value) => /[",\n]/.test(String(value)) ? `"${String(value).replaceAll('"', '""')}"` : String(value);
  return `\ufeff${[header, ...rows].map((row) => row.map(escapeCsv).join(",")).join("\n")}`;
}

export function buildAnalyticsFilterPatch({ channel, media, range, start, end } = {}) {
  return {
    analyticsChannel: channel || "全部渠道",
    analyticsMedia: media || "全部媒体",
    analyticsRange: range || "近30天",
    analyticsStart: start || "2025-07-05",
    analyticsEnd: end || "2025-07-18"
  };
}

export function renderAnalytics(state = {}) {
  const selectedType = state.analyticsType || state.assetType || "全部";
  const selectedChannel = state.analyticsChannel || "全部渠道";
  const selectedMedia = state.analyticsMedia || "全部媒体";
  const selectedRange = state.analyticsRange || "近30天";
  const selectedMetric = state.analyticsMetric || "adoption";
  const rows = analyticsAssetRows({ ...state, analyticsType: selectedType }).slice(0, 8);
  return `${pageHeader("素材数据", "观察素材生产效率与投放表现，数据按日更新，不做单一创意因子归因", '<span class="updated">数据更新至 2025-07-18 10:00</span>')}
  <div class="toolbar floating">${["全部","图片","视频"].map((type) => `<button class="filter-chip ${selectedType === type ? "active" : ""}" data-analytics-type="${type}">${type}</button>`).join("")}<select data-analytics-filter="channel" aria-label="数据渠道">${selectOptions(["全部渠道", "信息流", "DSP", "种草", "厂商"], selectedChannel)}</select><select data-analytics-filter="media" aria-label="数据媒体">${selectOptions(["全部媒体", "抖音", "快手", "腾讯广告", "巨量引擎", "百度"], selectedMedia)}</select><select data-analytics-filter="range" aria-label="数据日期范围">${selectOptions(["近30天", "近7天", "自定义"], selectedRange)}</select>${selectedRange === "自定义" ? `<input type="date" aria-label="开始日期" data-analytics-filter="start" value="${state.analyticsStart || "2025-07-05"}"><input type="date" aria-label="结束日期" data-analytics-filter="end" value="${state.analyticsEnd || "2025-07-18"}">` : ""}<button class="button button-primary" data-action="analytics-query">查询</button><button class="button button-outline" data-action="analytics-reset">重置</button></div>
  <div class="metric-grid six">${metric("采用率", "38.6%", "较前30天 +4.2%", "red")}${metric("跑出率", "12.8%", "较前30天 +1.3%", "red")}${metric("点击率", "3.42%", "较前30天 +0.28%", "red")}${metric("总CPA", "¥42.6", "较前30天 -8.6%", "green")}${metric("审核通过率", "87.4%", "较前30天 +2.1%", "red")}${metric("首次采用耗时", "1.8天", "较前30天 -0.3天", "green")}</div>
  <div class="analytics-grid"><section class="chart-panel"><div class="section-title"><div><strong>核心指标趋势</strong><small>${selectedRange} · 每日回流值</small></div><div class="analytics-metric-tabs">${Object.entries(ANALYTICS_SERIES).map(([key, series]) => `<button data-analytics-metric="${key}" class="analytics-metric-tab ${selectedMetric === key ? "active" : ""}">${series.label}</button>`).join("")}</div></div>${bars(selectedMetric, selectedRange)}</section>
    <section class="comparison-panel"><h3>图片 / 视频效果对比</h3><div class="compare-row"><span class="type-icon">图</span><strong>图片</strong><div><small>采用率</small><b>41.2%</b></div><div><small>跑出率</small><b>13.6%</b></div><div><small>样本量</small><b>842张</b></div>${badge("样本充足","green")}</div><div class="compare-row"><span class="type-icon">视</span><strong>视频</strong><div><small>采用率</small><b>32.9%</b></div><div><small>跑出率</small><b>10.4%</b></div><div><small>样本量</small><b>383条</b></div>${badge("样本充足","green")}</div></section></div>
  <section class="data-panel analytics-table"><div class="section-title"><strong>单素材数据</strong><button class="button button-outline" data-action="export-analytics">导出</button></div><table class="data-table"><thead><tr><th>日期</th><th>素材预览</th><th>素材ID</th><th>类型</th><th>渠道/媒体</th><th>消耗（总/U1/U2/U3）</th><th>曝光（总/U1/U2/U3）</th><th>点击</th><th>CTR</th><th>U总CPA</th><th>采用状态</th><th>跑出状态</th><th>样本状态</th></tr></thead><tbody>
  ${rows.length ? rows.map(({ asset, date, spend, spendParts, impressions, impressionParts, clicks }) => `<tr data-analytics-row="${asset.id}" data-channel="${asset.channel}" data-media="${asset.media}"><td>${date}</td><td><img class="tiny-thumb" src="${imageUrl(asset.source || asset.seed, 100, 64)}" alt="${asset.title}"></td><td><button class="row-link" data-action="analytics-detail" data-analytics-asset="${asset.id}">${asset.id}</button></td><td>${asset.type}</td><td>${asset.channel}/${asset.media}</td><td>${[spend, ...spendParts].map(formatInteger).join(" / ")}</td><td>${[impressions, ...impressionParts].map(formatInteger).join(" / ")}</td><td>${formatInteger(clicks)}</td><td>${asset.ctr}</td><td>${asset.cpa}</td><td>${badge("已采用","green")}</td><td>${badge("已跑出","green")}</td><td>${badge("样本充足","blue")}</td></tr>`).join("") : '<tr><td colspan="13" class="table-empty">暂无匹配素材数据</td></tr>'}</tbody></table></section><div id="overlay-root"></div>`;
}

const accountApplications = [
  ["周若琳 / 009124", "品牌市场部", "图片与视频素材生成", "07-18 09:18"],
  ["郭嘉诚 / 009076", "内容运营部", "图片素材生成", "07-17 16:42"]
];

function accountPanel(tab) {
  if (tab === "applications") {
    return `<section class="data-panel"><table class="data-table"><thead><tr><th>申请人 / 工号</th><th>申请组织</th><th>申请权限</th><th>申请时间</th><th>操作</th></tr></thead><tbody>${accountApplications.map((row) => `<tr><td><strong>${row[0]}</strong></td><td>${row[1]}</td><td>${row[2]}</td><td>${row[3]}</td><td><button class="link-button" data-action="approve-account">通过申请</button><button class="link-button danger" data-action="reject-account">驳回</button></td></tr>`).join("")}</tbody></table></section>`;
  }
  const shownAccounts = tab === "partners" ? accounts.filter((row) => row[1] === "代理商") : accounts;
  if (tab === "downloads") {
    return `<section class="data-panel"><table class="data-table"><thead><tr><th>下载时间</th><th>代理商</th><th>素材ID</th><th>素材名称</th><th>类型</th><th>媒体</th></tr></thead><tbody>${assets.slice(0,5).map((asset,index) => `<tr><td>2025-07-${18-index} 14:${32-index*3}</td><td>华东渠道合作商</td><td>${asset.id}</td><td>${asset.title}</td><td>${asset.type}</td><td>${asset.media}</td></tr>`).join("")}</tbody></table></section>`;
  }
  return `<section class="data-panel"><div class="toolbar"><input placeholder="姓名 / 工号 / 账号"><select><option>全部身份</option><option>管理员</option><option>正式员工</option><option>代理商</option></select><select><option>全部组织</option><option>增长运营中心</option><option>内容运营部</option><option>设计创意部</option><option>品牌市场部</option><option>渠道合作商</option></select><select><option>全部状态</option><option>正常</option><option>待审批</option><option>已冻结</option></select><button class="button button-primary" data-action="account-query">查询</button></div>
  <table class="data-table"><thead><tr><th>姓名 / 工号</th><th>身份</th><th>组织</th><th>账号状态</th><th>最近登录</th><th>日志记录</th><th>操作</th></tr></thead><tbody>${shownAccounts.map((row) => `<tr><td><strong>${row[0]}</strong></td><td>${badge(row[1], row[1] === "管理员" ? "blue" : row[1] === "代理商" ? "orange" : "green")}</td><td>${row[2]}</td><td>${badge(row[3], statusTone(row[3]))}</td><td>${row[4]}</td><td><button class="link-button" data-action="account-log" data-account-name="${row[0]}">查看日志</button></td><td><button class="link-button" data-action="edit-account" data-account-name="${row[0]}">编辑</button></td></tr>`).join("")}</tbody></table></section>`;
}

export function renderAccounts(state = {}) {
  const activeTab = state.accountTab || "accounts";
  const tabs = [["accounts","账号列表"],["applications","员工申请 <span>6</span>"],["partners","代理商账号"],["downloads","代理商下载记录"]];
  return `${pageHeader("账号管理", "管理员工权限、正式员工申请、代理商账号与素材下载记录", '<button class="button button-primary" data-action="new-partner">创建代理商账号</button>')}
  ${activeTab === "accounts" ? `<section class="profile-card"><div class="profile-main"><span class="avatar large">张</span><div><h2>张小野 ${badge("管理员","blue")}</h2><p>工号 008631 · 增长运营中心</p></div></div><div>${badge("最近登录 2025-07-18 09:32","green")}</div></section>` : ""}
  <div class="account-tabs">${tabs.map(([key,label]) => `<button data-account-tab="${key}" class="${activeTab === key ? "active" : ""}">${label}</button>`).join("")}</div>
  ${accountPanel(activeTab)}<div id="overlay-root"></div>`;
}

function partnerDrawer() {
  return `<div class="drawer-backdrop"><aside class="drawer" role="dialog" aria-modal="true"><div class="drawer-head"><div><h2>创建代理商账号</h2><p>代理商仅可查看和下载被授权素材</p></div><button class="close-button" data-close>×</button></div><div class="drawer-body form-stack"><label>渠道<select><option>信息流</option><option>DSP</option><option>种草</option><option>厂商</option></select></label><label>媒体<select><option>抖音</option><option>快手</option><option>腾讯广告</option><option>巨量引擎</option><option>百度</option></select></label><label>代理商公司名称<input placeholder="请输入公司名称"></label><label>代理商姓名<input placeholder="请输入姓名"></label><label>手机号<input placeholder="请输入手机号"></label><label>登录账号<input value="partner_hd_001"></label><label>初始密码<input value="G7m!4pKq9@#2"></label><label>备注<textarea placeholder="请输入备注"></textarea></label><div class="note-box">密码查看和修改行为将记录日志。</div></div><div class="drawer-foot"><button class="button button-outline" data-close>取消</button><button class="button button-primary" data-action="save-partner">创建账号</button></div></aside></div>`;
}

function analyticsDrawer(asset) {
  return `<div class="drawer-backdrop"><aside class="drawer wide" role="dialog" aria-modal="true"><div class="drawer-head"><div><h2>${asset.title}</h2><p>${asset.id} · 近 7 日投放明细</p></div><button class="close-button" data-close>×</button></div><div class="drawer-body"><img class="drawer-preview" src="${imageUrl(asset.source || asset.seed)}" alt="${asset.title}"><h3>核心指标</h3><div class="mini-metrics"><div><span>CTR</span><b>${asset.ctr}</b></div><div><span>消耗</span><b>${asset.spend}</b></div><div><span>CPA</span><b>${asset.cpa}</b></div></div><h3>数据口径</h3><dl class="detail-list"><dt>采用状态</dt><dd>${badge("已采用", "green")}</dd><dt>跑出状态</dt><dd>${badge("已跑出", "green")}</dd><dt>样本状态</dt><dd>${badge("样本充足", "blue")}</dd><dt>最近回流</dt><dd>2025-07-18 10:00</dd></dl></div><div class="drawer-foot"><button class="button button-primary" data-close>关闭</button></div></aside></div>`;
}

function accountDrawer(row, mode) {
  const isLog = mode === "log";
  return `<div class="drawer-backdrop"><aside class="drawer" role="dialog" aria-modal="true"><div class="drawer-head"><div><h2>${isLog ? "账号操作日志" : "编辑账号"}</h2><p>${row[0]}</p></div><button class="close-button" data-close>×</button></div><div class="drawer-body">${isLog ? `<div class="version-chain"><div class="active"><b>登录成功</b><span>2025-07-18 09:32 · 企业身份认证</span></div><div><b>导出素材</b><span>2025-07-17 16:21 · IMG-001</span></div><div><b>更新知识资产</b><span>2025-07-16 11:08 · 版本 v2.1</span></div></div>` : `<div class="form-stack"><label>姓名 / 工号<input value="${row[0]}"></label><label>身份<select><option ${row[1] === "管理员" ? "selected" : ""}>管理员</option><option ${row[1] === "正式员工" ? "selected" : ""}>正式员工</option><option ${row[1] === "代理商" ? "selected" : ""}>代理商</option></select></label><label>组织<input value="${row[2]}"></label><label>账号状态<select><option ${row[3] === "正常" ? "selected" : ""}>正常</option><option ${row[3] === "已冻结" ? "selected" : ""}>已冻结</option></select></label><div class="note-box">身份、组织和冻结操作将写入账号日志。</div></div>`}</div><div class="drawer-foot"><button class="button button-outline" data-close>取消</button>${isLog ? "" : '<button class="button button-primary" data-action="save-account">保存账号</button>'}</div></aside></div>`;
}

export function renderPartnerAssets(state = {}) {
  const selectedType = state.assetType || "全部";
  const visibleAssets = assets.filter((asset) => selectedType === "全部" || asset.type === selectedType).slice(0, 4);
  return `${pageHeader("授权素材", "仅展示当前账号仍在授权有效期内的素材")}
  <div class="partner-summary"><div><span>当前账号</span><strong>华东渠道合作商 · 赵一鸣</strong></div><div><span>可下载素材</span><strong>24 项</strong></div><div><span>最近授权</span><strong>2025-07-18 10:20</strong></div></div>
  <section class="library-panel"><div class="toolbar"><input placeholder="素材ID / 商品名称">${["全部","图片","视频"].map((type) => `<button class="filter-chip ${selectedType === type ? "active" : ""}" data-partner-type="${type}">${type}</button>`).join("")}<select><option>全部媒体</option><option>抖音</option><option>快手</option><option>腾讯广告</option><option>巨量引擎</option><option>百度</option></select></div><div class="asset-grid">${visibleAssets.length ? visibleAssets.map((asset) => `<article class="asset-card"><div class="asset-image"><img src="${imageUrl(asset.source || asset.seed,620,390)}" alt="${asset.title}"><span>${asset.type}</span></div><div class="asset-info"><strong>${asset.id}</strong><h3>${asset.title}</h3><p>授权有效期至 2026-12-31</p><button class="button button-primary partner-download">下载素材</button></div></article>`).join("") : '<p class="table-empty">暂无匹配授权素材</p>'}</div></section>`;
}

export function renderPartnerDownloads() {
  return `${pageHeader("下载记录", "查看当前账号的历史素材下载记录")}<section class="data-panel"><table class="data-table"><thead><tr><th>下载时间</th><th>素材ID</th><th>素材名称</th><th>类型</th><th>媒体</th><th>下载方式</th></tr></thead><tbody>${assets.slice(0,5).map((asset,index) => `<tr><td>2025-07-${18-index} 14:${32-index*3}</td><td>${asset.id}</td><td>${asset.title}</td><td>${asset.type}</td><td>${asset.media}</td><td>单素材下载</td></tr>`).join("")}</tbody></table></section>`;
}

function downloadAnalyticsCsv() {
  const url = URL.createObjectURL(new Blob([buildAnalyticsCsv(getState())], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = "素材数据回流.csv";
  link.click();
  URL.revokeObjectURL(url);
}

function analyticsFilterPatchFromDom() {
  return buildAnalyticsFilterPatch({
    channel: document.querySelector('[data-analytics-filter="channel"]')?.value,
    media: document.querySelector('[data-analytics-filter="media"]')?.value,
    range: document.querySelector('[data-analytics-filter="range"]')?.value,
    start: document.querySelector('[data-analytics-filter="start"]')?.value,
    end: document.querySelector('[data-analytics-filter="end"]')?.value
  });
}

export function bindBackoffice(route) {
  document.querySelectorAll("[data-knowledge]").forEach((button) => button.addEventListener("click", () => setState({ knowledgeType: button.dataset.knowledge, knowledgeCategory: 0 })));
  document.querySelectorAll("[data-knowledge-category]").forEach((button) => button.addEventListener("click", () => setState({ knowledgeCategory: Number(button.dataset.knowledgeCategory) })));
  document.querySelectorAll("[data-analytics-type]").forEach((button) => button.addEventListener("click", () => setState({ analyticsType: button.dataset.analyticsType })));
  document.querySelectorAll("[data-partner-type]").forEach((button) => button.addEventListener("click", () => setState({ assetType: button.dataset.partnerType })));
  document.querySelectorAll("[data-analytics-metric]").forEach((button) => button.addEventListener("click", () => setState({ analyticsMetric: button.dataset.analyticsMetric })));
  document.querySelector('[data-analytics-filter="range"]')?.addEventListener("change", () => setState(analyticsFilterPatchFromDom()));
  document.querySelector('[data-action="analytics-query"]')?.addEventListener("click", () => setState({ ...analyticsFilterPatchFromDom(), toast: "数据筛选条件已应用" }));
  document.querySelector('[data-action="analytics-reset"]')?.addEventListener("click", () => setState({ analyticsType: "全部", analyticsChannel: "全部渠道", analyticsMedia: "全部媒体", analyticsRange: "近30天", analyticsMetric: "adoption", toast: "数据筛选已重置" }));
  document.querySelector('[data-action="export-analytics"]')?.addEventListener("click", () => { downloadAnalyticsCsv(); setState({ toast: "素材数据 CSV 已导出" }); });
  document.querySelectorAll("[data-account-tab]").forEach((button) => button.addEventListener("click", () => setState({ accountTab: button.dataset.accountTab })));
  document.querySelectorAll('[data-action="edit-knowledge"], [data-action="new-knowledge"]').forEach((button) => button.addEventListener("click", () => { document.querySelector("#overlay-root").innerHTML = knowledgeDrawer(); bindDrawer(); }));
  document.querySelector('[data-action="new-partner"]')?.addEventListener("click", () => { document.querySelector("#overlay-root").innerHTML = partnerDrawer(); bindDrawer(); });
  document.querySelectorAll('[data-action="analytics-detail"]').forEach((button) => button.addEventListener("click", () => {
    const asset = assets.find((item) => item.id === button.dataset.analyticsAsset) || assets[0];
    document.querySelector("#overlay-root").innerHTML = analyticsDrawer(asset);
    bindDrawer();
  }));
  document.querySelectorAll('[data-action="account-log"], [data-action="edit-account"]').forEach((button) => button.addEventListener("click", () => {
    const row = accounts.find((item) => item[0] === button.dataset.accountName) || accounts[0];
    document.querySelector("#overlay-root").innerHTML = accountDrawer(row, button.dataset.action === "account-log" ? "log" : "edit");
    bindDrawer();
  }));
  document.querySelectorAll(".partner-download").forEach((button) => button.addEventListener("click", () => setState({ toast: "素材下载成功，下载记录已同步" })));
  const actionMessages = {
    "import-knowledge": "已打开知识资产导入流程",
    "export-knowledge": "知识资产清单已导出",
    "account-query": "账号筛选条件已应用",
    "approve-account": "员工申请已通过",
    "reject-account": "员工申请已驳回"
  };
  Object.entries(actionMessages).forEach(([action, message]) => {
    document.querySelectorAll(`[data-action="${action}"]`).forEach((button) => button.addEventListener("click", () => setState({ toast: message })));
  });
}

function bindDrawer() {
  document.querySelectorAll("[data-close]").forEach((button) => button.addEventListener("click", () => { document.querySelector("#overlay-root").innerHTML = ""; }));
  document.querySelector('[data-action="save-knowledge"]')?.addEventListener("click", () => setState({ toast: "知识资产已保存为新版本 v2.2" }));
  document.querySelector('[data-action="save-partner"]')?.addEventListener("click", () => setState({ toast: "代理商账号已创建" }));
  document.querySelector('[data-action="copy-knowledge"]')?.addEventListener("click", () => setState({ toast: "知识资产副本已创建" }));
  document.querySelector('[data-action="save-account"]')?.addEventListener("click", () => setState({ toast: "账号信息已保存并写入操作日志" }));
}
