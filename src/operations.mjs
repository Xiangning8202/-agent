import { assets, tasks } from "./data.mjs";
import { badge, imageUrl, metric, pageHeader, progress } from "./ui.mjs";
import { setState } from "./state.mjs";

const toneFor = (status) => status.includes("失败") || status.includes("驳回") ? "red" : status.includes("完成") || status.includes("通过") || status.includes("投放") || status.includes("优良") ? "green" : status.includes("审核") || status.includes("部分") ? "orange" : "blue";

export function renderTasks() {
  return `${pageHeader("任务进度", "查看预览任务与批量生成任务的实时状态和异常原因")}
  <div class="metric-grid four">${metric("进行中", "6")}${metric("排队中", "3")}${metric("今日完成", "28")}${metric("失败", "2")}</div>
  <section class="data-panel">
    <div class="toolbar"><input placeholder="搜索任务名称或任务ID" aria-label="搜索任务"><select><option>全部任务类型</option><option>预览生成</option><option>批量生成</option></select><select><option>全部素材类型</option><option>图片</option><option>短视频</option></select><select><option>全部状态</option></select><button class="button button-primary">查询</button></div>
    <table class="data-table"><thead><tr><th>任务名称</th><th>任务ID</th><th>任务类型</th><th>素材类型</th><th>发起人</th><th>发起时间</th><th>生成数量</th><th>当前进度</th><th>状态说明</th></tr></thead>
      <tbody>${tasks.map((task, index) => `<tr data-task="${index}"><td><button class="row-link">${task.name}</button></td><td>${task.id}</td><td>${task.kind}</td><td>${task.type}</td><td>${task.owner}</td><td>${task.created}</td><td>${task.count}</td><td><div class="progress-cell">${progress(task.progress)}<span>${task.progress}%</span></div></td><td>${badge(task.status, toneFor(task.status))}</td></tr>`).join("")}</tbody>
    </table>
    <div class="pagination">共 23 条 <button class="active">1</button><button>2</button><button>3</button></div>
  </section><div id="overlay-root"></div>`;
}

function taskDrawer(task) {
  return `<div class="drawer-backdrop"><aside class="drawer" role="dialog" aria-modal="true" aria-labelledby="task-title"><div class="drawer-head"><div><h2 id="task-title">${task.name}</h2><p>任务ID：${task.id}</p></div><button class="close-button" data-close>×</button></div>
    <div class="drawer-tabs"><button class="active">任务概况</button><button>生成明细</button><button>审核明细</button><button>追溯信息</button></div>
    <div class="drawer-body">
      <h3>任务进度</h3>
      <div class="timeline">${["已创建", "方案冻结", "预览确认", task.status === "部分完成" ? "部分完成" : task.status].map((step, index) => `<div class="${index < 3 ? "complete" : "current"}"><span></span><div><strong>${step}</strong><small>${index < 3 ? "已完成" : "成功素材继续审核，失败素材可单独重试"}</small></div></div>`).join("")}</div>
      <h3>任务信息</h3><dl class="detail-list"><dt>任务类型</dt><dd>${task.kind}</dd><dt>素材类型</dt><dd>${task.type}</dd><dt>发起人</dt><dd>${task.owner}</dd><dt>生成数量</dt><dd>${task.count}</dd><dt>预计费用</dt><dd>¥ 12.60</dd><dt>审核汇总</dt><dd>${badge("成功素材审核中", "orange")}</dd></dl>
      ${task.status === "生成失败" ? `<div class="alert danger"><strong>模型响应超时</strong><span>已自动重试2次，可单独重试失败素材。</span></div>` : ""}
    </div>
    <div class="drawer-foot"><button class="button button-outline" data-action="cancel-task">取消剩余任务</button><button class="button button-primary" data-action="retry-task">${task.status.includes("失败") || task.status.includes("部分") ? "重试失败素材" : "查看冻结方案"}</button></div>
  </aside></div>`;
}

export function renderAudits() {
  const auditAssets = [
    { id: "IMG-20250718-0001", title: "轻薄机身 性能强劲", status: "待审核", seed: "laptop-tech" },
    { id: "IMG-20250718-0002", title: "真无线降噪耳机", status: "待审核", seed: "earbuds-clean" },
    { id: "IMG-20250718-0003", title: "全天候健康守护", status: "已通过", seed: "smart-watch" },
    { id: "IMG-20250718-0004", title: "专业影像旗舰", status: "已通过", seed: "mirrorless-camera" },
    { id: "IMG-20250718-0005", title: "5G性能先锋", status: "审核中", seed: "smartphone-pro" },
    { id: "IMG-20250718-0006", title: "全网最低价", status: "已驳回", seed: "phone-sale" }
  ];
  return `${pageHeader("审核管理", "查看外部审核中台同步的任务与单素材审核结果")}
  <section class="audit-overview"><div><strong>7月数码优惠图片投放</strong><small>TASK-20250718-0012</small></div><dl><dt>素材类型</dt><dd>图片</dd><dt>生成数量</dt><dd>24项</dd><dt>发起人</dt><dd>张小野</dd><dt>发起时间</dt><dd>2025-07-18 10:32</dd></dl></section>
  <div class="metric-grid four">${metric("待审核", "8")}${metric("审核中", "5")}${metric("已通过", "8")}${metric("已驳回", "3")}</div>
  <div class="audit-layout"><section class="asset-review-grid">${auditAssets.map((asset, index) => `<article class="review-card ${asset.status === "已驳回" ? "rejected" : ""}" data-audit="${index}"><div class="review-card-head"><strong>${asset.id}</strong>${badge(asset.status, toneFor(asset.status))}</div><img src="${imageUrl(asset.seed, 560, 360)}" alt="${asset.title}"><h3>${asset.title}</h3></article>`).join("")}</section>
  <aside class="audit-detail"><h2>IMG-20250718-0006 ${badge("已驳回", "red")}</h2><img src="${imageUrl("phone-sale", 700, 430)}" alt="被驳回素材预览"><div class="alert danger"><strong>驳回原因</strong><span>价格表达存在绝对化风险；Logo 安全区不足。</span></div><h3>审核流程</h3><div class="review-node approved"><b>内容安全审核</b><span>已通过 · 王审核 · 11:05</span></div><div class="review-node rejected"><b>品牌审核</b><span>已驳回 · 李品牌 · 11:28</span></div><button class="button button-primary full" data-action="revision">按原因修改方案</button></aside></div><div id="overlay-root"></div>`;
}

export function renderLibrary(state) {
  return `${pageHeader("素材库", "统一管理审核通过后的图片与视频素材，支持筛选、授权与导出", '<button class="button button-primary" data-action="batch-export">批量导出</button>')}
  <div class="metric-grid five">${metric("素材总量", "1,286")}${metric("已入库待投放", "318")}${metric("已导出待投放", "205")}${metric("投放中", "642")}${metric("表现优良", "121")}</div>
  <section class="library-panel"><div class="toolbar"><input placeholder="素材ID / 任务ID / 商品名称"><button class="filter-chip active">全部</button><button class="filter-chip">图片</button><button class="filter-chip">视频</button><select><option>全部渠道</option></select><select><option>全部媒体</option></select><select><option>全部状态</option></select></div>
  <div class="asset-grid">${assets.map((asset, index) => `<article class="asset-card" data-asset="${index}"><div class="asset-image"><img src="${imageUrl(asset.seed, 620, 390)}" alt="${asset.title}"><span>${asset.type}</span></div><div class="asset-info"><strong>${asset.id}</strong><h3>${asset.title}</h3><dl><dt>任务</dt><dd>${asset.task}</dd><dt>媒体</dt><dd>${asset.channel} / ${asset.media}</dd></dl>${badge(asset.status, toneFor(asset.status))}</div></article>`).join("")}</div></section><div id="overlay-root"></div>`;
}

function assetDrawer(asset) {
  return `<div class="drawer-backdrop"><aside class="drawer wide" role="dialog" aria-modal="true"><div class="drawer-head"><h2>素材详情</h2><button class="close-button" data-close>×</button></div><div class="drawer-body">
    <img class="drawer-preview" src="${imageUrl(asset.seed, 900, 560)}" alt="${asset.title}"><h2>${asset.title}</h2>
    <dl class="detail-list"><dt>素材ID</dt><dd>${asset.id}</dd><dt>渠道 / 媒体</dt><dd>${asset.channel} / ${asset.media}</dd><dt>任务ID</dt><dd>TASK-20250718-0006</dd><dt>创建人</dt><dd>张小野</dd><dt>入库时间</dt><dd>2025-07-18 14:32</dd><dt>状态</dt><dd>${badge(asset.status, toneFor(asset.status))}</dd></dl>
    <h3>溯源信息</h3><dl class="detail-list"><dt>知识资产快照</dt><dd>知识资产快照 v3</dd><dt>模型版本</dt><dd>image-gen-v2</dd><dt>审核状态</dt><dd>${badge("审核通过", "green")}</dd><dt>版本关系</dt><dd>当前版本 v1</dd></dl>
    <h3>投放表现（近7天）</h3><div class="mini-metrics"><div><span>CTR</span><b>${asset.ctr}</b></div><div><span>消耗</span><b>${asset.spend}</b></div><div><span>CPA</span><b>${asset.cpa}</b></div></div>
  </div><div class="drawer-foot"><button class="button button-primary" data-action="download">下载素材</button><button class="button button-outline" data-action="authorize">授权代理商</button><button class="button button-outline">更多</button></div></aside></div>`;
}

export function bindOperations(route) {
  if (route === "tasks") document.querySelectorAll("[data-task]").forEach((row) => row.addEventListener("click", () => { document.querySelector("#overlay-root").innerHTML = taskDrawer(tasks[Number(row.dataset.task)]); bindClose(); bindTaskActions(); }));
  if (route === "library") document.querySelectorAll("[data-asset]").forEach((card) => card.addEventListener("click", () => { document.querySelector("#overlay-root").innerHTML = assetDrawer(assets[Number(card.dataset.asset)]); bindClose(); bindAssetActions(); }));
  document.querySelector('[data-action="revision"]')?.addEventListener("click", () => setState({ toast: "已创建单素材修订草稿，新版本将生成新的素材 ID" }));
  document.querySelector('[data-action="batch-export"]')?.addEventListener("click", () => setState({ toast: "已创建批量导出任务" }));
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
}
