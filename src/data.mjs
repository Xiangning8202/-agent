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

export const products = [
  { id: "ITM-88310", name: "轻薄旗舰笔记本", category: "电脑办公", reason: "近期点击表现高，优惠表达空间充足", origin: "agent" },
  { id: "ITM-19028", name: "降噪真无线耳机", category: "手机数码", reason: "视觉辨识度高，适合细节特写", origin: "agent" },
  { id: "ITM-77214", name: "智能运动手表", category: "手机数码", reason: "功能演示明确，适合短视频媒介", origin: "agent" },
  { id: "ITM-66509", name: "微单相机套机", category: "数码影像", reason: "客单价高，优惠利益点突出", origin: "manual" }
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
