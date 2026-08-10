# 02 — 交付键盘 Tag Token Caret

**What to build:**
让 Tag Token 成为标题查询前的固定有序前缀，并让键盘 Caret 能以 Token 为原子单元跨越、定位和双向删除它们，同时保留浏览器本地的 Canonical Tag 与标题查询交集筛选。

**Blocked by:** 01 — 交付标题查询的真实 Caret.

**Status:** ready-for-agent

- [x] 左右方向键在标题查询中按字符移动、在 Tag Token 前缀中按单个 Token 跨越；macOS `delete`（⌫）删除左侧单元，`fn + delete` 删除右侧单元，筛选结果立即反映变更。
- [x] 已有标题查询时选择新 Tag，Token 仍追加到固定前缀末尾，Caret 位于新 Token 后、标题查询前；在 Token 区输入普通文本时，文本追加到标题查询末尾并将 Caret 移至该末尾。
- [ ] 浏览器验收覆盖多个 Tag Token、标题交集、Token 边界移动、双向删除、去重、无匹配恢复与既有键盘 Tag Suggestion List 选择。

## Comments

- 2026-08-11：实现已存在于 `bee6dff`。已通过完整测试（28 项）和类型检查；浏览器端到端验收受本地 `file:` URL 安全策略限制，尚待可访问的浏览器环境补齐。
