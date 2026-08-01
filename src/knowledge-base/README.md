# 知识库 Agent 本地资产目录

该目录是 MVP 的知识资产事实源，前端通过 `agent.mjs` 读取三个 JSON 文件并执行定向召回、过滤、排序、数量与类型校验。

- `data/common-assets.json`：品牌 Logo、字体。
- `data/image-assets.json`：商品图、图片背景、图片版式模板。
- `data/video-assets.json`：视频模板、数字人、视频背景、字幕样式、背景音乐。
- `schema.json`：统一资产字段约束。
- `agent.mjs`：读取与知识库 Agent 决策逻辑。
- `ui.mjs`：资产调用结果、缺失异常和人工决策界面。

当前目录只保存演示元数据，`filePath` 是正式资产存储接入后的逻辑路径，不代表 MVP 中已存在对应二进制文件。正式环境应将资产文件放入对象存储，并通过资产 ID、版本与校验和关联。
