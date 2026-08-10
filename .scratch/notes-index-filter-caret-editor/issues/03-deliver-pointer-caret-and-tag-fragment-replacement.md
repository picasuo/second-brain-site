# 03 — 交付指针 Caret 与 Tag 片段替换

**What to build:**
让访问者可以用指针精确定位 Caret，并在标题查询任意位置用 Tag Suggestion List 只替换当前 `#` 片段，同时保留其余标题文本和固定 Tag 前缀。

**Blocked by:** 02 — 交付键盘 Tag Token Caret.

**Status:** ready-for-agent

- [x] 点击 Tag Token 左半区将 Caret 放在其前，点击右半区将 Caret 放在其后；点击标题查询按字符位置定位，随后输入和删除均针对该位置。
- [x] 在标题查询的 `#` 片段选择 Tag Suggestion 后，仅该片段被移除；新 Tag 追加到固定前缀末尾，其他标题文本保留，Caret 位于新 Token 后、标题查询前。
- [ ] 浏览器验收覆盖 Token 两侧点击、标题字符点击、指针选择建议、文本保留、重复 Tag 排除、筛选结果与 Published Note 行导航。

## Comments

- 2026-08-11：`e84c8a5` 修复了 Caret 位于 Tag 片段中间时的替换范围，确保完整移除当前连续 `#` 片段。完整测试（28 项）和类型检查通过；浏览器端到端验收仍待可访问的浏览器环境补齐。
