import { knowledgeAssetTypeLabels } from "./agent.mjs";

const escapeHtml = (value = "") => String(value).replace(/[&<>"']/g, (character) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
}[character]));

const stepNames = ["意图理解", "资产召回", "资产过滤", "资产排序", "数量和类型校验", "缺失资产处理"];
const labelFor = (type) => knowledgeAssetTypeLabels[type] || type;

export function renderKnowledgeAgentModal(result, { taskType = result.taskType } = {}) {
  const counts = result.filteredCounts;
  const filteredTotal = Object.values(counts).reduce((sum, value) => sum + value, 0);
  const hasGap = result.status === "needs_decision";
  return `<div class="overlay"><section class="modal knowledge-agent-modal" role="dialog" aria-modal="true" aria-labelledby="knowledge-agent-title">
    <div class="modal-head"><div><h2 id="knowledge-agent-title">知识库 Agent · 资产调用结果</h2><p>输入来自需求理解 Agent 与选品 Agent；当前任务：${taskType === "video" ? "视频素材" : "图片素材"}</p></div><button class="close-button" data-action="close-overlay" aria-label="关闭">×</button></div>
    <div class="knowledge-agent-steps">${stepNames.map((name, index) => `<div class="${index === 5 && hasGap ? "warning" : "done"}"><span>${index + 1}</span><small>${name}</small></div>`).join("")}</div>
    <div class="knowledge-inputs"><article><span>结构化需求</span><strong>${escapeHtml(result.requirement.channel)} · ${escapeHtml(result.requirement.aspectRatio)}</strong><small>${(result.requirement.styleTags || []).map(escapeHtml).join(" / ")}</small></article><article><span>选品结果</span><strong>${result.products.length} 个商品</strong><small>${result.products.slice(0, 3).map((item) => escapeHtml(item.name || item.id)).join(" / ") || "未绑定具体商品"}</small></article><article><span>资产处理</span><strong>${result.recalled.length} 召回 / ${result.eligible.length} 可用</strong><small>${filteredTotal} 个资产被过滤</small></article></div>
    <div class="knowledge-filter-strip"><strong>过滤结果</strong><span>失效 ${counts.expired}</span><span>下架 ${counts.unlisted}</span><span>重复 ${counts.duplicate}</span><span>文件损坏 ${counts.corrupt}</span><span>清晰度不足 ${counts.lowResolution}</span><span>版权不可用 ${counts.copyright}</span><span>品牌不适用 ${counts.brandMismatch}</span><span>渠道不适用 ${counts.channelMismatch}</span><span>尺寸不适用 ${counts.sizeMismatch}</span></div>
    <div class="knowledge-agent-body"><section><div class="knowledge-section-title"><div><strong>资产覆盖校验</strong><small>按创意方案检查数量与类型是否齐全</small></div><span class="knowledge-status ${hasGap ? "warning" : "ready"}">${hasGap ? `${result.missingAssets.length} 类资产存在缺口` : "资产类型与数量齐全"}</span></div><div class="coverage-grid">${result.coverage.map((item) => `<article class="${item.status}"><span>${labelFor(item.type)}</span><strong>${item.selected} / ${item.count}</strong><small>库内可用 ${item.available} · ${item.reason}</small></article>`).join("")}</div></section>
      <section><div class="knowledge-section-title"><div><strong>排序后调用资产</strong><small>需求30% + 商品25% + 渠道20% + 风格15% + 质量10%</small></div><span>${result.selectedAssets.length} 个</span></div><div class="knowledge-selected-table"><table><thead><tr><th>资产类型</th><th>资产名称</th><th>资产ID</th><th>推荐分</th><th>调用依据</th></tr></thead><tbody>${result.selectedAssets.map((item) => `<tr><td>${labelFor(item.assetType)}</td><td><strong>${escapeHtml(item.name)}</strong></td><td>${item.assetId}</td><td><b>${item.score.toFixed(1)}</b></td><td>需求 ${item.scoreBreakdown.requirement} · 商品 ${item.scoreBreakdown.product} · 渠道 ${item.scoreBreakdown.channel} · 风格 ${item.scoreBreakdown.style} · 质量 ${item.scoreBreakdown.quality}</td></tr>`).join("") || `<tr><td colspan="5" class="table-empty">暂无可调用资产</td></tr>`}</tbody></table></div></section>
      ${hasGap ? `<section class="missing-asset-panel"><div class="knowledge-section-title"><div><strong>人工决策</strong><small>知识库 Agent 不会虚构缺失资产，需由运营明确选择</small></div></div>${result.missingAssets.map((item) => `<article><div><span>${labelFor(item.type)}</span><strong>缺 ${item.missingCount} 个</strong><p>${escapeHtml(item.reason)}</p></div>${item.type === "digital_human" ? `<button class="button button-outline" data-knowledge-decision="add_digital_human" data-gap-type="${item.type}">补充数字人</button>` : ""}<button class="button button-outline" data-knowledge-decision="add_asset" data-gap-type="${item.type}">补充相应资产</button></article>`).join("")}<div class="decision-actions"><button class="button button-outline" data-knowledge-decision="continue_with_gap">不补充，继续生产</button><button class="button button-primary" data-knowledge-decision="adjust_plan">调整当前创意方案</button></div></section>` : `<section class="knowledge-ready-panel"><strong>资产校验通过</strong><p>所需类型和数量齐全，可以将资产快照写入创意方案。</p></section>`}
    </div>
    <div class="modal-foot"><button class="button button-outline" data-action="close-overlay">返回方案</button><button class="button button-primary" data-action="confirm-knowledge-assets"${hasGap ? " disabled" : ""}>${hasGap ? "等待运营决策" : `确认调用 ${result.selectedAssets.length} 个资产`}</button></div>
  </section></div>`;
}

export function renderKnowledgeSupplementModal(gapType, { digitalHumanOnly = false } = {}) {
  const type = digitalHumanOnly ? "digital_human" : gapType;
  return `<div class="overlay"><section class="modal compact-modal" role="dialog" aria-modal="true" aria-labelledby="supplement-title"><div class="modal-head"><div><h2 id="supplement-title">补充${labelFor(type)}</h2><p>补充后将重新执行过滤、排序和数量校验</p></div><button class="close-button" data-action="back-knowledge-result">×</button></div><div class="modal-body form-stack"><label>资产名称<input aria-label="补充资产名称" value="新增${labelFor(type)}"></label><label>适用标签<input aria-label="补充资产标签" value="数码, 真实, 轻促销"></label><div class="note-box">MVP 将新增资产写入本次任务的临时资产集；正式版本应进入知识库审核、授权和版本流程。</div></div><div class="modal-foot"><button class="button button-outline" data-action="back-knowledge-result">取消</button><button class="button button-primary" data-action="confirm-supplement-asset" data-gap-type="${type}">确认补充并重新校验</button></div></section></div>`;
}
