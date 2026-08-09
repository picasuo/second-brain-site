# 01 — 建立共享 Terminal Shell，并保持 Home 不回归

**What to build:**
让 Home 通过共享 Terminal Shell 呈现，同时保持已定稿的页面容器、背景、拟态 macOS 窗口尺寸、标题栏、内容排版、链接交互与键盘导航不变。Terminal Shell 提供标题栏、唯一可滚动的正文区与固定 footer 区域，并为后续 Notes Index 和 Published Note 提供同一外壳。

**Blocked by:** None — can start immediately.

**Status:** resolved

- [x] Home 在共享 Terminal Shell 中保持既有视觉比例、背景、内容和链接行为。
- [x] 页面容器锁定视口，浏览器页面不产生纵向滚动；Terminal Shell 正文区是唯一纵向滚动区域。
- [x] 固定 footer 区域与正文滚动区分离，且不会改变 Home 当前内容布局。
- [x] 终端命令展示作为静态展示模块提供，不渲染链接或其他交互控件。
- [x] 浏览器级验收覆盖 Home 既有链接、键盘导航和 Shell 的滚动约束。

## Comments

- 2026-08-09：完成共享 Shell 与静态命令组件抽取；`pnpm typecheck`、`pnpm test` 均通过（25 个测试）。浏览器验收确认 Home 页面不滚动、正文区为纵向滚动区，既有链接与键盘导航保持可用。
