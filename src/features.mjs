import { pageHeader, emptyState } from "./ui.mjs";
import { bindGeneration, renderGeneration } from "./generation.mjs";
import { bindOperations, renderAudits, renderLibrary, renderTasks } from "./operations.mjs";
import { bindBackoffice, renderAccounts, renderAnalytics, renderKnowledge, renderPartnerAssets, renderPartnerDownloads } from "./backoffice.mjs";

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
  return `${pageHeader("工作台准备中", "模块化界面正在载入")} ${emptyState("基础框架已就绪", `当前路由：${state.route}`)}`;
}

export function bindRoute(state) {
  if (state.route === "image") bindGeneration("image");
  if (state.route === "video") bindGeneration("video");
  if (["tasks", "audits", "library"].includes(state.route)) bindOperations(state.route);
  if (["knowledge", "analytics", "accounts", "partner-assets", "partner-downloads"].includes(state.route)) bindBackoffice(state.route);
}
