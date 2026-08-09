# 03 — 交付响应式终端 Published Note 阅读页

**What to build:**
在共享 Terminal Shell 中交付 Published Note 阅读页：以 Published Note Filename 呈现窗口标题与静态 view 命令，显示已确认的元数据，保持现有 Markdown 语义，并在宽屏与窄屏之间切换 Table of Contents 形态。窗口固定 footer 始终提供返回 Notes Index 的操作。

**Blocked by:** 01 — 建立共享 Terminal Shell，并保持 Home 不回归.

**Status:** ready-for-agent

- [ ] 窗口标题和静态命令只使用最终 Published Note Filename；不使用 Stable Note Slug，不公开 Vault 目录。
- [ ] 页面标题优先使用 `title`，缺失时使用移除 `.md` 的 Published Note Filename；元数据只显示日期与 Canonical Tag，不显示阅读时长。
- [ ] 现有 markdown-it 对 `h1`、`h2`、`h3` 的语义、标题锚点、Content Link 和 Table of Contents 提取保持不变；不生成数字化章节标题。
- [ ] 1200px 及以上在正文左侧显示固定 Table of Contents；低于 1200px 时目录默认收起，点击后完整展开且不设置高度上限。
- [ ] 长正文只在 Terminal Shell 正文区滚动；固定 footer 显示 `← Back to notes`。
- [ ] 构建验收和浏览器级验收覆盖文件名展示、Markdown 语义、目录切换、内部滚动和返回 Notes Index。
