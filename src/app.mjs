import { canView, getState, roles, setRole, setState, subscribe } from "./state.mjs";
import { navItems, partnerNav } from "./data.mjs";
import { pageHeader } from "./ui.mjs";

const app = document.querySelector("#app");

const labels = {
  image: ["图片素材生成", "用自然语言描述投放诉求，Agent 将协助完成需求确认、智能选品与创意方案配置"],
  video: ["视频素材生成", "通过结构化创意与分镜脚本，生成可审核、可合成的视频广告素材"],
  tasks: ["任务进度", "查看预览任务与批量生成任务的实时状态和异常原因"],
  audits: ["审核管理", "查看外部审核中台同步的任务与单素材审核结果"],
  library: ["素材库", "统一管理审核通过后的图片与视频素材，支持筛选、授权与导出"],
  knowledge: ["知识库", "维护 Agent 可调用的公共、图片与视频知识资产"],
  analytics: ["素材数据", "观察素材生产效率与投放表现，不做单一创意因子归因"],
  accounts: ["账号管理", "管理员工权限、代理商账号及素材下载记录"],
  "partner-assets": ["授权素材", "查看和下载当前账号仍在授权有效期内的素材"],
  "partner-downloads": ["下载记录", "查看当前代理商账号的历史素材下载记录"]
};

function shell(state) {
  const user = roles[state.role];
  const items = state.role === "partner" ? partnerNav : navItems;
  const [title, desc] = labels[state.route] || ["创意智造台", ""];
  return `
    <div class="app-shell">
      <header class="topbar">
        <div class="brand"><span class="brand-mark">✦</span><strong>创意智造台</strong><span class="brand-divider"></span><span class="breadcrumb">AI 广告素材生产工作台</span></div>
        <div class="top-actions">
          <button class="icon-button" aria-label="搜索">⌕</button>
          <button class="icon-button" aria-label="帮助">?</button>
          <button class="icon-button notification" aria-label="通知">◌</button>
          <div class="user-switcher">
            <span class="avatar">${user.name.slice(0, 1)}</span>
            <span><strong>${user.name}</strong><small>${user.roleLabel}</small></span>
            <select id="role-switch" aria-label="切换演示角色">
              ${Object.entries(roles).map(([key, item]) => `<option value="${key}" ${state.role === key ? "selected" : ""}>${item.roleLabel}</option>`).join("")}
            </select>
          </div>
        </div>
      </header>
      <aside class="sidebar">
        <nav>${items.map(([route, label, icon]) => `<button class="nav-item ${state.route === route ? "active" : ""}" data-route="${route}"><span>${icon}</span>${label}</button>`).join("")}</nav>
        <div class="service-status"><span></span>服务正常</div>
      </aside>
      <main class="content" id="content">
        ${pageHeader(title, desc)}
        <section class="loading-panel"><div class="skeleton wide"></div><div class="skeleton"></div><div class="skeleton"></div></section>
      </main>
      <div class="toast ${state.toast ? "show" : ""}" role="status">${state.toast || ""}</div>
    </div>`;
}

async function render() {
  const state = getState();
  if (!canView(state.route, state.role)) {
    setState({ route: state.role === "partner" ? "partner-assets" : "image" });
    return;
  }
  app.innerHTML = shell(state);
  document.querySelectorAll("[data-route]").forEach((button) => button.addEventListener("click", () => setState({ route: button.dataset.route, drawer: null, modal: null })));
  document.querySelector("#role-switch")?.addEventListener("change", (event) => setRole(event.target.value));
  const content = document.querySelector("#content");
  try {
    const module = await import("./features.mjs");
    content.innerHTML = module.renderRoute(getState());
    module.bindRoute?.(getState());
  } catch (error) {
    content.innerHTML = `${pageHeader("页面暂时不可用", "请刷新后重试")}<div class="error-box">${error.message}</div>`;
    console.error(error);
  }
}

subscribe(render);
render();
