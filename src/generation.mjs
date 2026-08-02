import { products } from "./data.mjs";
import { loadKnowledgeCatalog, runKnowledgeAgent } from "./knowledge-base/agent.mjs";
import { renderKnowledgeAgentModal, renderKnowledgeSupplementModal } from "./knowledge-base/ui.mjs";
import { filterAndRankProducts, PRODUCT_QUALITY_RULES } from "./product-selection.mjs";
import { badge, imageUrl, pageHeader } from "./ui.mjs";
import { getState, saveDraft, setState } from "./state.mjs";

const option = (label, selected = false) => `<button type="button" class="choice ${selected ? "selected" : ""}" data-choice>${label}</button>`;
const field = (label, value, extra = "") => `<label class="form-field"><span>${label}</span><input aria-label="${label}" value="${value}" ${extra}></label>`;
const selectField = (label, value, options = [value]) => `<label class="form-field"><span>${label}</span><select aria-label="${label}">${options.map((item) => `<option ${item === value ? "selected" : ""}>${item}</option>`).join("")}</select></label>`;

const escapeHtml = (value = "") => String(value).replace(/[&<>"']/g, (character) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
}[character]));

export function isAgentSubmitKey(event) {
  return event?.key === "Enter" && !event.shiftKey && !event.isComposing;
}

export function buildKnowledgeAgentInput(type, selectedProducts = []) {
  return {
    taskType: type === "video" ? "video" : "image",
    requirement: {
      channel: "信息流",
      brand: "平台品牌",
      aspectRatio: type === "video" ? "9:16" : "4:5",
      styleTags: type === "video" ? ["真实", "轻促销", "数码", "快节奏"] : ["真实", "轻促销", "数码", "商品特写"],
      categories: [...new Set(selectedProducts.map((item) => item.category).filter(Boolean))]
    },
    products: selectedProducts
  };
}

export function buildRequirementClarification(type, { clarificationResolved = false } = {}) {
  const video = type === "video";
  const resolvedValue = (pending, resolved) => clarificationResolved ? resolved : pending;
  const resolvedStatus = clarificationResolved ? "confirmed" : "missing";
  const dimensions = [
    { group: "目标与衡量", label: "业务目标", value: "优惠心智 + 点击转化", status: "known" },
    { group: "目标与衡量", label: "核心KPI", value: "CTR优先，兼顾落地页转化", status: "inferred" },
    { group: "人群与场景", label: "目标人群", value: resolvedValue("待补充", "18–35岁、近期浏览数码商品的价格敏感用户"), status: resolvedStatus },
    { group: "人群与场景", label: "使用场景", value: resolvedValue("待补充", "暑期焕新、通勤与居家换机场景"), status: resolvedStatus },
    { group: "商品与利益", label: "承接对象", value: "商品详情页", status: "known" },
    { group: "商品与利益", label: "商品范围", value: "近期热门手机、电脑与智能穿戴", status: "known" },
    { group: "商品与利益", label: "核心利益点", value: "限时优惠 + 品质保障", status: "inferred" },
    { group: "商品与利益", label: "信任证据", value: resolvedValue("待补充", "平台验真、用户评价与售后保障"), status: resolvedStatus },
    { group: "投放与规格", label: "渠道媒体", value: video ? "信息流 / 短视频媒体" : "信息流 / 效果广告媒体", status: "known" },
    { group: "投放与规格", label: "版位与规格", value: video ? "竖版9:16，移动端安全区" : "竖版4:5，移动端信息流", status: "inferred" },
    { group: "表达与品牌", label: "信息优先级", value: "优惠利益点 > 商品主体 > 行动引导", status: "inferred" },
    { group: "表达与品牌", label: "品牌调性", value: "真实、可信、轻促销", status: "inferred" },
    { group: "表达与品牌", label: "品牌资产", value: resolvedValue("待补充", "平台Logo、标准品牌蓝与商品白底图"), status: resolvedStatus },
    { group: "执行与风险", label: "合规边界", value: "避免绝对低价、夸大功效与虚假稀缺", status: "known" },
    { group: "执行与风险", label: "交付排期", value: resolvedValue("待补充", "活动前3个工作日完成首批交付"), status: resolvedStatus },
    { group: "执行与风险", label: "数量与变体", value: video ? "Top10商品 × 2条，共20条" : "Top10商品 × 3张，共30张", status: "known" }
  ];

  if (video) {
    dimensions.push(
      { group: "视频制作", label: "视频时长与节奏", value: clarificationResolved ? "25秒，前3秒强Hook，中段解释，尾帧CTA" : "25秒（节奏待确认）", status: clarificationResolved ? "confirmed" : "inferred" },
      { group: "视频制作", label: "人物与口播", value: resolvedValue("待补充", "真人手部 + 轻数字人，口播简洁可信"), status: resolvedStatus },
      { group: "视频制作", label: "声音与字幕", value: resolvedValue("待补充", "轻快电子BGM，重点词高亮字幕"), status: resolvedStatus },
      { group: "视频制作", label: "首帧与叙事结构", value: "价格反差Hook → 使用场景 → 权益证据 → CTA", status: "inferred" }
    );
  }

  const questions = clarificationResolved ? [] : [
    "核心人群是谁，处于种草、比价还是临门转化阶段？",
    "本次活动必须表达的优惠机制和可用信任证据是什么？",
    "有哪些必须使用或禁止使用的品牌资产、商品图和文案？",
    "首批交付时间、素材数量和需要覆盖的版位有哪些？",
    ...(video ? ["视频是否使用真人/数字人、口播、BGM与重点字幕？"] : [])
  ];

  return { dimensions, questions, canConfirm: questions.length === 0 };
}

function clarificationState(type, state) {
  const current = state.generationClarification?.[type] || {};
  return {
    lastInput: current.lastInput || state.lastAgentInput || "",
    resolved: current.resolved ?? state.clarificationResolved ?? false,
    confirmed: current.confirmed ?? state.requirementConfirmed ?? false
  };
}

function workflowState(type, state) {
  const current = state.generationWorkflow?.[type] || {};
  return {
    productConfirmed: current.productConfirmed ?? false,
    productCount: current.productCount ?? 0,
    knowledgeConfirmed: current.knowledgeConfirmed ?? false,
    knowledgeCount: current.knowledgeCount ?? 0,
    acceptedKnowledgeGap: current.acceptedKnowledgeGap ?? false
  };
}

function workflowConfirmationCards(status, workflow) {
  const productState = !status.confirmed ? "locked" : workflow.productConfirmed ? "confirmed" : "pending";
  const knowledgeState = !status.confirmed || !workflow.productConfirmed ? "locked" : workflow.knowledgeConfirmed ? "confirmed" : "pending";
  const productTitle = !status.confirmed
    ? "选品排序等待需求确认"
    : workflow.productConfirmed ? `已确认 ${workflow.productCount} 个商品` : "选品排序待运营确认";
  const knowledgeTitle = !status.confirmed || !workflow.productConfirmed
    ? "知识资产等待选品确认"
    : workflow.knowledgeConfirmed ? `已确认 ${workflow.knowledgeCount} 个知识资产` : "知识资产待运营确认";
  return `<div class="workflow-confirmations" aria-label="运营确认节点">
    <article class="workflow-confirmation ${productState}" data-workflow-confirmation="product">
      <div class="workflow-confirmation-head"><span>2</span><div><strong>${productTitle}</strong><small>${workflow.productConfirmed ? "排序清单已写入当前任务；调整商品后需重新确认知识资产" : "Agent 完成召回、过滤与综合排序后，需要运营确认最终 Top10/Top20"}</small></div><em>${productState === "confirmed" ? "已确认" : productState === "pending" ? "待确认" : "未开始"}</em></div>
      <button type="button" class="button ${productState === "pending" ? "button-primary" : "button-outline"}" data-action="manage-products"${status.confirmed ? "" : " disabled"}>${!status.confirmed ? "请先确认需求" : workflow.productConfirmed ? "重新查看排序" : "查看排序并确认"}</button>
    </article>
    <article class="workflow-confirmation ${knowledgeState}" data-workflow-confirmation="knowledge">
      <div class="workflow-confirmation-head"><span>3</span><div><strong>${knowledgeTitle}</strong><small>${workflow.knowledgeConfirmed ? `${workflow.acceptedKnowledgeGap ? "已记录接受缺口的运营决策" : "资产快照已写入创意方案"}` : "按已确认商品召回、过滤、排序并校验资产数量与类型"}</small></div><em>${knowledgeState === "confirmed" ? "已确认" : knowledgeState === "pending" ? "待确认" : "未开始"}</em></div>
      <button type="button" class="button ${knowledgeState === "pending" ? "button-primary" : "button-outline"}" data-action="run-knowledge-agent"${workflow.productConfirmed ? "" : " disabled"}>${!workflow.productConfirmed ? "请先确认选品" : workflow.knowledgeConfirmed ? "重新查看资产" : "调用并确认知识资产"}</button>
    </article>
  </div>`;
}

function requirementMap(type, status) {
  const model = buildRequirementClarification(type, { clarificationResolved: status.resolved });
  const groups = [...new Set(model.dimensions.map((item) => item.group))];
  const statusText = { known: "已明确", inferred: "已推断", missing: "待补充", confirmed: "已补充" };
  return `<div class="understanding requirement-map">
    <div class="clarification-title"><div><strong>需求澄清结果</strong><small>已从运营语言拆解 ${model.dimensions.length} 个维度</small></div><span class="clarification-state ${model.canConfirm ? "ready" : "pending"}">${model.canConfirm ? "信息已齐，可确认需求" : `${model.questions.length}项待补充`}</span></div>
    <div class="requirement-groups">${groups.map((group) => `<section><h4>${group}</h4><dl>${model.dimensions.filter((item) => item.group === group).map((item) => `<div class="requirement-item ${item.status}"><dt>${item.label}<small>${statusText[item.status]}</small></dt><dd>${item.value}</dd></div>`).join("")}</dl></section>`).join("")}</div>
    ${model.questions.length ? `<div class="followup-block"><div><strong>待补追问</strong><small>只追问会影响选品、创意或投放的缺口</small></div><ol>${model.questions.map((question) => `<li>${question}</li>`).join("")}</ol><div class="quick-replies"><button type="button" data-clarification-preset="目标人群为18–35岁价格敏感用户，主打暑期焕新场景；活动利益点是限时券和平台验真，使用平台Logo和品牌蓝，3个工作日内交付。${type === "video" ? "视频25秒，可用轻数字人、简短口播、轻快BGM和重点词字幕。" : ""}">使用建议答案</button><button type="button" data-clarification-preset="请逐项问我，我来补充。">逐项追问</button></div></div>` : `<div class="clarification-ready"><strong>信息已齐，可确认需求</strong><span>确认后冻结需求快照，并进入智能选品。</span></div>`}
    <button type="button" class="button ${model.canConfirm ? "button-primary" : "button-outline"} confirm-requirement" data-action="confirm-requirement"${model.canConfirm ? "" : " disabled"}>${status.confirmed ? "需求已确认" : "确认需求，进入智能选品"}</button>
  </div>`;
}

function agentPanel(type, state) {
  const isVideo = type === "video";
  const status = clarificationState(type, state);
  const workflow = workflowState(type, state);
  const currentStep = !status.confirmed ? 0 : !workflow.productConfirmed ? 1 : !workflow.knowledgeConfirmed ? 2 : 3;
  const userBrief = status.lastInput || (isVideo ? "为近期热门数码商品生成10条竖版短视频，突出优惠感。" : "为近期热门数码商品做一批信息流图片，突出优惠感和点击转化。");
  return `<section class="agent-panel">
    <div class="panel-title"><div><strong>${isVideo ? "视频创意" : "创意"} Agent</strong><span class="online-dot"></span></div><button class="text-button" data-action="clear-chat">清空会话</button></div>
    <div class="agent-steps">
      ${["需求理解", "智能选品", "知识库资产", isVideo ? "创意结构" : "创意方案", "预览确认", "批量任务"].map((name, index) => `<div class="${index < currentStep ? "done" : index === currentStep ? "current" : ""}"><span>${index + 1}</span><small>${name}</small></div>`).join("")}
    </div>
    <div class="conversation">
      ${state.conversationCleared ? `<div class="conversation-empty"><span class="bot-avatar">AI</span><div><strong>会话已清空</strong><p>输入新的投放需求即可重新开始。</p></div></div>` : `
      ${status.confirmed ? workflowConfirmationCards(status, workflow) : ""}
      <div class="message agent"><span class="bot-avatar">AI</span><div>请直接描述投放诉求。我会先拆解已知信息、标记推断项，再只追问会阻塞生成的关键缺口。</div></div>
      <div class="message user"><div>${escapeHtml(userBrief)}</div><span class="avatar small">李</span></div>
      <div class="message agent clarification-message"><span class="bot-avatar">AI</span>${requirementMap(type, status)}</div>
      ${status.confirmed ? "" : workflowConfirmationCards(status, workflow)}
      <div class="field-diff">
        <div><strong>Agent 建议修改 2 个字段</strong><small>确认后才会写入右侧方案</small></div>
        <div class="diff-row"><span>CTA</span><del>立即购买</del><b>立即查看</b></div>
        <div class="diff-row"><span>画面氛围</span><del>强促销</del><b>真实、轻促销</b></div>
        <button class="button button-soft" data-action="apply-diff">应用全部修改</button>
      </div>
      `}
    </div>
    <div class="agent-input-wrap"><div class="agent-input"><textarea data-agent-input aria-label="向 Agent 补充需求" placeholder="补充人群、场景、利益点、品牌约束、排期等信息…"></textarea><button type="button" class="send-button" data-action="send-agent">发送</button></div><div class="input-hint"><span>Enter 发送 · Shift+Enter 换行</span><span>支持直接粘贴完整投放 Brief</span></div></div>
    <div class="agent-context" data-testid="agent-context">${status.confirmed ? "需求快照已冻结，Agent 将按确认内容继续" : "Agent 当前使用：本轮需求澄清上下文"}</div>
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

function landingSection(workflow) {
  return `<section class="scheme-section">
    <h3><span>素材承接</span><small>默认输出 Top10，可切换 Top20</small></h3>
    <div class="landing-row"><div class="inline-label">承接对象</div>${option("商品", true)}${option("频道")}</div>
    <div class="landing-row"><div class="inline-label">选品方式</div>${option("AI智能选品")}${option("按类目智能选品", true)}${option("指定商品ID")}<button class="link-button" data-action="manage-products">${workflow.productConfirmed ? `已确认 ${workflow.productCount} 个商品` : "管理商品 List"}</button></div>
    <div class="landing-row"><div class="inline-label">类目选择</div>${option("手机数码", true)}${option("电脑办公", true)}${option("智能穿戴", true)}</div>
    <div class="landing-row knowledge-trigger-row"><div class="inline-label">知识资产</div><button class="button button-soft" data-action="run-knowledge-agent"${workflow.productConfirmed ? "" : " disabled"}>${workflow.knowledgeConfirmed ? `已确认 ${workflow.knowledgeCount} 个资产` : "调用知识库 Agent"}</button><span>${workflow.productConfirmed ? "按已确认商品清单召回、过滤并校验生成资产" : "需先由运营确认选品排序"}</span></div>
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
  return `<aside class="config-summary"><strong>本次配置</strong><dl><dt>默认选品</dt><dd>Top10</dd><dt>预计生成</dt><dd>${type === "video" ? "20条" : "30张"}</dd><dt>预览</dt><dd>1${type === "video" ? "条" : "张"}</dd><dt>预计耗时</dt><dd>${type === "video" ? "42分钟" : "15分钟"}</dd></dl></aside>`;
}

export function renderGeneration(type, state = getState()) {
  const video = type === "video";
  const requirementStatus = clarificationState(type, state);
  const workflow = workflowState(type, state);
  const workflowReady = requirementStatus.confirmed && workflow.productConfirmed && workflow.knowledgeConfirmed;
  const title = video ? "视频素材生成" : "图片素材生成";
  return `${pageHeader(title, video ? "通过结构化创意与分镜脚本，生成可审核、可合成的视频广告素材" : "用自然语言描述投放诉求，Agent 将协助完成需求确认、智能选品与创意方案配置", '<button class="guide-button" data-action="guide">查看操作指南</button>')}
  <div class="mode-tabs"><button class="${state.generationMode === "native" ? "active" : ""}" data-mode="native">AI原生素材</button><button class="${state.generationMode === "replica" ? "active" : ""}" data-mode="replica">爆款复刻素材</button></div>
  ${state.generationMode === "replica" ? `<div class="replica-strip"><div><strong>${video ? "上传参考视频或输入视频 URL" : "上传 JPG、PNG 或输入图片 URL"}</strong><p>模型将解析结构、文案、主体、风格和风险点，低置信字段需要运营确认。</p></div><button class="button button-primary" data-action="parse-replica">上传并解析</button></div>` : ""}
  <div class="generation-grid">
    ${agentPanel(type, state)}
    <section class="scheme-panel">
      <div class="panel-title"><div><strong>${video ? "AI视频方案" : "AI素材方案"}</strong>${badge(requirementStatus.confirmed ? "需求已确认" : "草稿 · 待确认", requirementStatus.confirmed ? "green" : "orange")}</div><button class="text-button" data-action="field-help">查看字段说明</button></div>
      <div class="scheme-scroll">${basicFields(type)}${landingSection(workflow)}${video ? videoScheme() : imageScheme()}</div>
      <div class="scheme-actions"><span>${workflowReady ? "需求、选品和知识资产均已确认，可生成代表性预览" : !requirementStatus.confirmed ? "请先完成左侧追问并确认需求" : !workflow.productConfirmed ? "请在左侧确认选品排序" : "请在左侧确认知识资产"}</span><button class="button button-outline" data-action="save-draft">保存草稿</button><button class="button button-primary" data-action="preview"${workflowReady ? "" : " disabled"}>生成1个预览${video ? "视频" : "素材"}</button></div>
      ${summary(type)}
    </section>
  </div>
  <div id="overlay-root"></div>`;
}

const productSelectionSession = { taskType: "image", limit: 10, query: "", selectedIds: new Set(), excludedIds: new Set() };
const knowledgeSession = { taskType: "image", catalog: null, input: null, result: null, quantityOverrides: {} };

const scoreCell = (score) => `<span class="product-score ${score >= 90 ? "excellent" : score >= 80 ? "good" : ""}">${score.toFixed(1)}</span>`;

export function renderProductSelectionModal({ limit = 10, query = "", selectedIds, excludedIds = [] } = {}) {
  const result = filterAndRankProducts(products, { limit, query, excludedIds });
  const selection = new Set(selectedIds ?? result.visible.map((item) => item.id));
  const counts = result.filteredCounts;
  return `<div class="overlay"><section class="modal product-selection-modal" role="dialog" aria-modal="true" aria-labelledby="product-title">
    <div class="modal-head"><div><h2 id="product-title">选品结果管理</h2><p>Agent 已完成召回、质量过滤与综合排序，请运营确认最终商品清单</p></div><button class="close-button" data-action="close-overlay" aria-label="关闭">×</button></div>
    <div class="product-funnel" aria-label="选品过滤漏斗">
      <article><span>意图召回</span><strong>${result.recalledCount}</strong><small>候选商品</small></article>
      <i>→</i><article><span>规则过滤后</span><strong>${result.eligibleCount}</strong><small>可进入排序</small></article>
      <i>→</i><article class="highlight"><span>当前输出</span><strong>Top ${result.limit}</strong><small>运营可调整</small></article>
      <div class="filter-reasons"><span>失效过滤 <b>${counts.expired}</b></span><span>重复过滤 <b>${counts.duplicate}</b></span><span>低质量过滤 <b>${counts.lowQuality}</b></span><span>黑名单过滤 <b>${counts.blacklist}</b></span></div>
    </div>
    <div class="ranking-explainer"><strong>综合推荐分</strong><span>渠道/人群匹配 <b>40%</b></span><span>素材质量 <b>30%</b></span><span>数据质量 <b>30%</b></span><small>数据质量由主站销售、曝光、点击表现构成；后续可接入投放回流动态调权。</small></div>
    <div class="modal-tools product-tools"><div class="topn-switch" aria-label="输出数量"><button class="${result.limit === 10 ? "active" : ""}" data-product-limit="10">Top10</button><button class="${result.limit === 20 ? "active" : ""}" data-product-limit="20">Top20</button></div><input aria-label="搜索商品" value="${escapeHtml(query)}" placeholder="搜索商品ID、标题或类目"><button class="button button-outline" data-action="search-product">搜索</button><button class="button button-outline" data-action="download-products">导出清单</button><span class="product-feedback" data-product-feedback></span></div>
    <div class="product-table-wrap"><table class="product-ranking-table"><thead><tr><th>选择</th><th>排名</th><th>商品</th><th>类目</th><th>匹配度</th><th>素材质量</th><th>数据质量</th><th>综合分</th><th>推荐依据</th><th>操作</th></tr></thead><tbody>${result.visible.map((item) => {
      const rank = result.ranked.findIndex((candidate) => candidate.id === item.id) + 1;
      const selected = selection.has(item.id);
      return `<tr data-product-row data-product-id="${item.id}" data-product-name="${escapeHtml(item.name)}" class="${selected ? "selected" : ""}"><td><input type="checkbox" aria-label="选择${escapeHtml(item.name)}" data-product-select ${selected ? "checked" : ""}></td><td><b class="rank-number">${rank}</b></td><td><strong>${item.name}</strong><small>${item.id} · ${item.imageCount}张图 / 标描${item.descriptionLength}字</small></td><td>${item.category}</td><td>${scoreCell(item.scores.match)}</td><td>${scoreCell(item.scores.material)}</td><td>${scoreCell(item.scores.data)}</td><td>${scoreCell(item.scores.overall)}</td><td class="reason-cell">${item.reason}</td><td><button class="link-button" data-action="product-score-detail">评分明细</button><button class="link-button danger" data-action="remove-product">移除</button></td></tr>`;
    }).join("")}</tbody></table>${result.visible.length ? "" : `<div class="product-empty">没有匹配的可选商品，请调整搜索词。</div>`}</div>
    <div class="quality-rule-note">质量门槛：可用商品图 ≥ ${PRODUCT_QUALITY_RULES.minimumImages} 张，标题与描述合计 ≥ ${PRODUCT_QUALITY_RULES.minimumDescriptionLength} 字；失效、同SPU重复及黑名单商品直接淘汰。</div>
    <div class="modal-foot"><span class="selected-summary">已选 <b data-selected-count>${selection.size}</b> 个 · 可继续取消选择或移除</span><button class="button button-outline" data-action="close-overlay">取消</button><button class="button button-primary" data-action="confirm-product-selection">确认选中 ${selection.size} 个商品</button></div>
  </section></div>`;
}

function renderProductScoreDetail(productId) {
  const item = filterAndRankProducts(products, { limit: 20 }).ranked.find((product) => product.id === productId);
  if (!item) return "";
  const rows = [
    ["渠道/人群匹配", item.scores.match, `渠道 ${item.match.channel} · 人群 ${item.match.audience}`, "综合权重 40%"],
    ["素材质量", item.scores.material, `图片 ${item.material.image} · 标描 ${item.material.description} · 类目 ${item.material.category}`, "综合权重 30%"],
    ["主站数据质量", item.scores.data, `销售 ${item.data.sales} · 曝光 ${item.data.exposure} · 点击 ${item.data.clicks}`, "综合权重 30%"]
  ];
  return `<div class="overlay"><section class="modal score-detail-modal" role="dialog" aria-modal="true" aria-labelledby="score-detail-title"><div class="modal-head"><div><h2 id="score-detail-title">${item.name} · 评分明细</h2><p>${item.id} · 综合推荐分 ${item.scores.overall.toFixed(1)}</p></div><button class="close-button" data-action="back-product-selection" aria-label="返回商品清单">×</button></div><div class="score-detail-body">${rows.map(([label, score, detail, weight]) => `<article><div><strong>${label}</strong><span>${weight}</span></div><b>${score.toFixed(1)}</b><p>${detail}</p><div class="score-track"><i style="width:${score}%"></i></div></article>`).join("")}<div class="feedback-roadmap"><strong>数据回流预留</strong><p>后续接入广告曝光、点击、转化与人工确认结果后，可按渠道和人群动态校准排序权重。</p></div></div><div class="modal-foot"><button class="button button-primary" data-action="back-product-selection">返回商品清单</button></div></section></div>`;
}

function knowledgeLoadingModal() {
  return `<div class="overlay"><section class="modal compact-modal knowledge-loading-modal" role="dialog" aria-modal="true" aria-labelledby="knowledge-loading-title"><div class="modal-head"><div><h2 id="knowledge-loading-title">知识库 Agent 正在调用资产</h2><p>正在执行意图理解、定向召回、过滤排序和覆盖校验</p></div></div><div class="knowledge-loading-body"><span></span><strong>读取本地知识资产目录…</strong><small>不会返回与当前生成形式无关的资产</small></div></section></div>`;
}

function knowledgeErrorModal(message) {
  return `<div class="overlay"><section class="modal compact-modal" role="dialog" aria-modal="true" aria-labelledby="knowledge-error-title"><div class="modal-head"><div><h2 id="knowledge-error-title">知识资产读取失败</h2><p>${escapeHtml(message)}</p></div><button class="close-button" data-action="close-overlay">×</button></div><div class="modal-foot"><button class="button button-outline" data-action="close-overlay">返回方案</button><button class="button button-primary" data-action="retry-knowledge-agent">重新读取</button></div></section></div>`;
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
  const getClarification = () => getState().generationClarification || {
    image: { lastInput: "", resolved: false, confirmed: false },
    video: { lastInput: "", resolved: false, confirmed: false }
  };
  const updateClarification = (patch, extraState = {}) => {
    const all = getClarification();
    setState({ ...extraState, generationClarification: { ...all, [type]: { ...all[type], ...patch } } });
  };
  const submitAgentMessage = () => {
    const input = document.querySelector("[data-agent-input]");
    const value = input?.value.trim() || "";
    if (!value) {
      setState({ toast: "请先输入需要补充的需求信息" });
      return;
    }
    updateClarification(
      { lastInput: value, resolved: true, confirmed: false },
      { conversationCleared: false, toast: "补充信息已拆解，需求现在可以确认" }
    );
  };
  document.querySelectorAll("[data-mode]").forEach((button) => button.addEventListener("click", () => setState({ generationMode: button.dataset.mode })));
  document.querySelector('[data-action="save-draft"]')?.addEventListener("click", () => saveDraft(type, { title: document.querySelector('[aria-label="任务名称"]')?.value, saved: true }));
  document.querySelectorAll('[data-action="manage-products"]:not(:disabled)').forEach((button) => button.addEventListener("click", () => {
    const initial = filterAndRankProducts(products, { limit: 10 });
    productSelectionSession.taskType = type;
    productSelectionSession.limit = 10;
    productSelectionSession.query = "";
    productSelectionSession.selectedIds = new Set(initial.visible.map((item) => item.id));
    productSelectionSession.excludedIds = new Set();
    showProductSelection();
  }));
  document.querySelectorAll('[data-action="run-knowledge-agent"]:not(:disabled)').forEach((button) => button.addEventListener("click", () => openKnowledgeAgent(type)));
  document.querySelector('[data-action="preview"]')?.addEventListener("click", () => { document.querySelector("#overlay-root").innerHTML = previewModal(type); bindOverlay(); });
  document.querySelector('[data-action="parse-replica"]')?.addEventListener("click", () => {
    document.querySelector("#overlay-root").innerHTML = replicaModal(type);
    bindOverlay();
  });
  document.querySelector('[data-action="apply-diff"]')?.addEventListener("click", () => setState({ toast: "已应用 2 项 Agent 修改" }));
  document.querySelector('[data-action="send-agent"]')?.addEventListener("click", submitAgentMessage);
  document.querySelector("[data-agent-input]")?.addEventListener("keydown", (event) => {
    if (!isAgentSubmitKey(event)) return;
    event.preventDefault();
    submitAgentMessage();
  });
  document.querySelectorAll("[data-clarification-preset]").forEach((button) => button.addEventListener("click", () => {
    const input = document.querySelector("[data-agent-input]");
    if (!input) return;
    input.value = button.dataset.clarificationPreset || "";
    input.focus();
  }));
  document.querySelector('[data-action="confirm-requirement"]')?.addEventListener("click", () => {
    const current = getClarification()[type] || {};
    if (!current.resolved) {
      setState({ toast: "还有关键信息待补充，请先回答追问" });
      return;
    }
    const all = getState().generationWorkflow || {};
    updateClarification({ confirmed: true }, {
      toast: "需求已确认并冻结，请运营确认 Agent 选品排序",
      generationWorkflow: { ...all, [type]: { productConfirmed: false, productCount: 0, knowledgeConfirmed: false, knowledgeCount: 0, acceptedKnowledgeGap: false } }
    });
  });
  document.querySelector('[data-action="clear-chat"]')?.addEventListener("click", () => {
    updateClarification(
      { lastInput: "", resolved: false, confirmed: false },
      { conversationCleared: true, toast: "会话已清空，可重新输入需求" }
    );
  });
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

function showProductSelection() {
  const root = document.querySelector("#overlay-root");
  if (!root) return;
  root.innerHTML = renderProductSelectionModal({
    limit: productSelectionSession.limit,
    query: productSelectionSession.query,
    selectedIds: productSelectionSession.selectedIds,
    excludedIds: productSelectionSession.excludedIds
  });
  bindOverlay();
}

function showKnowledgeResult() {
  const root = document.querySelector("#overlay-root");
  if (!root || !knowledgeSession.result) return;
  root.innerHTML = renderKnowledgeAgentModal(knowledgeSession.result, { taskType: knowledgeSession.taskType });
  bindOverlay();
}

function rerunKnowledgeAgent() {
  if (!knowledgeSession.input || !knowledgeSession.catalog) return;
  knowledgeSession.result = runKnowledgeAgent({
    ...knowledgeSession.input,
    catalog: knowledgeSession.catalog,
    quantityOverrides: knowledgeSession.quantityOverrides
  });
  showKnowledgeResult();
}

async function openKnowledgeAgent(type, forceReload = false) {
  if (!workflowState(type, getState()).productConfirmed) {
    setState({ toast: "请先由运营确认选品排序，再调用知识库 Agent" });
    return;
  }
  const root = document.querySelector("#overlay-root");
  if (!root) return;
  root.innerHTML = knowledgeLoadingModal();
  const defaultSelection = filterAndRankProducts(products, { limit: 10 }).visible;
  const selected = productSelectionSession.selectedIds.size
    ? products.filter((item) => productSelectionSession.selectedIds.has(item.id))
    : defaultSelection;
  const input = buildKnowledgeAgentInput(type, selected);
  input.requirement.channel = document.querySelector('[aria-label="渠道"]')?.value || input.requirement.channel;
  input.requirement.brand = document.querySelector('[aria-label="品牌"]')?.value || input.requirement.brand;
  knowledgeSession.taskType = type;
  knowledgeSession.input = input;
  knowledgeSession.quantityOverrides = {};
  try {
    if (forceReload || !knowledgeSession.catalog) knowledgeSession.catalog = await loadKnowledgeCatalog();
    knowledgeSession.result = runKnowledgeAgent({ ...input, catalog: knowledgeSession.catalog });
    showKnowledgeResult();
  } catch (error) {
    root.innerHTML = knowledgeErrorModal(error.message);
    bindOverlay();
  }
}

function refreshSelectedProductCount() {
  const count = productSelectionSession.selectedIds.size;
  const summary = document.querySelector("[data-selected-count]");
  const confirm = document.querySelector('[data-action="confirm-product-selection"]');
  if (summary) summary.textContent = String(count);
  if (confirm) confirm.textContent = `确认选中 ${count} 个商品`;
}

function downloadProductSelection() {
  const result = filterAndRankProducts(products, {
    limit: productSelectionSession.limit,
    query: productSelectionSession.query,
    excludedIds: productSelectionSession.excludedIds
  });
  const selected = result.ranked.filter((item) => productSelectionSession.selectedIds.has(item.id));
  const header = ["排名", "商品ID", "商品标题", "类目", "匹配度", "素材质量", "数据质量", "综合推荐分"];
  const rows = selected.map((item) => [result.ranked.indexOf(item) + 1, item.id, item.name, item.category, item.scores.match, item.scores.material, item.scores.data, item.scores.overall]);
  const csv = `\ufeff${[header, ...rows].map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(",")).join("\n")}`;
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = `选品清单-Top${productSelectionSession.limit}.csv`;
  link.click();
  URL.revokeObjectURL(url);
  const feedback = document.querySelector("[data-product-feedback]");
  if (feedback) feedback.textContent = `已导出 ${selected.length} 个商品`;
}

function bindOverlay() {
  document.querySelectorAll('[data-action="close-overlay"]').forEach((button) => button.addEventListener("click", () => { document.querySelector("#overlay-root").innerHTML = ""; }));
  document.querySelector('[data-action="start-batch"]')?.addEventListener("click", () => setState({ route: "tasks", toast: "批量任务已创建，可在任务进度中查看" }));
  document.querySelectorAll("[data-product-limit]").forEach((button) => button.addEventListener("click", () => {
    productSelectionSession.limit = Number(button.dataset.productLimit) === 20 ? 20 : 10;
    const result = filterAndRankProducts(products, { limit: productSelectionSession.limit, query: productSelectionSession.query, excludedIds: productSelectionSession.excludedIds });
    productSelectionSession.selectedIds = new Set(result.visible.map((item) => item.id));
    showProductSelection();
  }));
  const searchProducts = () => {
    productSelectionSession.query = document.querySelector('[aria-label="搜索商品"]')?.value.trim() || "";
    showProductSelection();
  };
  document.querySelector('[data-action="search-product"]')?.addEventListener("click", searchProducts);
  document.querySelector('[aria-label="搜索商品"]')?.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" || event.isComposing) return;
    event.preventDefault();
    searchProducts();
  });
  document.querySelectorAll("[data-product-select]").forEach((checkbox) => checkbox.addEventListener("change", () => {
    const row = checkbox.closest("[data-product-row]");
    const id = row?.dataset.productId;
    if (!id) return;
    if (checkbox.checked) productSelectionSession.selectedIds.add(id);
    else productSelectionSession.selectedIds.delete(id);
    row.classList.toggle("selected", checkbox.checked);
    refreshSelectedProductCount();
  }));
  document.querySelectorAll('[data-action="remove-product"]').forEach((button) => button.addEventListener("click", () => {
    const id = button.closest("[data-product-row]")?.dataset.productId;
    if (!id) return;
    productSelectionSession.selectedIds.delete(id);
    productSelectionSession.excludedIds.add(id);
    showProductSelection();
  }));
  document.querySelectorAll('[data-action="product-score-detail"]').forEach((button) => button.addEventListener("click", () => {
    const id = button.closest("[data-product-row]")?.dataset.productId;
    if (!id) return;
    document.querySelector("#overlay-root").innerHTML = renderProductScoreDetail(id);
    bindOverlay();
  }));
  document.querySelectorAll('[data-action="back-product-selection"]').forEach((button) => button.addEventListener("click", showProductSelection));
  document.querySelector('[data-action="download-products"]')?.addEventListener("click", downloadProductSelection);
  document.querySelector('[data-action="confirm-product-selection"]')?.addEventListener("click", () => {
    const count = productSelectionSession.selectedIds.size;
    if (!count) {
      const feedback = document.querySelector("[data-product-feedback]");
      if (feedback) feedback.textContent = "请至少选择 1 个商品";
      return;
    }
    const type = productSelectionSession.taskType;
    const state = getState();
    const all = state.generationWorkflow || {};
    setState({
      generationWorkflow: { ...all, [type]: { ...workflowState(type, state), productConfirmed: true, productCount: count, knowledgeConfirmed: false, knowledgeCount: 0, acceptedKnowledgeGap: false } },
      toast: `已确认 ${count} 个商品，请继续确认知识资产`
    });
  });
  document.querySelector('[data-action="retry-knowledge-agent"]')?.addEventListener("click", () => openKnowledgeAgent(knowledgeSession.taskType, true));
  document.querySelectorAll("[data-knowledge-decision]").forEach((button) => button.addEventListener("click", () => {
    const decision = button.dataset.knowledgeDecision;
    if (decision === "add_asset" || decision === "add_digital_human") {
      document.querySelector("#overlay-root").innerHTML = renderKnowledgeSupplementModal(button.dataset.gapType, { digitalHumanOnly: decision === "add_digital_human" });
      bindOverlay();
      return;
    }
    if (decision === "continue_with_gap") {
      const type = knowledgeSession.taskType;
      const count = knowledgeSession.result.selectedAssets.length;
      const state = getState();
      const all = state.generationWorkflow || {};
      setState({
        generationWorkflow: { ...all, [type]: { ...workflowState(type, state), knowledgeConfirmed: true, knowledgeCount: count, acceptedKnowledgeGap: true } },
        toast: "已记录运营决策：接受资产缺口并继续生产"
      });
      return;
    }
    if (decision === "adjust_plan") {
      knowledgeSession.quantityOverrides = Object.fromEntries(knowledgeSession.result.missingAssets.map((item) => [item.type, item.available]));
      rerunKnowledgeAgent();
    }
  }));
  document.querySelectorAll('[data-action="back-knowledge-result"]').forEach((button) => button.addEventListener("click", showKnowledgeResult));
  document.querySelector('[data-action="confirm-supplement-asset"]')?.addEventListener("click", (event) => {
    const type = event.currentTarget.dataset.gapType;
    const name = document.querySelector('[aria-label="补充资产名称"]')?.value.trim() || `新增${type}`;
    const tags = (document.querySelector('[aria-label="补充资产标签"]')?.value || "").split(",").map((item) => item.trim()).filter(Boolean);
    const requirement = knowledgeSession.input.requirement;
    knowledgeSession.catalog = [...knowledgeSession.catalog, {
      assetId: `TEMP-${type.toUpperCase()}-${Date.now()}`,
      name,
      assetType: type,
      mediaType: knowledgeSession.taskType,
      status: "active",
      version: "task-temp-v1",
      filePath: `task-assets/${type}.json`,
      fileFormat: "json",
      fileSize: 1024,
      checksum: `task:${type}`,
      fileHealthy: true,
      duplicateOf: "",
      quality: { resolution: 90, completeness: 90 },
      license: { status: "available", expiresAt: "2099-12-31", regions: ["CN"] },
      brandScopes: [requirement.brand],
      channels: [requirement.channel],
      aspectRatios: [requirement.aspectRatio],
      tags,
      categories: requirement.categories.length ? requirement.categories : ["all"],
      productIds: [],
      owner: "本任务运营补充",
      updatedAt: new Date().toISOString().slice(0, 10)
    }];
    rerunKnowledgeAgent();
  });
  document.querySelector('[data-action="confirm-knowledge-assets"]:not(:disabled)')?.addEventListener("click", () => {
    const type = knowledgeSession.taskType;
    const count = knowledgeSession.result.selectedAssets.length;
    const state = getState();
    const all = state.generationWorkflow || {};
    setState({
      generationWorkflow: { ...all, [type]: { ...workflowState(type, state), knowledgeConfirmed: true, knowledgeCount: count, acceptedKnowledgeGap: false } },
      toast: `已确认调用 ${count} 个知识资产，资产快照已写入创意方案`
    });
  });
  document.querySelector('[data-action="change-product"]')?.addEventListener("click", () => setState({ toast: "已切换为降噪真无线耳机作为代表商品" }));
  document.querySelector('[data-action="confirm-parse"]')?.addEventListener("click", () => setState({ toast: "解析完成：3 个低置信字段已标记，右侧方案已更新" }));
}
