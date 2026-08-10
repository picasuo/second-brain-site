# Second Brain Site — handoff（2026-08-11）

## 下一次会话的目标

继续完成或验收 Notes Index Filter Caret Editor；优先补齐真实浏览器交互验收，再处理后续视觉调整或新工单。不要重复实现已落地的 Token、Caret、片段替换、IME 与粘贴逻辑。

## 先读

- [Caret Editor 规格](.scratch/notes-index-filter-caret-editor/spec.md)
- [第 01 号工单](.scratch/notes-index-filter-caret-editor/issues/01-deliver-title-query-caret.md)
- [第 02 号工单](.scratch/notes-index-filter-caret-editor/issues/02-deliver-keyboard-tag-token-caret.md)
- [第 03 号工单](.scratch/notes-index-filter-caret-editor/issues/03-deliver-pointer-caret-and-tag-fragment-replacement.md)
- [第 04 号工单](.scratch/notes-index-filter-caret-editor/issues/04-deliver-composition-and-paste-caret-safety.md)
- [领域用语](CONTEXT.md)

## 当前已完成

- `NotesIndexFilterPrompt` 已实现统一 Caret、固定有序的 Tag Token 前缀、字符/Token 级方向键和双向删除、建议选择、指针 Token 两侧定位、`#` 片段替换、IME 组合保护和粘贴为普通标题查询文本。实现位于 [NotesIndexFilterPrompt.astro](src/components/NotesIndexFilterPrompt.astro)。
- `e84c8a5`：选择建议时完整替换连续 `#` 片段，即使 Caret 位于片段中间也不遗留尾字符。
- `bf41ca1`：任何 Caret 位置的粘贴均追加到标题查询末尾，不会创建 Tag Token。
- `d4584f4`：筛选提示行与 `TerminalCommandDisplay` 对齐字体、字号、字重和颜色；Caret 在失焦时也持续闪烁。减少动态效果设置仍会禁用动画。第 02–04 号工单已同步完成项和验证记录。

## 验证与待补齐

- 最近一次完整验证：`pnpm test`（28 项）及 `pnpm typecheck` 均通过；样式调整后的 `pnpm test test/published-site-build.test.ts`（16 项）亦通过。
- 规格指定的生成站点浏览器端到端验收尚未补齐。此前本地 `file:` 产物被浏览器 URL 安全策略阻止；不要绕过该策略。应在可访问的本地开发服务器或获准的浏览器环境中，按第 02–04 号工单剩余 checkbox 验证。
- 这些 Issue 的 `Status` 仍为 `ready-for-agent`，因为项目只定义了该组 triage 标签，没有定义“完成”状态；已完成清单和限制记录在各自的 `## Comments`。

## 当前工作区与提交边界

- 本次交接前，用户要求提交当前所有更改。提交后仍应先执行 `git status --short --branch`，不要假设工作树干净。
- 当前的需求素材还包含 `.scratch/notes-index-filter-prompt-shell/` 与 `.scratch/notes-index-token-filter/`；它们不是 Caret Editor 的实现代码，后续处理时按各自规格执行。

## Suggested skills

- `implement`：用户要求落实后续 Issue 时使用。
- `tdd`：在已确认的真实浏览器交互缝合点上添加验收测试时使用。
- `browser:control-in-app-browser`：需要真实浏览器交互验收时使用；遵守其本地页面和 URL 安全策略。
- `diagnosing-bugs`：浏览器、构建或交互行为出现故障时使用。
