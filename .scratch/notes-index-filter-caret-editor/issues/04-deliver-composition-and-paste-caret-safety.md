# 04 — 交付输入法与粘贴的 Caret 安全性

**What to build:**
让 Caret Editor 在中文输入法和普通粘贴下仍可预测地编辑标题查询，不因 Tag Suggestion List 或 Token 命令打断输入，并保持全部筛选与导航行为。

**Blocked by:** 02 — 交付键盘 Tag Token Caret.

**Status:** ready-for-agent

- [x] 中文输入法合成期间不触发 Tag Suggestion List 的 Enter 选择，也不被 Caret 删除和移动命令中断；合成提交后按普通标题查询参与本地筛选。
- [x] 粘贴内容始终作为普通标题查询追加到其末尾，不自动创建 Tag Token；粘贴 `#tag` 不改变既有 Canonical Tag 前缀。
- [ ] 浏览器验收覆盖合成保护、粘贴、文本与 Tag 筛选、无匹配恢复、焦点状态和减少动态效果；全量验收继续覆盖不进入 URL、不发起服务端查询和固定 footer 导航。

## Comments

- 2026-08-11：`bf41ca1` 统一了所有 Caret 位置的粘贴行为，始终追加到标题查询末尾；既有 IME 组合输入保护保持不变。完整测试（28 项）和类型检查通过；浏览器端到端验收仍待可访问的浏览器环境补齐。
