export const navItems = [
  ["image", "图片素材生成", "./src/assets/icons/image.svg"],
  ["video", "视频素材生成", "./src/assets/icons/video.svg"],
  ["tasks", "任务进度", "./src/assets/icons/list-checks.svg"],
  ["library", "素材库", "./src/assets/icons/library.svg"],
  ["knowledge", "知识库", "./src/assets/icons/database.svg"],
  ["analytics", "素材数据", "./src/assets/icons/chart-no-axes-combined.svg"],
  ["accounts", "账号管理", "./src/assets/icons/users.svg"]
];

export const partnerNav = [
  ["partner-assets", "授权素材", "./src/assets/icons/folder-key.svg"],
  ["partner-downloads", "下载记录", "./src/assets/icons/download.svg"]
];

const productCandidate = (id, name, category, reason, match, material, data, overrides = {}) => ({
  id, name, category, reason, origin: "agent", status: "active", duplicateOf: "", blacklisted: false,
  imageCount: 6, descriptionLength: 96,
  match: { channel: match[0], audience: match[1] },
  material: { image: material[0], description: material[1], category: material[2] },
  data: { sales: data[0], exposure: data[1], clicks: data[2] },
  ...overrides
});

export const products = [
  productCandidate("ITM-88310", "轻薄旗舰笔记本", "电脑办公", "高意向人群近期点击与成交同步上升", [96, 94], [94, 90, 96], [93, 91, 95]),
  productCandidate("ITM-19028", "降噪真无线耳机", "手机数码", "通勤人群匹配高，细节素材与口碑数据完整", [94, 96], [95, 88, 94], [91, 94, 96]),
  productCandidate("ITM-77214", "智能运动手表", "智能穿戴", "暑期运动场景契合，功能演示素材丰富", [93, 95], [92, 93, 95], [89, 93, 94]),
  productCandidate("ITM-66509", "微单相机套机", "数码影像", "高客单优惠利益点突出，点击质量稳定", [91, 88], [96, 90, 92], [92, 88, 91], { origin: "manual" }),
  productCandidate("ITM-42861", "学生平板电脑 11英寸", "电脑办公", "开学换新场景匹配，商品信息与素材完备", [92, 93], [91, 92, 94], [88, 91, 90]),
  productCandidate("ITM-57342", "便携蓝牙音箱", "手机数码", "户外聚会场景相关，短视频完播表现较好", [88, 91], [90, 87, 91], [86, 92, 90]),
  productCandidate("ITM-90416", "游戏机械键盘", "电脑办公", "年轻游戏人群匹配，灯效图片可形成强视觉", [90, 94], [93, 86, 90], [87, 89, 92]),
  productCandidate("ITM-34628", "主动降噪头戴耳机", "手机数码", "通勤与学习场景兼容，点击率高于类目均值", [89, 92], [92, 89, 91], [85, 90, 94]),
  productCandidate("ITM-71853", "4K高清运动相机", "数码影像", "旅行人群兴趣匹配，场景素材数量充足", [88, 90], [94, 88, 92], [84, 89, 91]),
  productCandidate("ITM-25179", "智能健康手环", "智能穿戴", "入门价格带适合拉新，曝光点击数据稳定", [91, 90], [88, 90, 93], [90, 91, 88]),
  productCandidate("ITM-63285", "电竞显示器 27英寸", "电脑办公", "游戏用户兴趣明确，核心参数描述完整", [87, 91], [91, 94, 90], [89, 86, 90]),
  productCandidate("ITM-14796", "磁吸无线充电宝", "手机数码", "差旅即时需求强，商品卖点易于短链路表达", [90, 89], [89, 91, 92], [88, 90, 87]),
  productCandidate("ITM-80934", "护眼阅读台灯", "智能家居", "学生与居家办公人群覆盖广，销售趋势良好", [85, 89], [90, 92, 88], [91, 87, 86]),
  productCandidate("ITM-49517", "手机稳定器云台", "数码影像", "内容创作者人群高度匹配，演示素材可用性高", [89, 93], [92, 85, 89], [83, 88, 92]),
  productCandidate("ITM-38642", "智能翻译录音笔", "电脑办公", "学习与差旅场景清晰，搜索点击持续增长", [86, 88], [87, 93, 90], [85, 89, 91]),
  productCandidate("ITM-92751", "家用高清投影仪", "智能家居", "暑期居家娱乐契合，曝光和加购表现突出", [86, 91], [93, 89, 88], [90, 92, 85]),
  productCandidate("ITM-56473", "开放式运动耳机", "智能穿戴", "运动人群匹配，佩戴场景图片覆盖完整", [88, 92], [90, 88, 91], [84, 87, 90]),
  productCandidate("ITM-21368", "迷你办公主机", "电脑办公", "桌面焕新场景明确，参数与类目信息规范", [84, 87], [89, 92, 93], [86, 85, 88]),
  productCandidate("ITM-75129", "智能门锁可视猫眼版", "智能家居", "家庭安全诉求明确，主站成交质量稳定", [82, 86], [91, 90, 89], [91, 84, 86]),
  productCandidate("ITM-60837", "便携照片打印机", "数码影像", "年轻女性与旅行场景匹配，素材风格丰富", [87, 90], [93, 87, 86], [82, 86, 89]),
  productCandidate("ITM-OLD-01", "已下架旗舰手机", "手机数码", "历史热销但当前不可售", [95, 95], [94, 94, 94], [96, 96, 96], { status: "expired" }),
  productCandidate("ITM-DUP-01", "轻薄旗舰笔记本重复链接", "电脑办公", "同SPU重复召回", [92, 92], [90, 90, 90], [90, 90, 90], { duplicateOf: "ITM-88310" }),
  productCandidate("ITM-LOW-01", "入门数据线单图商品", "手机数码", "素材不足", [78, 80], [30, 42, 80], [72, 70, 68], { imageCount: 1 }),
  productCandidate("ITM-LOW-02", "简版手机支架", "手机数码", "标描信息不足", [80, 77], [72, 28, 82], [71, 69, 66], { descriptionLength: 22 }),
  productCandidate("ITM-BLK-01", "风险品牌蓝牙耳机", "手机数码", "命中业务黑名单", [90, 90], [90, 90, 90], [90, 90, 90], { blacklisted: true })
];

export const tasks = [
  { id: "TASK-20250715-0001", name: "7月数码优惠视频投放", kind: "批量生成", type: "短视频", owner: "张小野", department: "品牌市场部", created: "07-15 10:23", count: "7 / 10", progress: 68, status: "生成中", tone: "blue", auditStatus: "部分素材审核中", auditCounts: [2, 3, 2, 0] },
  { id: "TASK-20250715-0002", name: "清凉夏日家电预览方案", kind: "预览生成", type: "短视频", owner: "李思远", department: "品牌市场部", created: "07-15 09:58", count: "1 / 1", progress: 100, status: "待审核", tone: "orange", auditStatus: "待审核", auditCounts: [1, 0, 0, 0] },
  { id: "TASK-20250715-0003", name: "3C配件主图批量生成", kind: "批量生成", type: "图片", owner: "王雨桐", department: "品牌市场部", created: "07-15 09:37", count: "14 / 20", progress: 70, status: "部分完成", tone: "orange", auditStatus: "部分素材已提交", auditCounts: [3, 4, 6, 1] },
  { id: "TASK-20250714-0045", name: "618返场活动视频投放", kind: "批量生成", type: "短视频", owner: "陈宇航", department: "增长运营中心", created: "07-14 16:42", count: "15 / 15", progress: 100, status: "生成完成", tone: "green", auditStatus: "审核完成", auditCounts: [0, 0, 14, 1] },
  { id: "TASK-20250714-0031", name: "数码配件视频素材批量", kind: "批量生成", type: "短视频", owner: "张小野", department: "品牌市场部", created: "07-14 11:05", count: "0 / 12", progress: 0, status: "生成失败", tone: "red", auditStatus: "未提交审核", auditCounts: [0, 0, 0, 0] }
];

export const assets = [
  { id: "IMG-001", title: "18日领券日·平台大促", task: "会员领券日图片批量", taskId: "TASK-20250715-0003", type: "图片", channel: "信息流", media: "抖音", status: "投放中", tone: "green", source: "./src/assets/eval-images/IMG-001.png", ctr: "4.8%", spend: "¥18,480", cpa: "¥16.2" },
  { id: "IMG-002", title: "外卖一折起·家庭聚餐", task: "即时零售暑期投放", taskId: "TASK-20250715-0003", type: "图片", channel: "信息流", media: "快手", status: "表现优良", tone: "green", source: "./src/assets/eval-images/IMG-002.png", ctr: "5.2%", spend: "¥23,892", cpa: "¥13.6" },
  { id: "IMG-003", title: "球场拼速度·平台快一步", task: "赛事热点即时零售", taskId: "TASK-20250715-0003", type: "图片", channel: "信息流", media: "腾讯广告", status: "投放中", tone: "green", source: "./src/assets/eval-images/IMG-003.png", ctr: "4.3%", spend: "¥15,632", cpa: "¥18.9" },
  { id: "IMG-004", title: "会员超多权益", task: "会员权益说明素材", taskId: "TASK-20250715-0003", type: "图片", channel: "信息流", media: "巨量引擎", status: "已入库待投放", tone: "blue", source: "./src/assets/eval-images/IMG-004.png", ctr: "3.7%", spend: "¥9,560", cpa: "¥21.8" },
  { id: "IMG-005", title: "欢庆新春年货节", task: "春节年货节大促", taskId: "TASK-20250715-0003", type: "图片", channel: "信息流", media: "抖音", status: "表现优良", tone: "green", source: "./src/assets/eval-images/IMG-005.png", ctr: "6.1%", spend: "¥31,201", cpa: "¥11.4" },
  { id: "IMG-006", title: "买药有保障·药店满减", task: "医药健康频道活动", taskId: "TASK-20250715-0003", type: "图片", channel: "DSP", media: "百度", status: "已导出待投放", tone: "blue", source: "./src/assets/eval-images/IMG-006.png", ctr: "3.5%", spend: "¥8,420", cpa: "¥24.3" },
  { id: "IMG-007", title: "夏日品牌欢迎页", task: "夏日品牌心智活动", taskId: "TASK-20250715-0003", type: "图片", channel: "种草", media: "腾讯广告", status: "已入库待投放", tone: "blue", source: "./src/assets/eval-images/IMG-007.png", ctr: "3.9%", spend: "¥12,320", cpa: "¥20.1" },
  { id: "IMG-008", title: "城市品质生活频道", task: "本地生活频道拉新", taskId: "TASK-20250715-0003", type: "图片", channel: "种草", media: "快手", status: "投放中", tone: "green", source: "./src/assets/eval-images/IMG-008.png", ctr: "4.4%", spend: "¥17,880", cpa: "¥17.5" },
  { id: "IMG-009", title: "好久不见·回流唤醒", task: "沉默用户召回活动", taskId: "TASK-20250715-0003", type: "图片", channel: "信息流", media: "腾讯广告", status: "已导出待投放", tone: "blue", source: "./src/assets/eval-images/IMG-009.png", ctr: "4.0%", spend: "¥11,420", cpa: "¥19.3" },
  { id: "IMG-010", title: "急需商品即时送达", task: "多品类即时零售", taskId: "TASK-20250715-0003", type: "图片", channel: "信息流", media: "抖音", status: "表现优良", tone: "green", source: "./src/assets/eval-images/IMG-010.png", ctr: "5.7%", spend: "¥27,640", cpa: "¥12.9" },
  { id: "IMG-011", title: "摇一摇解锁今日惊喜", task: "互动玩法促活素材", taskId: "TASK-20250715-0003", type: "图片", channel: "厂商", media: "百度", status: "已入库待投放", tone: "blue", source: "./src/assets/eval-images/IMG-011.png", ctr: "3.6%", spend: "¥7,920", cpa: "¥22.7" },
  { id: "IMG-012", title: "今日热门好物", task: "多品类热销榜单", taskId: "TASK-20250715-0003", type: "图片", channel: "信息流", media: "巨量引擎", status: "投放中", tone: "green", source: "./src/assets/eval-images/IMG-012.png", ctr: "4.9%", spend: "¥19,820", cpa: "¥15.6" },
  { id: "VID-001", title: "外卖一折起·竖版短视频", task: "即时零售视频批量", taskId: "TASK-20250715-0001", type: "视频", channel: "信息流", media: "抖音", status: "投放中", tone: "green", source: "./src/assets/eval-images/IMG-002.png", ctr: "4.5%", spend: "¥21,560", cpa: "¥15.8" },
  { id: "VID-002", title: "年货节·信息流短视频", task: "春节年货节视频投放", taskId: "TASK-20250715-0001", type: "视频", channel: "信息流", media: "快手", status: "已导出待投放", tone: "blue", source: "./src/assets/eval-images/IMG-005.png", ctr: "4.1%", spend: "¥16,240", cpa: "¥18.6" }
];

export const knowledgeRows = {
  common: [
    ["数码焕新频道", "CHN-001", "频道", "全公司", "v2.1", "有效"],
    ["全量商品库", "PRD-ALL", "商品", "全公司", "v4.3", "有效"],
    ["平台蓝品牌资产", "BRD-001", "品牌", "全公司", "v3.0", "有效"],
    ["优惠感标签文案", "TAG-108", "标签/文案", "品牌市场部", "v1.8", "即将失效"]
  ],
  image: [
    ["清透数码蓝", "IMG-001", "图片风格", "全公司", "v2.1", "有效"],
    ["现代无衬线", "FONT-012", "字体", "全公司", "v1.3", "有效"],
    ["右上角安全区", "LOGO-009", "Logo布局", "品牌市场部", "v2.0", "有效"],
    ["真实生活场景", "COM-032", "背景/主体/构图", "全公司", "v1.2", "即将失效"]
  ],
  video: [
    ["活力青年数字人", "HUM-001", "数字人", "全公司", "v2.1", "有效"],
    ["Hook-玩法-利益-CTA", "VST-001", "视频结构", "全公司", "v2.1", "有效"],
    ["重点词高亮字幕", "SUB-014", "字幕模板", "全公司", "v1.5", "有效"],
    ["轻快电子背景乐", "BGM-088", "BGM", "品牌市场部", "v1.3", "即将失效"]
  ]
};

export const accounts = [
  ["张小野 / 008631", "管理员", "增长运营中心", "正常", "07-18 09:32"],
  ["王思琪 / 007524", "正式员工", "内容运营部", "正常", "07-18 09:05"],
  ["陈宇航 / 007319", "正式员工", "设计创意部", "待审批", "—"],
  ["刘佳怡 / 006832", "正式员工", "品牌市场部", "正常", "07-17 18:22"],
  ["赵一鸣 / 006118", "代理商", "华东渠道分销商", "正常", "07-16 15:47"],
  ["孙晓彤 / 005902", "正式员工", "增长运营中心", "已冻结", "07-12 11:09"]
];
