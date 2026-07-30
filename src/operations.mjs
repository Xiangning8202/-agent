import { assets, tasks } from "./data.mjs";
import { badge, escapeHtml, imageUrl, metric, pageHeader, progress } from "./ui.mjs";
import { setState } from "./state.mjs";

const toneFor = (status) => status.includes("失败") || status.includes("驳回")
  ? "red"
  : status.includes("完成") || status.includes("通过") || status.includes("投放") || status.includes("优良")
    ? "green"
    : status.includes("审核") || status.includes("部分")
      ? "orange"
      : "blue";

const auditTotal = (task) => (task.auditCounts || []).reduce((sum, count) => sum + count, 0);

export function renderTasks(state = {}) {
  const selectedType = state.taskType || "全部任务类型";
  const selectedMaterial = state.taskMaterialType || "全部素材类型";
  const selectedStatus = state.taskStatus || "全部状态";
  const query = (state.taskQuery || "").trim().toLowerCase();
  const visibleTasks = tasks.map((task, index) => ({ task, index })).filter(({ task }) => {
    const typeMatch = selectedType === "全部任务类型" || task.kind === selectedType;
    const materialMatch = selectedMaterial === "全部素材类型" || task.type === selectedMaterial;
    const statusMatch = selectedStatus === "全部状态" || task.status === selectedStatus;
    const queryMatch = !query || `${task.name} ${task.id} ${task.owner}`.toLowerCase().includes(query);
    return typeMatch && materialMatch && statusMatch && queryMatch;
  });
  const option = (item, selected) => `<option ${item === selected ? "selected" : ""}>${item}</option>`;
  return `${pageHeader("任务进度", "查看预览任务与批量生成任务的实时状态；审核入口随具体任务展示")}
  <div class="metric-grid four">${metric("进行中", "6")}${metric("排队中", "3")}${metric("今日完成", "28")}${metric("失败", "2")}</div>
  <section class="data-panel">
    <div class="toolbar task-toolbar">
      <input data-filter="taskQuery" value="${escapeHtml(state.taskQuery || "")}" placeholder="搜索任务名称或任务ID" aria-label="搜索任务">
      <select data-filter="taskType">${["全部任务类型", "预览生成", "批量生成"].map((item) => option(item, selectedType)).join("")}</select>
      <select data-filter="taskMaterialType">${["全部素材类型", "图片", "短视频"].map((item) => option(item, selectedMaterial)).join("")}</select>
      <select data-filter="taskStatus">${["全部状态", "生成中", "待审核", "部分完成", "生成完成", "生成失败"].map((item) => option(item, selectedStatus)).join("")}</select>
      <button class="button button-primary" data-action="query-tasks">查询</button>
    </div>
    <table class="data-table task-table"><thead><tr><th>任务名称</th><th>任务ID</th><th>任务类型</th><th>素材类型</th><th>发起人</th><th>发起时间</th><th>生成数量</th><th>当前进度</th><th>状态说明</th><th>任务操作</th></tr></thead>
      <tbody>${visibleTasks.map(({ task, index }) => `<tr data-task-row="${index}">
        <td><button class="row-link" data-task-detail="${index}">${task.name}</button></td><td>${task.id}</td><td>${task.kind}</td><td>${task.type}</td><td>${task.owner}</td><td>${task.created}</td><td>${task.count}</td>
        <td><div class="progress-cell">${progress(task.progress)}<span>${task.progress}%</span></div></td>
        <td><div class="status-stack">${badge(task.status, toneFor(task.status))}<small>${task.auditStatus}</small></div></td>
        <td><div class="operation-status">${badge(task.status, toneFor(task.status))}</div><div class="row-actions"><button class="link-button" data-task-detail="${index}">任务详情</button>${auditTotal(task) ? `<button class="button button-soft compact" data-task-audit="${index}">审核详情</button>` : `<span class="muted">审核未开始</span>`}</div></td>
      </tr>`).join("") || `<tr><td colspan="10"><div class="table-empty">没有符合条件的任务</div></td></tr>`}</tbody>
    </table>
    <div class="pagination">共 ${visibleTasks.length} 条 ${[1, 2, 3].map((page) => `<button data-task-page="${page}" class="${Number(state.taskPage || 1) === page ? "active" : ""}">${page}</button>`).join("")}</div>
  </section><div id="overlay-root"></div>`;
}

const taskTabLabels = { overview: "任务概况", generation: "生成明细", audit: "审核汇总", trace: "追溯信息" };

function taskDrawerBody(task, tab) {
  if (tab === "generation") return `<h3>生成明细</h3><div class="mini-metrics"><div><span>成功素材</span><b>${task.progress === 100 ? task.count.split(" / ")[1] : task.count.split(" / ")[0]}</b></div><div><span>失败素材</span><b>${task.status.includes("失败") ? "12" : task.status.includes("部分") ? "6" : "0"}</b></div><div><span>生成进度</span><b>${task.progress}%</b></div></div><div class="detail-card"><strong>成功素材继续流转</strong><p>失败素材可单独重试，不影响已成功素材进入审核。</p></div>`;
  if (tab === "audit") {
    const [pending = 0, reviewing = 0, approved = 0, rejected = 0] = task.auditCounts || [];
    return `<h3>审核汇总</h3><dl class="detail-list"><dt>待审核</dt><dd>${pending} 项</dd><dt>审核中</dt><dd>${reviewing} 项</dd><dt>已通过</dt><dd>${approved} 项</dd><dt>已驳回</dt><dd>${rejected} 项</dd><dt>同步状态</dt><dd>${badge("外部审核中台同步正常", "green")}</dd></dl>${auditTotal(task) ? `<button class="button button-primary full" data-action="open-task-audit">进入审核详情</button>` : `<div class="note-box">当前任务尚无可查看的审核记录。</div>`}`;
  }
  if (tab === "trace") return `<h3>冻结方案</h3><dl class="detail-list"><dt>方案版本</dt><dd>v1.3（只读）</dd><dt>知识资产</dt><dd>知识资产快照 v3</dd><dt>模型版本</dt><dd>${task.type === "图片" ? "gpt-image-2" : "seedance-1.5-pro"}</dd><dt>创建时间</dt><dd>${task.created}</dd><dt>投放目标</dt><dd>优惠心智 + 点击转化</dd><dt>风险边界</dt><dd>避免绝对化低价表达</dd></dl>`;
  return `<h3>任务进度</h3>
      <div class="timeline">${["已创建", "方案冻结", "预览确认", task.status === "部分完成" ? "部分完成" : task.status].map((step, index) => `<div class="${index < 3 ? "complete" : "current"}"><span></span><div><strong>${step}</strong><small>${index < 3 ? "已完成" : "成功素材继续审核，失败素材可单独重试"}</small></div></div>`).join("")}</div>
      <h3>任务信息</h3><dl class="detail-list"><dt>任务类型</dt><dd>${task.kind}</dd><dt>素材类型</dt><dd>${task.type}</dd><dt>发起人</dt><dd>${task.owner}</dd><dt>生成数量</dt><dd>${task.count}</dd><dt>预计费用</dt><dd>¥ 12.60</dd><dt>审核汇总</dt><dd>${badge(task.auditStatus, auditTotal(task) ? "orange" : "gray")}</dd></dl>
      ${task.status === "生成失败" ? `<div class="alert danger"><strong>模型响应超时</strong><span>已自动重试2次，可单独重试失败素材。</span></div>` : ""}`;
}

export function renderTaskDrawer(task, activeTab = "overview") {
  const canCancel = ["生成中", "部分完成"].includes(task.status);
  const canRetry = task.status.includes("失败") || task.status.includes("部分");
  return `<div class="drawer-backdrop"><aside class="drawer" role="dialog" aria-modal="true" aria-labelledby="task-title"><div class="drawer-head"><div><h2 id="task-title">${task.name}</h2><p>任务ID：${task.id}</p></div><button class="close-button" data-close aria-label="关闭">×</button></div>
    <div class="drawer-tabs">${Object.entries(taskTabLabels).map(([key, label]) => `<button data-task-tab="${key}" class="${activeTab === key ? "active" : ""}">${label}</button>`).join("")}</div>
    <div class="drawer-body">${taskDrawerBody(task, activeTab)}</div>
    <div class="drawer-foot">${canCancel ? `<button class="button button-outline" data-action="cancel-task">取消剩余任务</button>` : ""}${auditTotal(task) ? `<button class="button button-outline" data-action="open-task-audit">审核详情</button>` : ""}<button class="button button-primary" data-action="${canRetry ? "retry-task" : "view-plan"}">${canRetry ? "重试失败素材" : "查看冻结方案"}</button></div>
  </aside></div>`;
}

const auditAssetPool = [
  { id: "IMG-001", title: "18日领券日·平台大促", status: "待审核", source: "./src/assets/eval-images/IMG-001.png" },
  { id: "IMG-002", title: "外卖一折起·家庭聚餐", status: "审核中", source: "./src/assets/eval-images/IMG-002.png" },
  { id: "IMG-003", title: "球场拼速度·平台快一步", status: "已通过", source: "./src/assets/eval-images/IMG-003.png" },
  { id: "IMG-004", title: "会员超多权益", status: "已通过", source: "./src/assets/eval-images/IMG-004.png" },
  { id: "IMG-005", title: "欢庆新春年货节", status: "审核中", source: "./src/assets/eval-images/IMG-005.png" },
  { id: "IMG-006", title: "买药有保障·药店满减", status: "已驳回", source: "./src/assets/eval-images/IMG-006.png" }
];

function auditAssetsFor(task) {
  if (task.type === "图片") return auditAssetPool;
  return auditAssetPool.slice(0, Math.min(4, Math.max(1, auditTotal(task)))).map((asset, index) => ({
    ...asset,
    id: `VID-${String(index + 1).padStart(3, "0")}`,
    title: ["优惠利益点首帧", "商品卖点演示", "使用场景种草", "尾帧 CTA"][index]
  }));
}

function auditDetail(asset) {
  const rejected = asset.status === "已驳回";
  return `<aside class="audit-detail" aria-label="单素材审核明细"><h2>${asset.id} ${badge(asset.status, toneFor(asset.status))}</h2><img src="${imageUrl(asset.source, 700, 430)}" alt="${asset.title}预览">${rejected ? `<div class="alert danger"><strong>驳回原因</strong><span>价格表达存在绝对化风险；Logo 安全区不足。</span></div>` : `<div class="note-box">审核结果由外部审核中台同步，本页面不承载审核操作。</div>`}<h3>审核流程</h3><div class="review-node approved"><b>内容安全审核</b><span>${rejected ? "已通过 · 王审核 · 11:05" : "处理中 · 外部审核中台"}</span></div>${rejected ? `<div class="review-node rejected"><b>品牌审核</b><span>已驳回 · 李品牌 · 11:28</span></div><button class="button button-primary full" data-action="revision">按原因修改方案</button>` : ""}</aside>`;
}

export function renderAudits(state = {}) {
  const task = tasks.find((item) => item.id === state.auditTaskId) || tasks.find((item) => auditTotal(item)) || tasks[0];
  const [pending = 0, reviewing = 0, approved = 0, rejected = 0] = task.auditCounts || [];
  const statusFilter = state.auditStatus || "全部审核状态";
  const query = (state.auditQuery || "").trim().toLowerCase();
  const taskAssets = auditAssetsFor(task);
  const visibleAssets = taskAssets.filter((asset) => (statusFilter === "全部审核状态" || asset.status === statusFilter) && (!query || `${asset.id} ${asset.title}`.toLowerCase().includes(query)));
  const selectedAsset = visibleAssets.find((asset) => asset.status === "已驳回") || visibleAssets[0] || taskAssets[0];
  return `<div class="secondary-breadcrumb"><button class="text-button" data-action="back-to-tasks">任务进度</button><span>/</span><strong>审核详情</strong></div>
  ${pageHeader(`${task.name} · 审核详情`, "按任务查看外部审核中台同步的单素材状态、节点与驳回原因", '<button class="button button-outline" data-action="back-to-tasks">返回任务进度</button>')}
  <section class="audit-overview"><div><strong>${task.name}</strong><small>${task.id}</small></div><dl><dt>素材类型</dt><dd>${task.type}</dd><dt>已提交审核</dt><dd>${auditTotal(task)}项</dd><dt>发起人</dt><dd>${task.owner}</dd><dt>发起时间</dt><dd>${task.created}</dd></dl></section>
  <div class="metric-grid four">${metric("待审核", String(pending))}${metric("审核中", String(reviewing))}${metric("已通过", String(approved))}${metric("已驳回", String(rejected))}</div>
  <section class="data-panel audit-filters"><div class="toolbar"><input data-filter="auditQuery" value="${escapeHtml(state.auditQuery || "")}" placeholder="素材 ID / 素材标题"><select data-filter="auditStatus">${["全部审核状态", "待审核", "审核中", "已通过", "已驳回"].map((item) => `<option ${item === statusFilter ? "selected" : ""}>${item}</option>`).join("")}</select><button class="button button-primary" data-action="query-audits">查询</button></div></section>
  <div class="audit-layout"><section class="asset-review-grid">${visibleAssets.map((asset, index) => `<article class="review-card ${asset.status === "已驳回" ? "rejected" : ""}" data-audit="${index}"><div class="review-card-head"><strong>${asset.id}</strong>${badge(asset.status, toneFor(asset.status))}</div><img src="${imageUrl(asset.source, 560, 360)}" alt="${asset.title}"><h3>${asset.title}</h3></article>`).join("") || `<div class="table-empty">没有符合条件的审核素材</div>`}</section>
  ${auditDetail(selectedAsset)}</div><div id="overlay-root"></div>`;
}

export function renderLibrary(state = {}) {
  const selectedType = state.assetType || "全部";
  const selectedChannel = state.assetChannel || "全部渠道";
  const selectedMedia = state.assetMedia || "全部媒体";
  const selectedStatus = state.assetStatus || "全部状态";
  const query = (state.assetQuery || "").trim().toLowerCase();
  const view = state.assetView || "grid";
  const visibleAssets = assets.map((asset, index) => ({ asset, index })).filter(({ asset }) => {
    const typeMatch = selectedType === "全部" || asset.type === selectedType;
    const channelMatch = selectedChannel === "全部渠道" || asset.channel === selectedChannel;
    const mediaMatch = selectedMedia === "全部媒体" || asset.media === selectedMedia;
    const statusMatch = selectedStatus === "全部状态" || asset.status === selectedStatus;
    const queryMatch = !query || `${asset.id} ${asset.taskId} ${asset.title} ${asset.task}`.toLowerCase().includes(query);
    return typeMatch && channelMatch && mediaMatch && statusMatch && queryMatch;
  });
  const select = (items, selected, name) => `<select data-filter="${name}">${items.map((item) => `<option ${item === selected ? "selected" : ""}>${item}</option>`).join("")}</select>`;
  return `${pageHeader("素材库", "展示真实电商广告评测素材；审核通过后可筛选、追溯、授权与导出", '<button class="button button-primary" data-action="batch-export">批量导出当前结果</button>')}
  <div class="metric-grid five">${metric("素材总量", "1,286")}${metric("已入库待投放", "318")}${metric("已导出待投放", "205")}${metric("投放中", "642")}${metric("表现优良", "121")}</div>
  <section class="library-panel"><div class="toolbar library-toolbar">
    <input data-filter="assetQuery" value="${escapeHtml(state.assetQuery || "")}" placeholder="素材ID / 任务ID / 素材标题">
    ${["全部", "图片", "视频"].map((type) => `<button class="filter-chip ${selectedType === type ? "active" : ""}" data-asset-type="${type}">${type}</button>`).join("")}
    ${select(["全部渠道", "信息流", "DSP", "种草", "厂商"], selectedChannel, "assetChannel")}
    ${select(["全部媒体", "抖音", "快手", "腾讯广告", "巨量引擎", "百度"], selectedMedia, "assetMedia")}
    ${select(["全部状态", "已入库待投放", "已导出待投放", "投放中", "表现优良", "已下线归档"], selectedStatus, "assetStatus")}
    <button class="button button-primary" data-action="query-assets">查询</button>
    <div class="view-switch" aria-label="素材视图"><button data-asset-view="grid" class="${view === "grid" ? "active" : ""}">网格</button><button data-asset-view="list" class="${view === "list" ? "active" : ""}">列表</button></div>
  </div>
  <div class="asset-grid ${view === "list" ? "list-view" : ""}">${visibleAssets.map(({ asset, index }) => `<article class="asset-card" data-asset="${index}"><div class="asset-image"><img src="${imageUrl(asset.source, 620, 390)}" alt="${asset.title}"><span>${asset.type}</span>${asset.type === "视频" ? '<i class="video-indicator">▶</i>' : ""}</div><div class="asset-info"><strong>${asset.id}</strong><h3>${asset.title}</h3><dl><dt>任务</dt><dd>${asset.task}</dd><dt>媒体</dt><dd>${asset.channel} / ${asset.media}</dd></dl><div class="asset-card-foot">${badge(asset.status, toneFor(asset.status))}<button class="link-button" data-open-asset="${index}">查看详情</button></div></div></article>`).join("") || `<div class="table-empty">没有符合条件的素材</div>`}</div></section><div id="overlay-root"></div>`;
}

function assetDrawer(asset) {
  return `<div class="drawer-backdrop"><aside class="drawer wide" role="dialog" aria-modal="true" aria-labelledby="asset-title"><div class="drawer-head"><div><h2 id="asset-title">素材详情</h2><p>${asset.id}</p></div><button class="close-button" data-close aria-label="关闭">×</button></div><div class="drawer-body">
    <img class="drawer-preview ecommerce-preview" src="${imageUrl(asset.source, 900, 560)}" alt="${asset.title}"><h2>${asset.title}</h2>
    <dl class="detail-list"><dt>素材ID</dt><dd>${asset.id}</dd><dt>渠道 / 媒体</dt><dd>${asset.channel} / ${asset.media}</dd><dt>任务ID</dt><dd>${asset.taskId}</dd><dt>创建人</dt><dd>张小野</dd><dt>入库时间</dt><dd>2025-07-18 14:32</dd><dt>状态</dt><dd>${badge(asset.status, toneFor(asset.status))}</dd></dl>
    <h3>溯源信息</h3><dl class="detail-list"><dt>素材来源</dt><dd>gpt-image-2 评测集</dd><dt>模型版本</dt><dd>${asset.type === "图片" ? "gpt-image-2" : "seedance-1.5-pro"}</dd><dt>审核状态</dt><dd>${badge("审核通过", "green")}</dd><dt>版本关系</dt><dd>当前版本 v1 · 无上游修订</dd></dl>
    <h3>投放表现（近7天）</h3><div class="mini-metrics"><div><span>CTR</span><b>${asset.ctr}</b></div><div><span>消耗</span><b>${asset.spend}</b></div><div><span>CPA</span><b>${asset.cpa}</b></div></div>
  </div><div class="drawer-foot"><button class="button button-primary" data-action="download">下载素材</button><button class="button button-outline" data-action="authorize">授权代理商</button><button class="button button-outline" data-action="more-asset">更多操作</button></div></aside></div>`;
}

function authorizeModal(asset) {
  return `<div class="overlay"><section class="modal" role="dialog" aria-modal="true" aria-labelledby="authorize-title"><div class="modal-head"><div><h2 id="authorize-title">授权代理商</h2><p>${asset.id} · ${asset.title}</p></div><button class="close-button" data-close>×</button></div><div class="form-stack modal-body"><label>代理商<select data-authorize-partner><option>华东渠道合作商</option><option>华南品牌代理商</option><option>全国媒体采买团队</option></select></label><label>授权有效期<input type="date" value="2026-12-31" data-authorize-expiry></label><div class="note-box">代理商仅能查看和下载被授权素材，下载行为会进入账号管理记录。</div></div><div class="modal-foot"><button class="button button-outline" data-close>取消</button><button class="button button-primary" data-action="confirm-authorize">确认授权</button></div></section></div>`;
}

function moreAssetModal(asset) {
  return `<div class="overlay"><section class="modal compact-modal" role="dialog" aria-modal="true" aria-labelledby="more-title"><div class="modal-head"><div><h2 id="more-title">更多素材操作</h2><p>${asset.id}</p></div><button class="close-button" data-close>×</button></div><div class="action-list"><button data-action="copy-asset-id">复制素材 ID<span>用于投放平台和数据回流映射</span></button><button data-action="asset-version">查看版本关系<span>检查来源素材与修订链</span></button><button data-action="archive-asset">归档素材<span>停止后续导出，保留历史数据</span></button></div></section></div>`;
}

function versionModal(asset) {
  return `<div class="overlay"><section class="modal compact-modal" role="dialog" aria-modal="true" aria-labelledby="version-title"><div class="modal-head"><div><h2 id="version-title">版本关系</h2><p>${asset.id}</p></div><button class="close-button" data-close>×</button></div><div class="version-chain"><div class="active"><b>v1 当前版本</b><span>gpt-image-2 评测生成 · 审核通过</span></div><div><b>来源任务</b><span>${asset.taskId} · ${asset.task}</span></div></div><div class="modal-foot"><button class="button button-primary" data-close>知道了</button></div></section></div>`;
}

export function bindOperations(route, state = {}) {
  if (route === "tasks") {
    document.querySelectorAll("[data-task-detail]").forEach((button) => button.addEventListener("click", (event) => {
      event.stopPropagation();
      openTaskDrawer(tasks[Number(button.dataset.taskDetail)]);
    }));
    document.querySelectorAll("[data-task-audit]").forEach((button) => button.addEventListener("click", (event) => {
      event.stopPropagation();
      setState({ route: "audits", auditTaskId: tasks[Number(button.dataset.taskAudit)].id, auditStatus: "全部审核状态", auditQuery: "" });
    }));
    document.querySelector('[data-action="query-tasks"]')?.addEventListener("click", () => setState({
      taskQuery: document.querySelector('[data-filter="taskQuery"]')?.value || "",
      taskType: document.querySelector('[data-filter="taskType"]')?.value || "全部任务类型",
      taskMaterialType: document.querySelector('[data-filter="taskMaterialType"]')?.value || "全部素材类型",
      taskStatus: document.querySelector('[data-filter="taskStatus"]')?.value || "全部状态",
      taskPage: 1,
      toast: "任务筛选已更新"
    }));
    document.querySelectorAll("[data-task-page]").forEach((button) => button.addEventListener("click", () => setState({ taskPage: Number(button.dataset.taskPage), toast: `已切换到第 ${button.dataset.taskPage} 页` })));
  }

  if (route === "audits") {
    const task = tasks.find((item) => item.id === state.auditTaskId) || tasks.find((item) => auditTotal(item)) || tasks[0];
    const statusFilter = state.auditStatus || "全部审核状态";
    const query = (state.auditQuery || "").trim().toLowerCase();
    const visibleAssets = auditAssetsFor(task).filter((asset) => (statusFilter === "全部审核状态" || asset.status === statusFilter) && (!query || `${asset.id} ${asset.title}`.toLowerCase().includes(query)));
    document.querySelectorAll('[data-action="back-to-tasks"]').forEach((button) => button.addEventListener("click", () => setState({ route: "tasks", auditTaskId: "", auditStatus: "全部审核状态", auditQuery: "" })));
    document.querySelector('[data-action="query-audits"]')?.addEventListener("click", () => setState({
      auditQuery: document.querySelector('[data-filter="auditQuery"]')?.value || "",
      auditStatus: document.querySelector('[data-filter="auditStatus"]')?.value || "全部审核状态"
    }));
    document.querySelectorAll("[data-audit]").forEach((card) => card.addEventListener("click", () => {
      const asset = visibleAssets[Number(card.dataset.audit)];
      document.querySelector(".audit-detail")?.replaceWith(document.createRange().createContextualFragment(auditDetail(asset)));
      bindRevision();
    }));
    bindRevision();
  }

  if (route === "library") {
    const openAsset = (index) => {
      const asset = assets[Number(index)];
      document.querySelector("#overlay-root").innerHTML = assetDrawer(asset);
      bindAssetDrawer(asset);
    };
    document.querySelectorAll("[data-asset], [data-open-asset]").forEach((target) => target.addEventListener("click", (event) => {
      event.stopPropagation();
      openAsset(target.dataset.openAsset ?? target.dataset.asset);
    }));
    document.querySelectorAll("[data-asset-type]").forEach((button) => button.addEventListener("click", () => setState({ assetType: button.dataset.assetType })));
    document.querySelectorAll("[data-asset-view]").forEach((button) => button.addEventListener("click", () => setState({ assetView: button.dataset.assetView })));
    document.querySelector('[data-action="query-assets"]')?.addEventListener("click", () => setState({
      assetQuery: document.querySelector('[data-filter="assetQuery"]')?.value || "",
      assetChannel: document.querySelector('[data-filter="assetChannel"]')?.value || "全部渠道",
      assetMedia: document.querySelector('[data-filter="assetMedia"]')?.value || "全部媒体",
      assetStatus: document.querySelector('[data-filter="assetStatus"]')?.value || "全部状态",
      toast: "素材筛选已更新"
    }));
    document.querySelector('[data-action="batch-export"]')?.addEventListener("click", () => exportAssetsCsv(assets, "素材库导出.csv"));
  }
}

function openTaskDrawer(task, tab = "overview") {
  document.querySelector("#overlay-root").innerHTML = renderTaskDrawer(task, tab);
  bindClose();
  document.querySelectorAll("[data-task-tab]").forEach((button) => button.addEventListener("click", () => openTaskDrawer(task, button.dataset.taskTab)));
  document.querySelectorAll('[data-action="open-task-audit"]').forEach((button) => button.addEventListener("click", () => setState({ route: "audits", auditTaskId: task.id, auditStatus: "全部审核状态", auditQuery: "" })));
  document.querySelector('[data-action="view-plan"]')?.addEventListener("click", () => openTaskDrawer(task, "trace"));
  document.querySelector('[data-action="retry-task"]')?.addEventListener("click", () => setState({ toast: "失败素材已进入单独重试队列" }));
  document.querySelector('[data-action="cancel-task"]')?.addEventListener("click", () => setState({ toast: "未执行部分已取消，成功素材继续流转" }));
}

function bindRevision() {
  document.querySelector('[data-action="revision"]')?.addEventListener("click", () => setState({ toast: "已创建单素材修订草稿，新版本将生成新的素材 ID" }));
}

function bindClose() {
  document.querySelectorAll("[data-close]").forEach((button) => button.addEventListener("click", () => {
    document.querySelector("#overlay-root").innerHTML = "";
  }));
}

function bindAssetDrawer(asset) {
  bindClose();
  document.querySelector('[data-action="download"]')?.addEventListener("click", (event) => {
    event.stopPropagation();
    const link = document.createElement("a");
    link.href = imageUrl(asset.source);
    link.download = `${asset.id}.png`;
    link.click();
    setState({ toast: "素材下载已开始，下载记录已同步" });
  });
  document.querySelector('[data-action="authorize"]')?.addEventListener("click", (event) => {
    event.stopPropagation();
    document.querySelector("#overlay-root").innerHTML = authorizeModal(asset);
    bindClose();
    document.querySelector('[data-action="confirm-authorize"]')?.addEventListener("click", () => setState({ toast: `已授权 ${asset.id}，有效期至 2026-12-31` }));
  });
  document.querySelector('[data-action="more-asset"]')?.addEventListener("click", (event) => {
    event.stopPropagation();
    document.querySelector("#overlay-root").innerHTML = moreAssetModal(asset);
    bindMoreAsset(asset);
  });
}

function bindMoreAsset(asset) {
  bindClose();
  document.querySelector('[data-action="copy-asset-id"]')?.addEventListener("click", async () => {
    await navigator.clipboard?.writeText(asset.id);
    setState({ toast: `已复制素材 ID：${asset.id}` });
  });
  document.querySelector('[data-action="asset-version"]')?.addEventListener("click", () => {
    document.querySelector("#overlay-root").innerHTML = versionModal(asset);
    bindClose();
  });
  document.querySelector('[data-action="archive-asset"]')?.addEventListener("click", () => setState({ toast: `${asset.id} 已归档并保留历史数据` }));
}

function exportAssetsCsv(rows, filename) {
  const header = ["素材ID", "素材标题", "任务ID", "类型", "渠道", "媒体", "状态"];
  const csv = [header, ...rows.map((asset) => [asset.id, asset.title, asset.taskId, asset.type, asset.channel, asset.media, asset.status])]
    .map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(","))
    .join("\n");
  const link = document.createElement("a");
  link.href = `data:text/csv;charset=utf-8,\uFEFF${encodeURIComponent(csv)}`;
  link.download = filename;
  link.click();
  setState({ toast: "当前素材结果已导出" });
}
