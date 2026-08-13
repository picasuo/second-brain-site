# Second Brain Site — handoff（2026-08-13）

## 当前状态

当前工作区的 Notes Index 筛选提示已改为终端式单行输入 UI；本轮已修复镜像文本层的空格顺序和原生输入光标对齐问题。所有当前改动将作为一个提交提交。

## 先读

- [Caret Editor 规格](.scratch/notes-index-filter-caret-editor/spec.md)
- [第 01 号工单](.scratch/notes-index-filter-caret-editor/issues/01-deliver-title-query-caret.md)
- [第 02 号工单](.scratch/notes-index-filter-caret-editor/issues/02-deliver-keyboard-tag-token-caret.md)
- [第 03 号工单](.scratch/notes-index-filter-caret-editor/issues/03-deliver-pointer-caret-and-tag-fragment-replacement.md)
- [第 04 号工单](.scratch/notes-index-filter-caret-editor/issues/04-deliver-composition-and-paste-caret-safety.md)
- [领域用语](CONTEXT.md)

## 本提交包含的改动

- `NotesIndexFilterPrompt` 改为由原生 `<input>` 承接焦点和光标、由 `#cmd-mirror` 呈现终端式 Tag 与标题查询的单行筛选提示。它支持输入 `#` 的标签建议、方向键选择、Tab/Enter 确认、Esc 关闭，以及浏览器本地的标签与标题交集筛选。
- 恢复输入控件的 combobox 语义：`role="combobox"`、`aria-autocomplete="list"`、`aria-controls`、`aria-expanded` 和建议列表的 `role="listbox"` 均已存在并随建议打开/关闭同步。
- 修复连续空格后再输入文字时，镜像层将空格视觉上移到文字后的缺陷：空白现在作为带 `white-space: pre` 的显式 `.tk-space` 镜像单元渲染，不再被 Flex 布局忽略。
- 修复 Tag Token 后的原生输入光标落入后续文字中间的问题：移除了 `.tk-tag` 会改变排版宽度的横向内边距，使镜像文字宽度与原生 input 的光标计算一致；Tag 的颜色和背景仍保留。
- 在第 01 号工单的 `Comments` 中记录了上述两项回归规则。
- `BaseLayout` 引入 JetBrains Mono 字体资源、调整等宽字体回退和终端窗口最大宽度，并清理已不再使用的旧筛选提示样式。
- `src/generated/published-notes.ts` 已同步当前生成的 Published Note 数据，包含新增/更新的公开笔记内容和元数据。
- 静态构建验收已更新为检查当前 input/镜像式筛选 Prompt 的稳定可访问结构。

## 已验证

- `pnpm test`：5 个测试文件、28 项测试全部通过。
- `pnpm typecheck`：0 errors、0 warnings、0 hints。
- 本地可访问的 `/notes/` 页面已按最小场景验证：连续空格后输入文本时空格保留在文本之前；输入 `#反向代理 蔡大叔` 时，光标不再因 Tag 背景样式而提前落在“蔡大叔”中间。
- `git diff --check` 通过。

## 继续工作时的注意事项

- Caret Editor 原规格中“固定有序 Tag Token 前缀、跨 Token 的真实 Caret、Token 双向删除、Token 两侧指针定位、IME/粘贴专用规则”等高级交互，当前需要用真实浏览器按第 02–04 号工单重新验收；不要仅根据旧交接记录将其视为已由当前 Prompt 实现。
- 本次筛选 Prompt 使用标签形式的查询字符串（例如 `#反向代理 标题`）进行本地解析；它仍不改 URL、不查询服务端，也不改变 Publish Set。
- 生成站点的浏览器级端到端验收尚未进入自动化测试套件。后续应通过可访问的本地开发服务器或获准的浏览器环境补齐，不要尝试绕过浏览器 URL 安全策略。
- `.scratch/notes-index-filter-prompt-shell/` 与 `.scratch/notes-index-token-filter/` 是独立的需求素材；后续处理时分别按其规格执行。

## 提交边界

- 本次提交应包含所有当前已修改文件：筛选 Prompt、布局样式、生成笔记、构建测试和 Caret Editor 工单记录。
- 提交后先运行 `git status --short --branch`，不要假设工作树干净。
