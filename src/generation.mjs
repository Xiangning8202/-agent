import { products } from "./data.mjs";
import { badge, imageUrl, pageHeader } from "./ui.mjs";
import { getState, saveDraft, setState } from "./state.mjs";

const option = (label, selected = false) => `<button type="button" class="choice ${selected ? "selected" : ""}" data-choice>${label}</button>`;
const field = (label, value, extra = "") => `<label class="form-field"><span>${label}</span><input aria-label="${label}" value="${value}" ${extra}></label>`;
const selectField = (label, value, options = [value]) => `<label class="form-field"><span>${label}</span><select aria-label="${label}">${options.map((item) => `<option ${item === value ? "selected" : ""}>${item}</option>`).join("")}</select></label>`;

function agentPanel(type, state) {
  const isVideo = type === "video";
  return `<section class="agent-panel">
    <div class="panel-title"><div><strong>${isVideo ? "视频创意" : "创意"} Agent</strong><span class="online-dot"></span></div><button class="text-button" data-action="clear-chat">清空会话</button></div>
    <div class="agent-steps">
      ${["需求理解", "智能选品", isVideo ? "创意结构" : "创意方案", "预览确认", "批量任务"].map((name, index) => `<div class="${index < (isVideo ? 3 : 1) ? "done" : ""}"><span>${index + 1}</span><small>${name}</small></div>`).join("")}
    </div>
    <div class="conversation">
      ${state.conversationCleared ? `<div class="conversation-empty"><span class="bot-avatar">AI</span><div><strong>会话已清空</strong><p>输入新的投放需求即可重新开始。</p></div></div>` : `
      <div class="message agent"><span class="bot-avatar">AI</span><div>告诉我本次投放目标、渠道和希望生成的素材方向，我会分阶段帮你确认关键需求。</div></div>
      <div class="message user"><div>${isVideo ? "为近期热门数码商品生成10条竖版短视频，突出优惠感。" : "为近期热门数码商品做一批信息流图片，突出优惠感和点击转化。"}</div><span class="avatar small">李</span></div>
      <div class="message agent"><span class="bot-avatar">AI</span><div class="understanding"><strong>我对需求的理解</strong>
        <dl><dt>投放目标</dt><dd>优惠心智 + 点击转化</dd><dt>素材类型</dt><dd>${isVideo ? "竖版短视频" : "信息流图片"}</dd><dt>承接对象</dt><dd>商品</dd><dt>选品方式</dt><dd>按数码类目智能选品</dd></dl>
        <p>已识别主要风险：避免绝对化低价表达。</p>
      </div></div>
      <div class="field-diff">
        <div><strong>Agent 建议修改 2 个字段</strong><small>确认后才会写入右侧方案</small></div>
        <div class="diff-row"><span>CTA</span><del>立即购买</del><b>立即查看</b></div>
        <div class="diff-row"><span>画面氛围</span><del>强促销</del><b>真实、轻促销</b></div>
        <button class="button button-soft" data-action="apply-diff">应用全部修改</button>
      </div>
      `}
    </div>
    <div class="agent-input"><textarea aria-label="向 Agent 补充需求" placeholder="补充需求或要求 Agent 调整右侧方案…"></textarea><button class="send-button" data-action="send-agent">发送</button></div>
    <div class="agent-context" data-testid="agent-context">Agent 当前使用：最近保存的方案</div>
  </section>`;
}

function basicFields(type) {
  const video = type === "video";
  return `<section class="scheme-section">
    <h3><span>基础信息</span><small>媒体规格自动推导</small></h3>
    <div class="form-grid ${video ? "five" : ""}">
      ${field("任务名称", video ? "7月数码优惠视频投放" : "7月数码优惠图片投放")}
      ${selectField("渠道", "信息流", ["信息流", "DSP", "种草", "厂商"])}
      ${selectField("媒体", "短视频媒体", ["短视频媒体", "腾讯广告", "百度"])}
      ${field(video ? "视频尺寸" : "推荐尺寸", video ? "9:16" : "1080 × 1440", "readonly")}
      ${video ? selectField("视频长度", "25秒", ["15秒", "25秒", "30秒"]) : ""}
      ${field("单商品生成素材数", video ? "2" : "3", 'type="number" min="1"')}
    </div>
  </section>`;
}

function landingSection() {
  return `<section class="scheme-section">
    <h3><span>素材承接</span><small>预计商品 8 个</small></h3>
    <div class="landing-row"><div class="inline-label">承接对象</div>${option("商品", true)}${option("频道")}</div>
    <div class="landing-row"><div class="inline-label">选品方式</div>${option("AI智能选品")}${option("按类目智能选品", true)}${option("指定商品ID")}<button class="link-button" data-action="manage-products">管理商品 List</button></div>
    <div class="landing-row"><div class="inline-label">类目选择</div>${option("手机数码", true)}${option("电脑办公", true)}${option("智能穿戴", true)}</div>
  </section>`;
}

function imageScheme() {
  return `<section class="scheme-section">
    <h3><span>图片创意方案</span><small>结构化字段可直接编辑</small></h3>
    <div class="creative-grid">
      <div class="tag-field"><span>画面主体</span><div>${option("商品特写", true)}${option("真实使用场景", true)}</div></div>
      ${selectField("Logo位置", "右上角", ["左上角", "左下角", "右上角", "右下角", "弱化透出"])}
      <div class="tag-field"><span>商品展示</span><div>${option("前后对比", true)}${option("细节展示", true)}</div></div>
      <div class="tag-field"><span>价格表达</span><div>${option("限时优惠", true)}${option("券后价")}</div></div>
      ${field("主文案", "限时好价，喜欢就别错过")}
      ${selectField("背景风格", "真实生活场景", ["真实生活场景", "干净棚拍", "轻促销背景"])}
      ${field("副文案", "品质好物，轻松入手")}
      ${selectField("画面氛围", "真实、轻促销", ["真实、轻促销", "年轻化", "生活感"])}
      ${field("CTA", "立即查看")}
      ${selectField("品牌", "平台品牌", ["平台品牌", "频道品牌"])}
      <div class="tag-field"><span>标签</span><div>${option("科技感", true)}${option("优惠感", true)}${option("年轻化")}</div></div>
      ${selectField("风提", "清透数码蓝", ["清透数码蓝", "真实家居", "极简科技黑"])}
    </div>
  </section>`;
}

function videoScheme() {
  const rows = [
    ["1", "0-3秒", "Hook", "价格对比大字弹出", "换新机只要原价20%", "现在换新划算吗？"],
    ["2", "3-8秒", "玩法", "手机旧机验货，屏幕轻微划痕", "旧机回收三步完成", "估价、寄出、收款"],
    ["3", "8-15秒", "利益点", "权益卡片与商品同屏", "多卖20%，还能叠加券", "平台回收更省心"],
    ["4", "15-25秒", "CTA", "商品合集与行动按钮", "爆款新机低至XX元起", "立即查看优惠"]
  ];
  return `<section class="scheme-section">
    <h3><span>视频风格</span><small>多选后由 Agent 为商品分配一个风格</small></h3>
    <div class="landing-row">${option("商品展示", true)}${option("对比分析", true)}${option("场景种草")}${option("问题解决")}<button class="button button-soft" data-action="confirm-style">确认风格</button></div>
  </section>
  <section class="scheme-section">
    <h3><span>视频创意结构</span><small>整体叙事方向</small></h3>
    <div class="structure-grid">
      ${field("Hook", "价格反差开场")}
      ${field("玩法", "闲置旧机回收换新")}
      ${field("利益点", "验货报告 + 买家好评")}
      ${field("CTA", "立即查看")}
    </div>
  </section>
  <section class="scheme-section">
    <h3><span>分镜脚本</span><button class="text-button" data-action="toggle-storyboard">收起</button></h3>
    <div class="table-wrap" data-storyboard><table><thead><tr><th>镜头</th><th>时长</th><th>镜头目标</th><th>画面</th><th>字幕</th><th>口播</th></tr></thead><tbody>${rows.map((row) => `<tr>${row.map((cell) => `<td>${cell}</td>`).join("")}</tr>`).join("")}</tbody></table></div>
  </section>
  <section class="scheme-section">
    <h3><span>视频组件配置</span><small>用于最终工程合成</small></h3>
    <div class="component-grid">
      ${selectField("首帧", "优惠反差首帧", ["优惠反差首帧", "商品特写首帧", "真实场景首帧"])}
      ${selectField("数字人", "清爽青年", ["清爽青年", "专业讲解员", "不使用数字人"])}
      ${selectField("品牌", "平台品牌", ["平台品牌", "频道品牌", "商品品牌"])}
      ${selectField("Logo位置", "右上角", ["左上角", "左下角", "右上角", "右下角", "弱化透出"])}
      ${selectField("标签", "优惠感", ["优惠感", "科技感", "年轻化", "不使用标签"])}
      ${selectField("BGM", "轻快电子", ["轻快电子", "温暖治愈", "动感节奏", "不使用BGM"])}
      ${selectField("转场", "快速推拉", ["快速推拉", "淡入淡出", "硬切", "无转场"])}
      ${selectField("音色", "活力男声", ["活力男声", "清晰女声", "沉稳男声"])}
      ${selectField("字幕模板", "重点词高亮", ["重点词高亮", "简洁白字", "品牌色描边"])}
      ${selectField("字幕渲染", "逐字出现", ["逐字出现", "整句出现", "重点词弹入"])}
      ${selectField("CTA展示方式", "尾帧行动按钮", ["尾帧行动按钮", "口播加字幕", "全程弱提示"])}
    </div>
  </section>`;
}

function summary(type) {
  return `<aside class="config-summary"><strong>本次配置</strong><dl><dt>预计商品</dt><dd>8个</dd><dt>预计生成</dt><dd>${type === "video" ? "16条" : "24张"}</dd><dt>预览</dt><dd>1${type === "video" ? "条" : "张"}</dd><dt>预计耗时</dt><dd>${type === "video" ? "35分钟" : "12分钟"}</dd></dl></aside>`;
}

export function renderGeneration(type, state = getState()) {
  const video = type === "video";
  const title = video ? "视频素材生成" : "图片素材生成";
  return `${pageHeader(title, video ? "通过结构化创意与分镜脚本，生成可审核、可合成的视频广告素材" : "用自然语言描述投放诉求，Agent 将协助完成需求确认、智能选品与创意方案配置", '<button class="guide-button" data-action="guide">查看操作指南</button>')}
  <div class="mode-tabs"><button class="${state.generationMode === "native" ? "active" : ""}" data-mode="native">AI原生素材</button><button class="${state.generationMode === "replica" ? "active" : ""}" data-mode="replica">爆款复刻素材</button></div>
  ${state.generationMode === "replica" ? `<div class="replica-strip"><div><strong>${video ? "上传参考视频或输入视频 URL" : "上传 JPG、PNG 或输入图片 URL"}</strong><p>模型将解析结构、文案、主体、风格和风险点，低置信字段需要运营确认。</p></div><button class="button button-primary" data-action="parse-replica">上传并解析</button></div>` : ""}
  <div class="generation-grid">
    ${agentPanel(type, state)}
    <section class="scheme-panel">
      <div class="panel-title"><div><strong>${video ? "AI视频方案" : "AI素材方案"}</strong>${badge("草稿 · 待确认", "orange")}</div><button class="text-button" data-action="field-help">查看字段说明</button></div>
      <div class="scheme-scroll">${basicFields(type)}${landingSection()}${video ? videoScheme() : imageScheme()}</div>
      <div class="scheme-actions"><span>需求确认后可生成预览</span><button class="button button-outline" data-action="save-draft">保存草稿</button><button class="button button-primary" data-action="preview">生成1个预览${video ? "视频" : "素材"}</button></div>
      ${summary(type)}
    </section>
  </div>
  <div id="overlay-root"></div>`;
}

function productModal() {
  return `<div class="overlay"><section class="modal large" role="dialog" aria-modal="true" aria-labelledby="product-title"><div class="modal-head"><div><h2 id="product-title">管理商品 List</h2><p>本任务共 8 个商品，页面展示示例商品</p></div><button class="close-button" data-action="close-overlay">×</button></div>
    <div class="modal-tools"><input aria-label="搜索商品" placeholder="按商品标题搜索召回"><button class="button button-outline" data-action="search-product">搜索商品</button><button class="button button-outline" data-action="download-products">下载 Excel</button></div>
    <table><thead><tr><th>商品ID</th><th>商品标题</th><th>类目</th><th>来源</th><th>推荐原因</th><th>操作</th></tr></thead><tbody>${products.map((item) => `<tr data-product-name="${item.name}"><td>${item.id}</td><td>${item.name}</td><td>${item.category}</td><td>${item.origin === "agent" ? badge("Agent推荐", "blue") : badge("人工添加", "green")}</td><td>${item.reason}</td><td><button class="link-button" data-action="remove-product">删除</button></td></tr>`).join("")}</tbody></table>
    <div class="modal-foot"><button class="button button-outline" data-action="close-overlay">取消</button><button class="button button-primary" data-action="close-overlay">确认商品清单</button></div></section></div>`;
}

function previewModal(type) {
  const video = type === "video";
  return `<div class="overlay"><section class="modal preview-modal" role="dialog" aria-modal="true" aria-labelledby="preview-title"><div class="modal-head"><div><h2 id="preview-title">${video ? "视频" : "图片"}预览素材</h2><p>Agent 推荐代表商品：轻薄旗舰笔记本，可在生成前更换</p></div><button class="close-button" data-action="close-overlay">×</button></div>
    <div class="preview-body"><img src="${imageUrl(video ? "./src/assets/eval-images/IMG-005.png" : "./src/assets/eval-images/IMG-012.png", 900, 560)}" alt="代表商品预览素材"><div class="preview-notes"><strong>预览检查</strong><ul><li>优惠利益点表达清楚</li><li>Logo 位于媒体安全区</li><li>未发现绝对化低价表达</li></ul>${badge("预计通过率 87%", "green")}</div></div>
    <div class="modal-foot"><button class="button button-outline" data-action="change-product">更换代表商品</button><button class="button button-outline" data-action="close-overlay">返回修改方案</button><button class="button button-primary" data-action="start-batch">确认预览并开始批量任务</button></div></section></div>`;
}

function replicaModal(type) {
  const video = type === "video";
  return `<div class="overlay"><section class="modal" role="dialog" aria-modal="true" aria-labelledby="replica-title"><div class="modal-head"><div><h2 id="replica-title">上传并解析${video ? "视频" : "图片"}参考素材</h2><p>解析结构、文案、主体、风格和风险点，确认后写入右侧方案</p></div><button class="close-button" data-action="close-overlay">×</button></div><div class="modal-body form-stack"><label>上传文件<input type="file" accept="${video ? "video/*" : "image/png,image/jpeg"}"></label><div class="replica-divider">或</div><label>参考素材 URL<input type="url" placeholder="https://example.com/reference.${video ? "mp4" : "png"}"></label><div class="note-box">${video ? "支持视频文件或可访问的视频 URL" : "支持 JPG、PNG 或可访问的图片 URL"}；低置信字段会标记为待确认。</div></div><div class="modal-foot"><button class="button button-outline" data-action="close-overlay">取消</button><button class="button button-primary" data-action="confirm-parse">开始解析</button></div></section></div>`;
}

function infoModal(kind) {
  const guide = kind === "guide";
  return `<div class="overlay"><section class="modal" role="dialog" aria-modal="true" aria-labelledby="info-title"><div class="modal-head"><div><h2 id="info-title">${guide ? "素材生成操作指南" : "方案字段说明"}</h2><p>${guide ? "按以下步骤完成一次可追溯的素材任务" : "字段可人工编辑，也可由 Agent 提议修改"}</p></div><button class="close-button" data-action="close-overlay">×</button></div><div class="info-list">${guide ? `<div><b>1</b><span><strong>描述投放需求</strong><small>说明目标、渠道、媒体和素材方向</small></span></div><div><b>2</b><span><strong>确认商品与方案</strong><small>检查 Agent 选品和结构化字段</small></span></div><div><b>3</b><span><strong>预览后批量生成</strong><small>确认代表素材，再创建批量任务</small></span></div>` : `<dl class="detail-list"><dt>只读字段</dt><dd>由渠道和媒体规格自动推导</dd><dt>方案字段</dt><dd>人工编辑后以右侧当前值为准</dd><dt>Agent 建议</dt><dd>只有点击“应用修改”才写入方案</dd><dt>保存草稿</dt><dd>保存后 Agent 才会使用最新方案上下文</dd></dl>`}</div><div class="modal-foot"><button class="button button-primary" data-action="close-overlay">知道了</button></div></section></div>`;
}

export function bindGeneration(type) {
  document.querySelectorAll("[data-mode]").forEach((button) => button.addEventListener("click", () => setState({ generationMode: button.dataset.mode })));
  document.querySelector('[data-action="save-draft"]')?.addEventListener("click", () => saveDraft(type, { title: document.querySelector('[aria-label="任务名称"]')?.value, saved: true }));
  document.querySelector('[data-action="manage-products"]')?.addEventListener("click", () => { document.querySelector("#overlay-root").innerHTML = productModal(); bindOverlay(); });
  document.querySelector('[data-action="preview"]')?.addEventListener("click", () => { document.querySelector("#overlay-root").innerHTML = previewModal(type); bindOverlay(); });
  document.querySelector('[data-action="parse-replica"]')?.addEventListener("click", () => {
    document.querySelector("#overlay-root").innerHTML = replicaModal(type);
    bindOverlay();
  });
  document.querySelector('[data-action="apply-diff"]')?.addEventListener("click", () => setState({ toast: "已应用 2 项 Agent 修改" }));
  document.querySelector('[data-action="send-agent"]')?.addEventListener("click", () => setState({ conversationCleared: false, toast: "Agent 已收到补充需求，正在生成字段差异" }));
  document.querySelector('[data-action="clear-chat"]')?.addEventListener("click", () => setState({ conversationCleared: true, toast: "会话已清空，可重新输入需求" }));
  document.querySelector('[data-action="guide"]')?.addEventListener("click", () => { document.querySelector("#overlay-root").innerHTML = infoModal("guide"); bindOverlay(); });
  document.querySelector('[data-action="field-help"]')?.addEventListener("click", () => { document.querySelector("#overlay-root").innerHTML = infoModal("fields"); bindOverlay(); });
  document.querySelector('[data-action="confirm-style"]')?.addEventListener("click", () => setState({ toast: "视频风格已确认，Agent 将按商品自动分配" }));
  document.querySelector('[data-action="toggle-storyboard"]')?.addEventListener("click", (event) => {
    const storyboard = document.querySelector("[data-storyboard]");
    storyboard?.classList.toggle("collapsed");
    event.currentTarget.textContent = storyboard?.classList.contains("collapsed") ? "展开" : "收起";
  });
  document.querySelectorAll("[data-choice]").forEach((button) => button.addEventListener("click", () => button.classList.toggle("selected")));
}

function bindOverlay() {
  document.querySelectorAll('[data-action="close-overlay"]').forEach((button) => button.addEventListener("click", () => { document.querySelector("#overlay-root").innerHTML = ""; }));
  document.querySelector('[data-action="start-batch"]')?.addEventListener("click", () => setState({ route: "tasks", toast: "批量任务已创建，可在任务进度中查看" }));
  document.querySelector('[data-action="search-product"]')?.addEventListener("click", () => {
    const query = document.querySelector('[aria-label="搜索商品"]')?.value.trim() || "";
    document.querySelectorAll("[data-product-name]").forEach((row) => { row.hidden = query && !row.dataset.productName.includes(query); });
  });
  document.querySelectorAll('[data-action="remove-product"]').forEach((button) => button.addEventListener("click", () => button.closest("tr")?.remove()));
  document.querySelector('[data-action="download-products"]')?.addEventListener("click", () => setState({ toast: "商品清单 Excel 已生成" }));
  document.querySelector('[data-action="change-product"]')?.addEventListener("click", () => setState({ toast: "已切换为降噪真无线耳机作为代表商品" }));
  document.querySelector('[data-action="confirm-parse"]')?.addEventListener("click", () => setState({ toast: "解析完成：3 个低置信字段已标记，右侧方案已更新" }));
}
