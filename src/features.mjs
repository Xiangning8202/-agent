import { pageHeader, emptyState } from "./ui.mjs";
import { bindGeneration, renderGeneration } from "./generation.mjs";
import { bindOperations, renderAudits, renderLibrary, renderTasks } from "./operations.mjs";
import { bindBackoffice, renderAccounts, renderAnalytics, renderKnowledge, renderPartnerAssets, renderPartnerDownloads } from "./backoffice.mjs";
import { assets, knowledgeRows, tasks } from "./data.mjs";
import { badge, escapeHtml, imageUrl } from "./ui.mjs";
import { setState } from "./state.mjs";

function renderSearchResults(state) {
  const query = (state.globalSearchQuery || "").trim().toLowerCase();
  const includes = (value) => !query || String(value).toLowerCase().includes(query);
  const taskResults = tasks.filter((item) => includes(`${item.name} ${item.id} ${item.owner}`));
  const assetResults = assets.filter((item) => includes(`${item.title} ${item.id} ${item.taskId}`));
  const knowledgeResults = Object.values(knowledgeRows).flat().filter((row) => includes(row.join(" ")));
  return `${pageHeader(`“${escapeHtml(state.globalSearchQuery || "全部")}”的搜索结果`, "统一查找任务、素材和知识资产")}
    <div class="search-results">
      <section class="result-section"><div class="section-title"><strong>任务</strong>${badge(`${taskResults.length} 条`, "blue")}</div>${taskResults.slice(0, 5).map((task) => `<button class="result-row" data-search-route="tasks"><span><b>${task.name}</b><small>${task.id} · ${task.status}</small></span><em>查看任务</em></button>`).join("") || '<div class="table-empty">没有匹配任务</div>'}</section>
      <section class="result-section"><div class="section-title"><strong>素材</strong>${badge(`${assetResults.length} 条`, "green")}</div><div class="result-assets">${assetResults.slice(0, 6).map((asset) => `<button data-search-route="library"><img src="${imageUrl(asset.source, 120, 90)}" alt=""><span><b>${asset.title}</b><small>${asset.id}</small></span></button>`).join("") || '<div class="table-empty">没有匹配素材</div>'}</div></section>
      <section class="result-section"><div class="section-title"><strong>知识资产</strong>${badge(`${knowledgeResults.length} 条`, "orange")}</div>${knowledgeResults.slice(0, 5).map((row) => `<button class="result-row" data-search-route="knowledge"><span><b>${row[0]}</b><small>${row[1]} · ${row[2]}</small></span><em>查看资产</em></button>`).join("") || '<div class="table-empty">没有匹配知识资产</div>'}</section>
    </div>`;
}

function bindSearchResults() {
  document.querySelectorAll("[data-search-route]").forEach((button) => button.addEventListener("click", () => setState({ route: button.dataset.searchRoute })));
}

export function renderRoute(state) {
  if (state.route === "image") return renderGeneration("image", state);
  if (state.route === "video") return renderGeneration("video", state);
  if (state.route === "tasks") return renderTasks(state);
  if (state.route === "audits") return renderAudits(state);
  if (state.route === "library") return renderLibrary(state);
  if (state.route === "knowledge") return renderKnowledge(state);
  if (state.route === "analytics") return renderAnalytics(state);
  if (state.route === "accounts") return renderAccounts(state);
  if (state.route === "partner-assets") return renderPartnerAssets(state);
  if (state.route === "partner-downloads") return renderPartnerDownloads(state);
  if (state.route === "search-results") return renderSearchResults(state);
  return `${pageHeader("工作台准备中", "模块化界面正在载入")} ${emptyState("基础框架已就绪", `当前路由：${state.route}`)}`;
}

export function bindRoute(state) {
  if (state.route === "image") bindGeneration("image");
  if (state.route === "video") bindGeneration("video");
  if (["tasks", "audits", "library"].includes(state.route)) bindOperations(state.route, state);
  if (["knowledge", "analytics", "accounts", "partner-assets", "partner-downloads"].includes(state.route)) bindBackoffice(state.route);
  if (state.route === "search-results") bindSearchResults();
}
