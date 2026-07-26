export const navItems = [
  ["image", "图片素材生成", "图"],
  ["video", "视频素材生成", "视"],
  ["tasks", "任务进度", "任"],
  ["audits", "审核管理", "审"],
  ["library", "素材库", "库"],
  ["knowledge", "知识库", "知"],
  ["analytics", "素材数据", "数"],
  ["accounts", "账号管理", "账"]
];

export const partnerNav = [
  ["partner-assets", "授权素材", "授"],
  ["partner-downloads", "下载记录", "下"]
];

export const products = [
  { id: "ITM-88310", name: "轻薄旗舰笔记本", category: "电脑办公", reason: "近期点击表现高，优惠表达空间充足", origin: "agent" },
  { id: "ITM-19028", name: "降噪真无线耳机", category: "手机数码", reason: "视觉辨识度高，适合细节特写", origin: "agent" },
  { id: "ITM-77214", name: "智能运动手表", category: "手机数码", reason: "功能演示明确，适合短视频媒介", origin: "agent" },
  { id: "ITM-66509", name: "微单相机套机", category: "数码影像", reason: "客单价高，优惠利益点突出", origin: "manual" }
];

export const tasks = [
  { id: "TASK-20250715-0001", name: "7月数码优惠视频投放", kind: "批量生成", type: "短视频", owner: "张小野", department: "品牌市场部", created: "07-15 10:23", count: "7 / 10", progress: 68, status: "生成中", tone: "blue" },
  { id: "TASK-20250715-0002", name: "清凉夏日家电预览方案", kind: "预览生成", type: "短视频", owner: "李思远", department: "品牌市场部", created: "07-15 09:58", count: "1 / 1", progress: 100, status: "待审核", tone: "orange" },
  { id: "TASK-20250715-0003", name: "3C配件主图批量生成", kind: "批量生成", type: "图片", owner: "王雨桐", department: "品牌市场部", created: "07-15 09:37", count: "14 / 20", progress: 70, status: "部分完成", tone: "orange" },
  { id: "TASK-20250714-0045", name: "618返场活动视频投放", kind: "批量生成", type: "短视频", owner: "陈宇航", department: "增长运营中心", created: "07-14 16:42", count: "15 / 15", progress: 100, status: "生成完成", tone: "green" },
  { id: "TASK-20250714-0031", name: "数码配件视频素材批量", kind: "批量生成", type: "短视频", owner: "张小野", department: "品牌市场部", created: "07-14 11:05", count: "0 / 12", progress: 0, status: "生成失败", tone: "red" }
];

export const assets = [
  { id: "IMG-20250712-00123", title: "夏日海岛度假酒店", task: "7月数码优惠图片投放", type: "图片", channel: "信息流", media: "抖音", status: "投放中", tone: "green", seed: "island-resort", ctr: "3.8%", spend: "¥12,480", cpa: "¥36.2" },
  { id: "VID-20250710-00056", title: "夏日促销空调活动", task: "夏日促销空调活动", type: "视频", channel: "信息流", media: "快手", status: "已导出待投放", tone: "blue", seed: "summer-appliance", ctr: "3.2%", spend: "¥14,892", cpa: "¥19.6" },
  { id: "IMG-20250711-00345", title: "真无线耳机种草图", task: "数码新品推荐", type: "图片", channel: "信息流", media: "腾讯广告", status: "已入库待投放", tone: "blue", seed: "wireless-earbuds", ctr: "3.3%", spend: "¥15,632", cpa: "¥18.9" },
  { id: "VID-20250709-00018", title: "城市夜跑品牌视频", task: "运动装备促销视频", type: "视频", channel: "信息流", media: "抖音", status: "表现优良", tone: "green", seed: "city-running", ctr: "4.6%", spend: "¥21,560", cpa: "¥15.8" },
  { id: "IMG-20250708-00077", title: "护肤精华新品主图", task: "美妆新品推广", type: "图片", channel: "信息流", media: "巨量引擎", status: "投放中", tone: "green", seed: "skincare-serum", ctr: "4.1%", spend: "¥18,201", cpa: "¥22.4" },
  { id: "VID-20250707-00011", title: "桌面办公好物推荐", task: "办公好物推荐", type: "视频", channel: "DSP", media: "百度", status: "已下线归档", tone: "gray", seed: "desk-lamp", ctr: "2.6%", spend: "¥9,420", cpa: "¥41.3" }
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
