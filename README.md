# Handraw Official Plugin Market（手绘风官方插件市场）

手绘风客户端（[handraw-client](https://github.com/yang0/handraw-client)）与 [DeepSeek Harness (DSH)](https://github.com/deepseek-ai/deepseek-harness) 共用的官方插件市场索引仓库，遵循 **DSH Format 1**（`@deepseek-ai/dsh-plugin-market-index`）标准。

## 订阅地址（国内外双镜像同步）

- **Gitee 国内镜像（客户端默认优先）**：`https://gitee.com/yang02010/handraw-plugins/raw/main/index.json`（[Gitee 仓库](https://gitee.com/yang02010/handraw-plugins)）
- **GitHub 官方原仓（自动容错回退）**：`https://raw.githubusercontent.com/yang0/handraw-plugins/main/index.json`（[GitHub 仓库](https://github.com/yang0/handraw-plugins)）

### 在手绘风客户端中使用
该市场源已在 `handraw-client` 中**默认内置双镜像**，打开左侧「插件 → 功能插件」即可浏览、一键安装或更新。

### 可选商业化扩展字段（向后兼容）
每条插件记录支持可选的 `pricing`（`free` / `pro` / `credits` / `paid`）与 `delivery`（`none` / `handraw-account`）字段，免费开源插件省略即可。

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
