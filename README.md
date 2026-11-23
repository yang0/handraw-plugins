# Handraw Official Plugin Market（手绘风官方插件市场）

手绘风客户端（[handraw-client](https://github.com/yang0/handraw-client)）与 [DeepSeek Harness (DSH)](https://github.com/deepseek-ai/deepseek-harness) 共用的官方插件市场索引仓库，遵循 **DSH Format 1**（`@deepseek-ai/dsh-plugin-market-index`）标准。

## 订阅地址

- **GitHub Raw（默认内置）**：`https://raw.githubusercontent.com/yang0/handraw-plugins/main/index.json`

### 在手绘风客户端中使用
该市场源已在 `handraw-client` 中**默认内置安装**，打开「设置 → 模块管理与社区插件 → 官方插件市场」即可浏览并一键安装或更新。

### 在 DeepSeek Harness (DSH) 中使用
在 DSH 的插件市场设置中添加上述 `index.json` 地址即可订阅同一份插件列表。

## 本地校验与添加插件

```bash
# 校验 index.json 是否符合 DSH Format 1 规范
node scripts/validate.mjs

# 从本地插件目录快速添加或更新一条插件版本记录
node scripts/add-plugin.mjs --dir /path/to/plugin --category creation --official
```

## 社区投稿

欢迎提交 PR 向 `index.json` 添加开源的手绘风插件或兼容的 DSH 插件，详见 [CONTRIBUTING.md](CONTRIBUTING.md)。
