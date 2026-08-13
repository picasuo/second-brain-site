# 01 — 交付标题查询的真实 Caret

**What to build:**
让 Notes Index Filter Prompt 的标题查询拥有与真实文本输入一致的 Caret：初始位于可编辑区域左端，输入和字符级编辑后紧跟实际文本，而不再固定停在输入区域末端。筛选、无匹配、导航和空 Publish Set 保持已有行为。

**Blocked by:** None — can start immediately.

**Status:** ready-for-agent

- [ ] 非空 Publish Set 进入 Notes Index 时，标题查询自动获得焦点，且 Caret 位于空标题查询的左端；普通文本输入、左右字符移动、macOS `delete`（⌫）和 `fn + delete` 均按实际文本位置工作。
- [ ] 可见块状 Caret 与标题文本的实际 Caret 位置一致；聚焦时高对比度闪烁，失焦时低对比度静止，减少动态效果时保持可见且静止。
- [ ] 浏览器验收覆盖文本 Caret、标题筛选、无匹配恢复、宽窄视口无横向溢出、Published Note 行导航、固定 footer 和空 Publish Set；构建验收继续保护可访问 Prompt 结构与静态 `notes --info`。

## Comments

- 2026-08-13：补充回归场景：连续输入空格后再输入标题文本时，输入值与可见镜像中的空格必须保持在文本之前，顺序不得重排。空白片段必须作为保留空白的显式镜像单元渲染，避免 Flex 布局忽略匿名空白文本节点。
- 2026-08-13：补充回归场景：Tag Token 后的标题查询光标必须位于可见文本末端。镜像层的 Tag 视觉样式不得通过会改变文本布局宽度的内边距或外边距制造与原生 input 字符宽度不一致的偏差。
