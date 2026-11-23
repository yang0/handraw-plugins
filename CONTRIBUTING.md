# 提交插件到 Handraw 官方插件市场

1. 确保你的插件仓库公开可访问（或已发布到 npm），包含有效的 `package.json`（原生 `handraw` 插件或 `dsh` 插件均可）。
2. Fork 本仓库，在 `icons/` 中添加不超过 32 KiB 的图标文件（推荐 SVG），并在 `index.json` 的 `plugins` 数组中添加或更新对应条目：
   - `versions` 数组必须按 SemVer **降序**排列；
   - `source.type === "git"` 必须固定完整的 `commit` SHA；
   - 不要包含任何密钥、私密地址或未授权素材。
3. 本地运行校验：
   ```bash
   node scripts/validate.mjs
   ```
4. 提交 Pull Request，说明在 `handraw-client` / DSH 中的实测情况。
