# 02 — 交付响应式与减少动态效果的 Filter Prompt

**What to build:**
让 Notes Index Filter Prompt 在窄屏仍保持清晰可编辑：保留列表命令第一行，仅将 `| grep -i` 和查询区域续至第二行；减少动态效果时，块状光标保持可见但不闪烁。访问者继续获得无横向溢出的 Notes Index、可用筛选、Published Note 导航和固定 footer。

**Blocked by:** 01 — 交付桌面 Notes Index Filter Prompt.

**Status:** wontfix

- [ ] 宽屏维持单行 Filter Prompt；窄屏仅将筛选段和可编辑区域换到第二行，不造成文档页面横向溢出，也不遮挡 Tag Token、Tag Suggestion List、结果行或固定 footer。
- [ ] 常规动效设置下块状光标闪烁；`prefers-reduced-motion` 下仍可见但保持静态。
- [ ] 浏览器验收覆盖代表性宽窄视口、焦点与光标、Tag Token 和标题筛选、无匹配恢复、整行 Note URL、固定 footer，以及页面与 Terminal Shell 正文滚动边界。

## Comments

- 2026-08-11：块状 Caret 的原实现已被独立的 Caret Editor 重新定义；窄屏、减少动态效果和无横向溢出的要求将由 [Caret Editor spec](../../notes-index-filter-caret-editor/spec.md) 与其后续 tickets 验收。本票不再作为可执行工作，保留原始提案供追溯。
