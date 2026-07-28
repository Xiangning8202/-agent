import { assets, tasks } from "./data.mjs";
import { badge, imageUrl, metric, pageHeader, progress } from "./ui.mjs";
import { setState } from "./state.mjs";

const toneFor = (status) => status.includes("失败") || status.includes("驳回") ? "red" : status.includes("完成") || status.includes("通过") || status.includes("投放") || status.includes("优良") ? "green" : status.includes("审核") || status.includes("部分") ? "orange" : "blue";

export function renderTasks(state = {}) {
  const selectedType = state.taskType || "全部任务类型";
  const visibleTasks = tasks.map((task, index) => ({ task, index })).filter(({ task }) => selectedType === "全部任务类型" || task.kind === selectedType);
  return `${pageHeader("任务进度", "查看预览任务与批量生成任务的实时状态和异常原因")}
  <div class="metric-grid four">${metric("进行中", "6")}${metric("排队中", "3")}${metric("今日完成", "28")}${metric("失败", "2")}</div>
  <section class="data-panel">
    <div class="toolbar"><input placeholder="搜索任务名称或任务ID" aria-label="搜索任务"><select data-filter="taskType">${["全部任务类型", "预览生成", "批量生成"].map((item) => `<option ${item === selectedType ? "selected" : ""}>${item}</option>`).join("")}</select><select><option>全部素材类型</option><option>图片</option><option>短视频</option></select><select><option>全部状态</option><option>生成中</option><option>待审核</option><option>部分完成</option><option>生成完成</option><option>生成失败</option></select><button class="button button-primary" data-action="query-tasks">查询</button></div>
    <table class="data-table"><thead><tr><th>任务名称</th><th>任务ID</th><th>任务类型</th><th>素材类型</th><th>发起人</th><th>发起时间</th><th>生成数量</th><th>当前进度</th><th>状态说明</th></tr></thead>
      <tbody>${visibleTasks.map(({ task, index }) => `<tr data-task="${index}"><td><button class="row-link">${task.name}</button></td><td>${task.id}</td><td>${task.kind}</td><td>${task.type}</td><td>${task.owner}</td><td>${task.created}</td><td>${task.count}</td><td><div class="progress-cell">${progress(task.progress)}<span>${task.progress}%</span></div></td><td>${badge(task.status, toneFor(task.status))}</td></tr>`).join("") || `<tr><td colspan="9"><div class="table-empty">没有符合条件的任务</div></td></tr>`}</tbody>
    </table>
    <div class="pagination">共 23 条 ${[1,2,3].map((page) => `<button data-task-page="${page}" class="${Number(state.taskPage || 1) === page ? "active" : ""}">${page}</button>`).join("")}</div>
  </section><div id="overlay-root"></div>`;
}

const taskTabLabels = { overview: "任务概况", generation: "生成明细", audit: "审核明细", trace: "追溯信息" };

function taskDrawerBody(task, tab) {
  if (tab === "generation") return `<h3>生成明细</h3><div class="mini-metrics"><div><span>成功素材</span><b>${task.progress === 100 ? task.count.split(" / ")[1] : task.count.split(" / ")[0]}</b></div><div><span>失败素材</span><b>${task.status.includes("失败") ? "12" : task.status.includes("部分") ? "6" : "0"}</b></div><div><span>生成进度</span><b>${task.progress}%</b></div></div><div class="detail-card"><strong>成功素材继续流转</strong><p>失败素材可单独重试，不影响已成功素材进入审核。</p></div>`;
  if (tab === "audit") return `<h3>审核明细</h3><dl class="detail-list"><dt>待审核</dt><dd>3 项</dd><dt>审核中</dt><dd>4 项</dd><dt>已通过</dt><dd>6 项</dd><dt>已驳回</dt><dd>1 项</dd><dt>同步状态</dt><dd>${badge("外部审核中台同步正常", "green")}</dd></dl>`;
  if (tab === "trace") return `<h3>追溯信息</h3><dl class="detail-list"><dt>冻结方案</dt><dd>方案版本 v1.3</dd><dt>知识资产</dt><dd>知识资产快照 v3</dd><dt>模型版本</dt><dd>${task.type === "图片" ? "image-gen-v2" : "video-gen-v1.5"}</dd><dt>创建时间</dt><dd>${task.created}</dd></dl>`;
  return `<h3>任务进度</h3>
      <div class="timeline">${["已创建", "方案冻结", "预览确认", task.status === "部分完成" ? "部分完成" : task.status].map((step, index) => `<div class="${index < 3 ? "complete" : "current"}"><span></span><div><strong>${step}</strong><small>${index < 3 ? "已完成" : "成功素材继续审核，失败素材可单独重试"}</small></div></div>`).join("")}</div>
      <h3>任务信息</h3><dl class="detail-list"><dt>任务类型</dt><dd>${task.kind}</dd><dt>素材类型</dt><dd>${task.type}</dd><dt>发起人</dt><dd>${task.owner}</dd><dt>生成数量</dt><dd>${task.count}</dd><dt>预计费用</dt><dd>¥ 12.60</dd><dt>审核汇总</dt><dd>${badge("成功素材审核中", "orange")}</dd></dl>
      ${task.status === "生成失败" ? `<div class="alert danger"><strong>模型响应超时</strong><span>已自动重试2次，可单独重试失败素材。</span></div>` : ""}`;
}

export function renderTaskDrawer(task, activeTab = "overview") {
  return `<div class="drawer-backdrop"><aside class="drawer" role="dialog" aria-modal="true" aria-labelledby="task-title"><div class="drawer-head"><div><h2 id="task-title">${task.name}</h2><p>任务ID：${task.id}</p></div><button class="close-button" data-close>×</button></div>
    <div class="drawer-tabs">${Object.entries(taskTabLabels).map(([key, label]) => `<button data-task-tab="${key}" class="${activeTab === key ? "active" : ""}">${label}</button>`).join("")}</div>
    <div class="drawer-body">${taskDrawerBody(task, activeTab)}</div>
    <div class="drawer-foot"><button class="button button-outline" data-action="cancel-task">取消剩余任务</button><button class="button button-primary" data-action="retry-task">${task.status.includes("失败") || task.status.includes("部分") ? "重试失败素材" : "查看冻结方案"}</button></div>
  </aside></div>`;
}

const auditAssets = [
  { id: "IMG-20250718-0001", title: "轻薄机身 性能强劲", status: "待审核", seed: "laptop-tech" },
  { id: "IMG-20250718-0002", title: "真无线降噪耳机", status: "待审核", seed: "earbuds-clean" },
  { id: "IMG-20250718-0003", title: "全天候健康守护", status: "已通过", seed: "smart-watch" },
  { id: "IMG-20250718-0004", title: "专业影像旗舰", status: "已通过", seed: "mirrorless-camera" },
  { id: "IMG-20250718-0005", title: "5G性能先锋", status: "审核中", seed: "smartphone-pro" },
  { id: "IMG-20250718-0006", title: "全网最低价", status: "已驳回", seed: "phone-sale" }
];

function auditDetail(asset) {
  const rejected = asset.status === "已驳回";
  return `<aside class="audit-detail"><h2>${asset.id} ${badge(asset.status, toneFor(asset.status))}</h2><img src="${imageUrl(asset.seed, 700, 430)}" alt="${asset.title}预览">${rejected ? `<div class="alert danger"><strong>驳回原因</strong><span>价格表达存在绝对化风险；Logo 安全区不足。</span></div>` : `<div class="note-box">审核结果由外部审核中台同步，本页面不承载审核操作。</div>`}<h3>审核流程</h3><div class="review-node approved"><b>内容安全审核</b><span>${rejected ? "已通过 · 王审核 · 11:05" : "处理中 · 外部审核中台"}</span></div>${rejected ? `<div class="review-node rejected"><b>品牌审核</b><span>已驳回 · 李品牌 · 11:28</span></div><button class="button button-primary full" data-action="revision">按原因修改方案</button>` : ""}</aside>`;
}

export function renderAudits() {
  return `${pageHeader("审核管理", "查看外部审核中台同步的任务与单素材审核结果")}
  <section class="audit-overview"><div><strong>7月数码优惠图片投放</strong><small>TASK-20250718-0012</small></div><dl><dt>素材类型</dt><dd>图片</dd><dt>生成数量</dt><dd>24项</dd><dt>发起人</dt><dd>张小野</dd><dt>发起时间</dt><dd>2025-07-18 10:32</dd></dl></section>
  <div class="metric-grid four">${metric("待审核", "8")}${metric("审核中", "5")}${metric("已通过", "8")}${metric("已驳回", "3")}</div>
  <div class="audit-layout"><section class="asset-review-grid">${auditAssets.map((asset, index) => `<article class="review-card ${asset.status === "已驳回" ? "rejected" : ""}" data-audit="${index}"><div class="review-card-head"><strong>${asset.id}</strong>${badge(asset.status, toneFor(asset.status))}</div><img src="${imageUrl(asset.seed, 560, 360)}" alt="${asset.title}"><h3>${asset.title}</h3></article>`).join("")}</section>
  ${auditDetail(auditAssets[5])}</div><div id="overlay-root"></div>`;
}

export function renderLibrary(state = {}) {
  const selectedType = state.assetType || "全部";
  const visibleAssets = assets.map((asset, index) => ({ asset, index })).filter(({ asset }) => selectedType === "全部" || asset.type === selectedType);
  return `${pageHeader("素材库", "统一管理审核通过后的图片与视频素材，支持筛选、授权与导出", '<button class="button button-primary" data-action="batch-export">批量导出</button>')}
  <div class="metric-grid five">${metric("素材总量", "1,286")}${metric("已入库待投放", "318")}${metric("已导出待投放", "205")}${metric("投放中", "642")}${metric("表现优良", "121")}</div>
  <section class="library-panel"><div class="toolbar"><input placeholder="素材ID / 任务ID / 商品名称">${["全部","图片","视频"].map((type) => `<button class="filter-chip ${selectedType === type ? "active" : ""}" data-asset-type="${type}">${type}</button>`).join("")}<select><option>全部渠道</option><option>信息流</option><option>DSP</option><option>种草</option><option>厂商</option></select><select><option>全部媒体</option><option>抖音</option><option>快手</option><option>腾讯广告</option><option>巨量引擎</option><option>百度</option></select><select><option>全部状态</option><option>已入库待投放</option><option>已导出待投放</option><option>投放中</option><option>表现优良</option><option>已下线归档</option></select></div>
  <div class="asset-grid">${visibleAssets.map(({ asset, index }) => `<article class="asset-card" data-asset="${index}"><div class="asset-image"><img src="${imageUrl(asset.seed, 620, 390)}" alt="${asset.title}"><span>${asset.type}</span></div><div class="asset-info"><strong>${asset.id}</strong><h3>${asset.title}</h3><dl><dt>任务</dt><dd>${asset.task}</dd><dt>媒体</dt><dd>${asset.channel} / ${asset.media}</dd></dl>${badge(asset.status, toneFor(asset.status))}</div></article>`).join("") || `<div class="table-empty">没有符合条件的素材</div>`}</div></section><div id="overlay-root"></div>`;
}

function assetDrawer(asset) {
  return `<div class="drawer-backdrop"><aside class="drawer wide" role="dialog" aria-modal="true"><div class="drawer-head"><h2>素材详情</h2><button class="close-button" data-close>×</button></div><div class="drawer-body">
    <img class="drawer-preview" src="${imageUrl(asset.seed, 900, 560)}" alt="${asset.title}"><h2>${asset.title}</h2>
    <dl class="detail-list"><dt>素材ID</dt><dd>${asset.id}</dd><dt>渠道 / 媒体</dt><dd>${asset.channel} / ${asset.media}</dd><dt>任务ID</dt><dd>TASK-20250718-0006</dd><dt>创建人</dt><dd>张小野</dd><dt>入库时间</dt><dd>2025-07-18 14:32</dd><dt>状态</dt><dd>${badge(asset.status, toneFor(asset.status))}</dd></dl>
    <h3>溯源信息</h3><dl class="detail-list"><dt>知识资产快照</dt><dd>知识资产快照 v3</dd><dt>模型版本</dt><dd>image-gen-v2</dd><dt>审核状态</dt><dd>${badge("审核通过", "green")}</dd><dt>版本关系</dt><dd>当前版本 v1</dd></dl>
    <h3>投放表现（近7天）</h3><div class="mini-metrics"><div><span>CTR</span><b>${asset.ctr}</b></div><div><span>消耗</span><b>${asset.spend}</b></div><div><span>CPA</span><b>${asset.cpa}</b></div></div>
  </div><div class="drawer-foot"><button class="button button-primary" data-action="download">下载素材</button><button class="button button-outline" data-action="authorize">授权代理商</button><button class="button button-outline" data-action="more-asset">更多</button></div></aside></div>`;
}

export function bindOperations(route) {
  if (route === "tasks") {
    document.querySelectorAll("[data-task]").forEach((row) => row.addEventListener("click", () => openTaskDrawer(tasks[Number(row.dataset.task)])));
    document.querySelector('[data-action="query-tasks"]')?.addEventListener("click", () => setState({ taskType: document.querySelector('[data-filter="taskType"]')?.value || "全部任务类型", taskPage: 1, toast: "任务筛选已更新" }));
    document.querySelectorAll("[data-task-page]").forEach((button) => button.addEventListener("click", () => setState({ taskPage: Number(button.dataset.taskPage), toast: `已切换到第 ${button.dataset.taskPage} 页` })));
  }
  if (route === "library") document.querySelectorAll("[data-asset]").forEach((card) => card.addEventListener("click", () => { document.querySelector("#overlay-root").innerHTML = assetDrawer(assets[Number(card.dataset.asset)]); bindClose(); bindAssetActions(); }));
  document.querySelectorAll("[data-asset-type]").forEach((button) => button.addEventListener("click", () => setState({ assetType: button.dataset.assetType })));
  document.querySelectorAll("[data-audit]").forEach((card) => card.addEventListener("click", () => {
    document.querySelector(".audit-detail")?.replaceWith(document.createRange().createContextualFragment(auditDetail(auditAssets[Number(card.dataset.audit)])));
    document.querySelector('[data-action="revision"]')?.addEventListener("click", () => setState({ toast: "已创建单素材修订草稿，新版本将生成新的素材 ID" }));
  }));
  document.querySelector('[data-action="revision"]')?.addEventListener("click", () => setState({ toast: "已创建单素材修订草稿，新版本将生成新的素材 ID" }));
  document.querySelector('[data-action="batch-export"]')?.addEventListener("click", () => setState({ toast: "已创建批量导出任务" }));
}

function openTaskDrawer(task, tab = "overview") {
  document.querySelector("#overlay-root").innerHTML = renderTaskDrawer(task, tab);
  bindClose();
  bindTaskActions();
  document.querySelectorAll("[data-task-tab]").forEach((button) => button.addEventListener("click", () => openTaskDrawer(task, button.dataset.taskTab)));
}

function bindClose() {
  document.querySelectorAll("[data-close]").forEach((button) => button.addEventListener("click", () => { document.querySelector("#overlay-root").innerHTML = ""; }));
}
function bindTaskActions() {
  document.querySelector('[data-action="retry-task"]')?.addEventListener("click", () => setState({ toast: "失败素材已进入单独重试队列" }));
  document.querySelector('[data-action="cancel-task"]')?.addEventListener("click", () => setState({ toast: "未执行部分已取消，成功素材继续流转" }));
}
function bindAssetActions() {
  document.querySelector('[data-action="download"]')?.addEventListener("click", (event) => { event.stopPropagation(); setState({ toast: "素材已下载，状态更新为已导出待投放" }); });
  document.querySelector('[data-action="authorize"]')?.addEventListener("click", (event) => { event.stopPropagation(); setState({ toast: "已授权给华东渠道合作商，有效期至 2026-12-31" }); });
  document.querySelector('[data-action="more-asset"]')?.addEventListener("click", (event) => { event.stopPropagation(); setState({ toast: "更多操作：复制素材 ID、查看版本关系、归档" }); });
}
