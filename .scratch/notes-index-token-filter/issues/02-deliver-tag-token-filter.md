# 02 — 交付 Tag Token Notes Index Filter

**What to build:**
在统一 `$ grep -i` Token Query Field 中交付多 Canonical Tag 筛选：输入 `#` 展示 Tag Suggestion List，可用鼠标或方向键、Enter 选择；所有 Tag Token 与标题查询取交集。已选标签不可重复选择，且只有光标紧邻令牌后的 Backspace 能移除令牌；不提供鼠标或触摸删除操作。

**Blocked by:** 01 — 交付终端化 Notes Index 与标题查询.

**Status:** resolved

- [x] `#` 和其后输入会显示按 `zh-CN` 排序、可键盘或鼠标选择的未选 Canonical Tag 建议；Esc 关闭建议，所有显示处均以 `#` 前缀呈现。
- [x] 多个 Tag Token、剩余标题文本与筛选结果取交集；已选标签不重复，Backspace 仅在令牌后删除令牌，普通文本仍保持正常编辑行为。
- [x] 浏览器验收覆盖多标签交集、标题交互、建议键盘交互、去重、Backspace 删除、无匹配恢复、导航和宽窄屏布局。

## Comments

- 2026-08-11：由 `ab0ef1d` 交付；现有 Tag Token 行为成为 Caret Editor 的回归基线。
