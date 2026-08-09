# 02 — 交付可筛选、响应式的 Notes Index

**What to build:**
在共享 Terminal Shell 中交付完整的 Notes Index：显示 Published Note 总数与最新日期，支持单个 Canonical Tag 与标题搜索交集筛选，提供空 Publish Set 与无匹配状态，并在宽屏和窄屏下以各自确认的列表形态呈现。每个列表行是一个完整的 Note URL 入口，窗口固定 footer 提供返回 Home 的操作。

**Blocked by:** 01 — 建立共享 Terminal Shell，并保持 Home 不回归.

**Status:** ready-for-agent

- [ ] Notes Index 显示 `total` 与 `latest`，不显示 `topics`、阅读时长或 `READ`。
- [ ] `--all` 位于首位，其他 Canonical Tag 按 `zh-CN` 字典序排列；单个标签与不区分大小写的标题搜索取交集，状态不进入 URL。
- [ ] 无匹配时显示 `$ grep: no matching notes` 并保留表头、筛选和固定 footer；空 Publish Set 显示已确认的零笔记状态并隐藏无效筛选、搜索和表头。
- [ ] 宽屏显示 DATE、NAME、TAGS；窄屏隐藏表头，筛选标签与搜索各占一行，笔记行按日期、显示标题、标签三段竖排。
- [ ] 每个 Published Note 行整体可通过鼠标、键盘和触摸进入 Note URL，并在 hover、focus-visible 与 active 时提供视觉反馈。
- [ ] 固定 footer 显示 `← Back to home`；构建验收和浏览器级验收覆盖筛选、响应式、空状态和导航结果。
