import { accounts, assets, knowledgeRows } from "./data.mjs";
import { badge, imageUrl, metric, pageHeader } from "./ui.mjs";
import { setState } from "./state.mjs";

const statusTone = (status) => status === "有效" || status === "正常" ? "green" : status.includes("冻结") || status.includes("失效") ? "red" : "orange";

export function renderKnowledge(state) {
  const categories = {
    common: ["频道库", "商品库", "品牌资产库", "风提库", "标签/文案库"],
    image: ["字体库", "图片风格库", "图片模板库", "Logo布局库", "背景/主体/构图库"],
    video: ["数字人库", "字幕模板库", "音色库", "BGM库", "转场库", "首帧/尾帧", "CTA组件", "视频结构/分镜"]
  };
  const rows = knowledgeRows[state.knowledgeType] || knowledgeRows.common;
  return `${pageHeader("知识库", "维护 Agent 可调用的公共、图片与视频知识资产，支持版本、权限与有效期", '<button class="button button-primary" data-action="new-knowledge">新增资产</button>')}
  <div class="knowledge-tabs">${[["common","公共知识"],["image","图片知识"],["video","视频知识"]].map(([key,label]) => `<button data-knowledge="${key}" class="${state.knowledgeType === key ? "active" : ""}">${label}</button>`).join("")}</div>
  <section class="data-panel">
    <div class="subnav">${categories[state.knowledgeType].map((item, index) => `<button class="${index === 0 ? "active" : ""}">${item}</button>`).join("")}</div>
    <div class="toolbar"><input placeholder="资产名称 / 标签 / 资产ID"><select><option>适用媒体</option></select><select><option>授权状态</option></select><select><option>资产状态</option></select><button class="button button-outline">导入</button><button class="button button-outline">导出</button></div>
    <table class="data-table"><thead><tr><th>资产名称</th><th>资产ID</th><th>资产类型</th><th>授权范围</th><th>版本</th><th>创建人</th><th>创建时间</th><th>失效时间</th><th>状态</th><th>操作</th></tr></thead><tbody>
      ${rows.map((row, index) => `<tr data-knowledge-row="${index}"><td><div class="asset-name-cell"><img src="${imageUrl(`knowledge-${row[1]}`, 120, 76)}" alt=""><strong>${row[0]}</strong></div></td><td>${row[1]}</td><td>${row[2]}</td><td>${row[3]}</td><td>${row[4]}</td><td>张小野</td><td>2025-06-01</td><td>${row[5] === "即将失效" ? "2025-07-31" : "2099-12-31"}</td><td>${badge(row[5], statusTone(row[5]))}</td><td><button class="link-button" data-action="edit-knowledge">编辑</button></td></tr>`).join("")}
    </tbody></table>
  </section><div id="overlay-root"></div>`;
}

function knowledgeDrawer() {
  return `<div class="drawer-backdrop"><aside class="drawer" role="dialog" aria-modal="true"><div class="drawer-head"><div><h2>编辑知识资产</h2><p>修改后资产 ID 不变，版本自动递增</p></div><button class="close-button" data-close>×</button></div><div class="drawer-body form-stack">
    <label>资产名称<input value="清透数码蓝"></label><label>资产标签<input value="科技感、数码、蓝色"></label><label>授权范围<select><option>全公司</option><option>品牌市场部</option></select></label><label>当前版本<input value="v2.1" readonly></label><label>失效时间<input type="date" placeholder="不填默认 2099-12-31"></label><label>参考图<div class="upload-box">点击上传参考图</div></label>
    <div class="note-box">已冻结任务继续使用知识资产快照；资产失效后不再被新任务召回。</div>
  </div><div class="drawer-foot"><button class="button button-outline">复制资产</button><button class="button button-primary" data-action="save-knowledge">保存修改并升版</button></div></aside></div>`;
}

const bars = (values, color = "blue") => `<div class="bar-chart" aria-label="指标趋势">${values.map((value, index) => `<div><span style="height:${value}%;--bar:${color}"></span><small>${index + 1}日</small></div>`).join("")}</div>`;

export function renderAnalytics() {
  const rows = assets.slice(0,5);
  return `${pageHeader("素材数据", "观察素材生产效率与投放表现，数据按日更新，不做单一创意因子归因", '<span class="updated">数据更新至 2025-07-18 10:00</span>')}
  <div class="toolbar floating"><button class="filter-chip active">全部</button><button class="filter-chip">图片</button><button class="filter-chip">视频</button><select><option>全部渠道</option></select><select><option>全部媒体</option></select><select><option>近30天</option><option>近7天</option><option>自定义</option></select><button class="button button-primary">查询</button></div>
  <div class="metric-grid six">${metric("采用率", "38.6%", "较前30天 +4.2%", "red")}${metric("跑出率", "12.8%", "较前30天 +1.3%", "red")}${metric("点击率", "3.42%", "较前30天 +0.28%", "red")}${metric("总CPA", "¥42.6", "较前30天 -8.6%", "green")}${metric("审核通过率", "87.4%", "较前30天 +2.1%", "red")}${metric("首次采用耗时", "1.8天", "较前30天 -0.3天", "green")}</div>
  <div class="analytics-grid"><section class="chart-panel"><div class="section-title"><strong>核心指标趋势</strong><div>${badge("采用率", "blue")} 跑出率 CTR 总CPA</div></div>${bars([46,38,54,43,51,48,57,61,55,69,49,58,62,54],"#1768ff")}</section>
    <section class="comparison-panel"><h3>图片 / 视频效果对比</h3><div class="compare-row"><span class="type-icon">图</span><strong>图片</strong><div><small>采用率</small><b>41.2%</b></div><div><small>跑出率</small><b>13.6%</b></div><div><small>样本量</small><b>842张</b></div>${badge("样本充足","green")}</div><div class="compare-row"><span class="type-icon">视</span><strong>视频</strong><div><small>采用率</small><b>32.9%</b></div><div><small>跑出率</small><b>10.4%</b></div><div><small>样本量</small><b>383条</b></div>${badge("样本充足","green")}</div></section></div>
  <section class="data-panel analytics-table"><div class="section-title"><strong>单素材数据</strong><button class="button button-outline">导出</button></div><table class="data-table"><thead><tr><th>日期</th><th>素材预览</th><th>素材ID</th><th>类型</th><th>渠道/媒体</th><th>消耗（总/U1/U2/U3）</th><th>曝光（总/U1/U2/U3）</th><th>点击</th><th>CTR</th><th>U总CPA</th><th>采用状态</th><th>跑出状态</th><th>样本状态</th></tr></thead><tbody>
  ${rows.map((asset) => `<tr><td>07-18</td><td><img class="tiny-thumb" src="${imageUrl(asset.seed, 100, 64)}" alt="${asset.title}"></td><td><button class="row-link">${asset.id}</button></td><td>${asset.type}</td><td>${asset.channel}/${asset.media}</td><td>18,442 / 7,201 / 6,189 / 5,052</td><td>562k / 210k / 188k / 164k</td><td>20,351</td><td>${asset.ctr}</td><td>${asset.cpa}</td><td>${badge("已采用","green")}</td><td>${badge("已跑出","green")}</td><td>${badge("样本充足","blue")}</td></tr>`).join("")}</tbody></table></section>`;
}

export function renderAccounts() {
  return `${pageHeader("账号管理", "管理员工权限、正式员工申请、代理商账号与素材下载记录", '<button class="button button-primary" data-action="new-partner">创建代理商账号</button>')}
  <section class="profile-card"><div class="profile-main"><span class="avatar large">张</span><div><h2>张小野 ${badge("管理员","blue")}</h2><p>工号 008631 · 增长运营中心</p></div></div><div>${badge("最近登录 2025-07-18 09:32","green")}</div></section>
  <div class="account-tabs"><button class="active">账号列表</button><button>员工申请 <span>6</span></button><button>代理商账号</button><button>代理商下载记录</button></div>
  <section class="data-panel"><div class="toolbar"><input placeholder="姓名 / 工号 / 账号"><select><option>全部身份</option></select><select><option>全部组织</option></select><select><option>全部状态</option></select><button class="button button-primary">查询</button></div>
  <table class="data-table"><thead><tr><th>姓名 / 工号</th><th>身份</th><th>组织</th><th>账号状态</th><th>最近登录</th><th>日志记录</th><th>操作</th></tr></thead><tbody>${accounts.map((row) => `<tr><td><strong>${row[0]}</strong></td><td>${badge(row[1], row[1] === "管理员" ? "blue" : row[1] === "代理商" ? "orange" : "green")}</td><td>${row[2]}</td><td>${badge(row[3], statusTone(row[3]))}</td><td>${row[4]}</td><td><button class="link-button">查看日志</button></td><td><button class="link-button">编辑</button></td></tr>`).join("")}</tbody></table></section><div id="overlay-root"></div>`;
}

function partnerDrawer() {
  return `<div class="drawer-backdrop"><aside class="drawer" role="dialog" aria-modal="true"><div class="drawer-head"><div><h2>创建代理商账号</h2><p>代理商仅可查看和下载被授权素材</p></div><button class="close-button" data-close>×</button></div><div class="drawer-body form-stack"><label>渠道<select><option>信息流</option></select></label><label>媒体<select><option>短视频媒体</option></select></label><label>代理商公司名称<input placeholder="请输入公司名称"></label><label>代理商姓名<input placeholder="请输入姓名"></label><label>手机号<input placeholder="请输入手机号"></label><label>登录账号<input value="partner_hd_001"></label><label>初始密码<input value="G7m!4pKq9@#2"></label><label>备注<textarea placeholder="请输入备注"></textarea></label><div class="note-box">密码查看和修改行为将记录日志。</div></div><div class="drawer-foot"><button class="button button-outline" data-close>取消</button><button class="button button-primary" data-action="save-partner">创建账号</button></div></aside></div>`;
}

export function renderPartnerAssets() {
  return `${pageHeader("授权素材", "仅展示当前账号仍在授权有效期内的素材")}
  <div class="partner-summary"><div><span>当前账号</span><strong>华东渠道合作商 · 赵一鸣</strong></div><div><span>可下载素材</span><strong>24 项</strong></div><div><span>最近授权</span><strong>2025-07-18 10:20</strong></div></div>
  <section class="library-panel"><div class="toolbar"><input placeholder="素材ID / 商品名称"><button class="filter-chip active">全部</button><button class="filter-chip">图片</button><button class="filter-chip">视频</button><select><option>全部媒体</option></select></div><div class="asset-grid">${assets.slice(0,4).map((asset) => `<article class="asset-card"><div class="asset-image"><img src="${imageUrl(asset.seed,620,390)}" alt="${asset.title}"><span>${asset.type}</span></div><div class="asset-info"><strong>${asset.id}</strong><h3>${asset.title}</h3><p>授权有效期至 2026-12-31</p><button class="button button-primary partner-download">下载素材</button></div></article>`).join("")}</div></section>`;
}

export function renderPartnerDownloads() {
  return `${pageHeader("下载记录", "查看当前账号的历史素材下载记录")}<section class="data-panel"><table class="data-table"><thead><tr><th>下载时间</th><th>素材ID</th><th>素材名称</th><th>类型</th><th>媒体</th><th>下载方式</th></tr></thead><tbody>${assets.slice(0,5).map((asset,index) => `<tr><td>2025-07-${18-index} 14:${32-index*3}</td><td>${asset.id}</td><td>${asset.title}</td><td>${asset.type}</td><td>${asset.media}</td><td>单素材下载</td></tr>`).join("")}</tbody></table></section>`;
}

export function bindBackoffice(route) {
  document.querySelectorAll("[data-knowledge]").forEach((button) => button.addEventListener("click", () => setState({ knowledgeType: button.dataset.knowledge })));
  document.querySelectorAll('[data-action="edit-knowledge"], [data-action="new-knowledge"]').forEach((button) => button.addEventListener("click", () => { document.querySelector("#overlay-root").innerHTML = knowledgeDrawer(); bindDrawer(); }));
  document.querySelector('[data-action="new-partner"]')?.addEventListener("click", () => { document.querySelector("#overlay-root").innerHTML = partnerDrawer(); bindDrawer(); });
  document.querySelectorAll(".partner-download").forEach((button) => button.addEventListener("click", () => setState({ toast: "素材下载成功，下载记录已同步" })));
}

function bindDrawer() {
  document.querySelectorAll("[data-close]").forEach((button) => button.addEventListener("click", () => { document.querySelector("#overlay-root").innerHTML = ""; }));
  document.querySelector('[data-action="save-knowledge"]')?.addEventListener("click", () => setState({ toast: "知识资产已保存为新版本 v2.2" }));
  document.querySelector('[data-action="save-partner"]')?.addEventListener("click", () => setState({ toast: "代理商账号已创建" }));
}
