import { navItems, partnerNav } from "./data.mjs";
import { roles } from "./state.mjs";

export const escapeHtml = (value = "") => String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[char]);

export function badge(label, tone = "blue") {
  return `<span class="badge badge-${tone}">${escapeHtml(label)}</span>`;
}

export function progress(value) {
  return `<div class="progress" aria-label="进度 ${value}%"><span style="width:${Math.max(0, Math.min(100, value))}%"></span></div>`;
}

export function metric(label, value, delta = "", tone = "") {
  return `<article class="metric-card"><div class="metric-label">${label}</div><strong>${value}</strong>${delta ? `<small class="${tone}">${delta}</small>` : ""}</article>`;
}

export function pageHeader(title, description, action = "") {
  return `<div class="page-header"><div><h1>${title}</h1><p>${description}</p></div>${action}</div>`;
}

export function emptyState(title, text) {
  return `<div class="empty-state"><div class="empty-symbol">◇</div><h3>${title}</h3><p>${text}</p></div>`;
}

export function imageUrl(seed, width = 760, height = 480) {
  if (String(seed).startsWith("./src/")) return String(seed);
  return `https://picsum.photos/seed/${encodeURIComponent(seed)}/${width}/${height}`;
}

const routeLabels = {
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

const iconUrl = (path) => path.startsWith("./") ? path.slice(1) : path;
const icon = (path, className = "header-icon") => `<span class="${className}" style="--icon:url('${iconUrl(path)}')" aria-hidden="true"></span>`;

function topPanel(name) {
  if (name === "search") {
    return `<section class="top-popover search-popover" aria-label="全局搜索"><div class="popover-head"><strong>全局搜索</strong><button class="close-button small" data-close-top>×</button></div><label class="global-search"><span class="header-icon" style="--icon:url('./src/assets/icons/search.svg')" aria-hidden="true"></span><input autofocus data-global-search placeholder="搜索任务、素材或知识资产" aria-label="全局搜索关键词"><button class="button button-primary compact" data-action="global-search">搜索</button></label><div class="quick-links"><button data-route="tasks">任务进度</button><button data-route="library">素材库</button><button data-route="knowledge">知识库</button></div></section>`;
  }
  if (name === "help") {
    return `<section class="top-popover" aria-label="帮助中心"><div class="popover-head"><strong>帮助中心</strong><button class="close-button small" data-close-top>×</button></div><div class="help-list"><button data-route="image"><b>01</b><span>创建图片素材<small>从需求到预览的完整流程</small></span></button><button data-route="video"><b>02</b><span>创建视频素材<small>配置结构、分镜和组件</small></span></button><button data-route="tasks"><b>03</b><span>处理失败任务<small>查看原因并重试失败素材</small></span></button></div></section>`;
  }
  if (name === "notifications") {
    return `<section class="top-popover" aria-label="通知中心"><div class="popover-head"><strong>通知中心</strong><button class="close-button small" data-close-top>×</button></div><div class="notification-list"><button data-route="tasks"><span class="notice-dot blue"></span><span><b>批量任务已部分完成</b><small>3 个失败素材可单独重试 · 5分钟前</small></span></button><button data-route="tasks" data-open-audit-task="TASK-20250715-0003"><span class="notice-dot orange"></span><span><b>1 个素材审核被驳回</b><small>进入对应任务查看审核明细 · 18分钟前</small></span></button><button data-route="library"><span class="notice-dot green"></span><span><b>素材已完成入库</b><small>本次新增 14 个可投放素材 · 1小时前</small></span></button></div></section>`;
  }
  return "";
}

export function renderShell(state) {
  const user = roles[state.role];
  const items = state.role === "partner" ? partnerNav : navItems;
  const [title, description] = routeLabels[state.route] || ["创意智造台", ""];
  return `
    <div class="app-shell">
      <header class="topbar">
        <div class="brand"><span class="brand-mark">${icon("./src/assets/icons/sparkles.svg", "brand-icon")}</span><strong>创意智造台</strong><span class="brand-divider"></span><span class="breadcrumb">AI 广告素材生产工作台</span></div>
        <div class="top-actions">
          <button class="icon-button ${state.topPanel === "search" ? "active" : ""}" data-top-panel="search" aria-label="搜索">${icon("./src/assets/icons/search.svg")}</button>
          <button class="icon-button ${state.topPanel === "help" ? "active" : ""}" data-top-panel="help" aria-label="帮助">${icon("./src/assets/icons/circle-help.svg")}</button>
          <button class="icon-button notification ${state.topPanel === "notifications" ? "active" : ""}" data-top-panel="notifications" aria-label="通知">${icon("./src/assets/icons/bell.svg")}</button>
          <div class="user-switcher">
            <span class="avatar">${user.name.slice(0, 1)}</span>
            <span><strong>${user.name}</strong><small>${user.roleLabel}</small></span>
            <select id="role-switch" aria-label="切换演示角色">
              ${Object.entries(roles).map(([key, item]) => `<option value="${key}" ${state.role === key ? "selected" : ""}>${item.roleLabel}</option>`).join("")}
            </select>
          </div>
        </div>
        ${topPanel(state.topPanel)}
      </header>
      <aside class="sidebar">
        <nav>${items.map(([route, label, iconPath]) => `<button class="nav-item ${state.route === route ? "active" : ""}" data-route="${route}">${icon(iconPath, "nav-icon")}${label}</button>`).join("")}</nav>
        <div class="service-status"><span></span>服务正常</div>
      </aside>
      <main class="content" id="content">
        ${pageHeader(title, description)}
        <section class="loading-panel"><div class="skeleton wide"></div><div class="skeleton"></div><div class="skeleton"></div></section>
      </main>
      <div class="toast ${state.toast ? "show" : ""}" role="status">${state.toast || ""}</div>
    </div>`;
}
