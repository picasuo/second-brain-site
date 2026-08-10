# Notes Index Filter Prompt Shell

Status: ready-for-agent

## Problem Statement

Notes Index 的 Notes Index Filter 已具备 Tag Token 与标题查询能力，但其独立的 `$ grep -i` 行和传统输入框外观打断了终端阅读流。访问者难以从视觉上立即理解列表与筛选的关系，也不容易一眼看出该区域可以直接输入。现有的 `&&` 表达还不能准确描述“列出 Published Note 后对结果筛选”的终端语义。

## Solution

以交互式 Notes Index Filter Prompt 取代分离的列表命令和输入框。宽屏将 `$ ls -la ./notes --sort=date | grep -i`、Tag Token 与标题查询呈现在同一条终端提示符中；窄屏仅将 `| grep -i` 和可编辑部分续至第二行。提示符在进入 Notes Index 时立即可输入，以醒目的块状闪烁光标提示可编辑性，并去除传统输入框的边框、底色和圆角。现有浏览器本地 Notes Index Filter、Tag Token、Tag Suggestion List、Published Note 行导航和固定 footer 均保持其已确认行为。

## User Stories

1. As a Notes Index visitor, I want the list command and filter query to read as one terminal pipeline, so that I understand that the displayed Published Note are being locally narrowed.
2. As a terminal-literate visitor, I want the prompt to use `| grep -i` rather than `&& grep -i`, so that the simulated command has familiar filtering semantics.
3. As a visitor unfamiliar with shell commands, I want the prompt and its editable cursor to make the filter affordance obvious, so that I can search without needing to understand every command token.
4. As a desktop visitor, I want `$ ls -la ./notes --sort=date | grep -i` and the query area to share one line, so that the list context remains compact and readable.
5. As a narrow-screen visitor, I want the editable Token and query segment to continue from the Prompt's left edge when necessary, while the static pipeline stays intact, so that neither the prompt nor the composite query causes horizontal scrolling.
6. As a Notes Index visitor, I want to see an obvious blinking block cursor on page entry, so that I immediately know where to type.
7. As a keyboard visitor, I want the Filter Prompt to receive focus when the Notes Index opens, so that I can begin a title query or Tag Token query without first locating a control.
8. As a visitor who prefers reduced motion, I want the cursor to remain visible without blinking, so that the input affordance persists without unwanted animation.
9. As a Notes Index visitor, I want the query area to look like terminal text rather than a conventional form field, so that the terminal presentation remains visually coherent.
10. As a Notes Index visitor, I want selected Tag Token to remain readable inside the same prompt, so that I can understand the active intersection alongside my remaining title query.
11. As a keyboard visitor, I want the existing Tag Suggestion List controls to remain available from the focused Filter Prompt, so that terminal styling does not remove accessible Tag Token selection.
12. As a visitor with no matching Published Note, I want to retain the focused, editable Filter Prompt and the terminal no-match result, so that I can adjust the query immediately.
13. As a visitor of an empty Publish Set, I want the confirmed zero-note state and contextual footer without an interactive Filter Prompt, so that unavailable filtering is not implied.
14. As a reader, I want each visible Published Note row and the fixed contextual footer to preserve their current navigation behavior, so that the visual refinement does not interrupt reading flow.

## Implementation Decisions

- Introduce one Notes Index Filter Prompt module. Its interface is the Canonical Tag collection and the browser-local filtering state it reports; it owns terminal prompt presentation, Tag Token display, editable query feedback, Tag Suggestion List accessibility, and keyboard interaction.
- Keep Terminal Command Display unchanged and static. It remains responsible only for non-interactive terminal context such as `notes --info`; it does not gain slots, interactive modes, or form-control responsibilities.
- Keep Terminal Shell unchanged as the owner of the terminal window, sole scrollable body, and fixed contextual footer.
- The Filter Prompt represents the list/filter relationship with `$ ls -la ./notes --sort=date | grep -i`. The pipe is presentational terminal vocabulary for the already browser-local Notes Index Filter; it does not run a shell, submit a command, change the URL, or request server-side search.
- On wide layouts the static pipeline, selected Tag Token, title query, and cursor form one visual prompt. When they no longer fit together, the static pipeline remains one intact first-line segment and the editable region continues as a readable second line from the Prompt's left edge.
- Replace field chrome with terminal-text presentation: no enclosing border, rounded rectangle, filled input surface, or search-control decoration. Preserve a clear focus indication through the prompt cursor and accessible focus state.
- Autofocus the editable query region when a non-empty Publish Set Notes Index opens. Its ordinary text remains editable; selected Tag Token continue to use the already-confirmed Backspace rule.
- Use a high-contrast, block-shaped cursor that blinks while motion is allowed. Under reduced-motion preferences, render the same cursor without animation.
- Preserve all existing Tag Token filtering semantics: `#` opens the Tag Suggestion List, selected tags are not duplicated, all selected Canonical Tag and the case-insensitive title query intersect, and Canonical Tag retain their `#` display prefix.
- Preserve the current wide DATE/NAME/TAGS layout, narrow stacked rows, terminal no-match state, confirmed empty Publish Set state, full-row Note URL navigation, and fixed contextual footer.

## Testing Decisions

- Test observable visitor behavior rather than component internals, CSS implementation techniques, generated selectors, or cursor implementation details.
- Extend the existing generated Published Site build acceptance seam to verify the Filter Prompt exposes the pipeline command, accessible editable query semantics, and Canonical Tag display while retaining the static `notes --info` Terminal Command Display and empty Publish Set behavior.
- Use the existing generated-site browser acceptance seam as the primary feature seam. It must verify autofocus, an observable cursor affordance, prompt-line behavior at wide and narrow viewports, absence of horizontal page overflow, Tag Token selection and removal, title intersection, no-match recovery, row navigation, and the fixed footer.
- Browser acceptance must verify that the `prefers-reduced-motion` state leaves a visible non-animated cursor, rather than testing the specific CSS animation implementation.
- Reuse the established fixture-driven Publish Set metadata and local mock Published Note as prior art. Reuse existing Tag Token browser scenarios rather than adding fixtures unless a public state cannot otherwise be expressed.

## Out of Scope

- Executing shell commands, sending query text to a server, URL query persistence, or shareable filter links.
- Full-text or Published Note body search, changes to Canonical Tag normalization, or changes to Publish Set contents.
- Altering Terminal Command Display's static-only interface, adding generic terminal form abstractions, or refactoring Terminal Shell.
- Changing Published Note URL identity, Published Note reader behavior, markdown rendering, list sorting, row navigation, or footer destinations.
- Adding reading time, a `READ` column, `topics`, or other Notes Index metadata.

## Further Notes

- Notes Index Filter Prompt is intentionally distinct from Terminal Command Display: the former is an interactive local-filtering prompt; the latter is static terminal context.
- A dedicated reusable generic terminal prompt module is deferred until a second interactive terminal prompt establishes a real reuse seam.
- No ADR is required: the visual presentation and local interaction boundary are reversible and do not alter publication architecture or the existing Stable Note Slug decision.
