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
  return `https://picsum.photos/seed/${encodeURIComponent(seed)}/${width}/${height}`;
}
