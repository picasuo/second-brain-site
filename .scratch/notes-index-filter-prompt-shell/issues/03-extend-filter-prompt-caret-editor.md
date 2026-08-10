# 03 — 扩展 Notes Index Filter Prompt Caret Editor

**What to build:**
将 Notes Index Filter Prompt 从“文本 input 加独立 Tag Token”扩展为统一的 Caret Editor。它保留 Tag Token 作为标题查询前的固定有序前缀，并让键盘与指针能在 Token 边界和标题查询字符间定位、移动和删除。

**Blocked by:** None — deferred extension after the initial Filter Prompt delivery.

**Status:** wontfix

## Confirmed interaction rules

- Tag Token 始终位于标题查询前的固定前缀；已存在标题查询时选择新 Tag，仍追加到前缀末尾。
- 选择新 Tag 后，Caret 位于新 Token 之后、标题查询之前。
- 左右方向键在标题查询中按字符移动，跨越一个 Tag Token 时按一个原子单元移动。
- Caret 可位于 Token 之间或标题查询字符之间。macOS `delete`（⌫）删除左侧一个原子单元；`fn + delete` 删除右侧一个原子单元。
- 当 Caret 位于 Token 区时输入普通文本，文本追加到既有标题查询末尾，Caret 也移动到标题查询末尾；没有标题查询时，文本从其最左侧开始。
- 指针可定位 Caret：点击 Tag Token 左半区位于该 Token 前，点击右半区位于该 Token 后；标题查询维持字符级定位。
- 中文输入法合成期间不拦截编辑键或 Tag Suggestion List 的 Enter 选择，以免打断候选输入。
- 粘贴内容沿用普通标题文本追加规则，不自动解析为 Tag Token。
- 在标题查询中选择 Tag Suggestion 时，只替换 Caret 所在的 `#` 片段，保留其余标题文本，并将新 Token 追加到固定前缀末尾。
- Prompt 聚焦时 Caret 高对比度闪烁；失焦后仍保持可见以提示可输入，但以较低对比度静止显示。

## Out of scope for the first extension

- `Shift + Arrow` 跨 Token 的多单元选区、批量删除、剪贴板语义和完整 IME 选区语义，除非后续单独确认。

## Notes

- 当前实现的可见块状光标是 input 后的独立元素，无法读取原生选区，也无法进入 Token 边界；该扩展需要统一的 Caret 状态与浏览器验收。

## Comments

- 2026-08-11：本票是设计访谈记录，已由独立 feature 的 [Caret Editor spec](../../notes-index-filter-caret-editor/spec.md) 取代。后续实施仅以新 feature 目录中的 tickets 为准；保留此票以追溯已确认的交互规则。
