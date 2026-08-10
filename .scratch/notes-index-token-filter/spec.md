# Terminal Notes Index Token Filter

Status: ready-for-agent

## Problem Statement

Notes Index 目前把统计信息、标签按钮和标题搜索分散为多块 UI，页面标题也没有提供实际价值。它与已确认的终端信息区草图不一致，且现有单一 Canonical Tag 筛选不能表达多个 Tag Token 与标题查询的联合意图。

## Solution

将 Notes Index 收敛为两段静态 Terminal Command Display：`$ notes --info` 输出纵向的 `total` 与 `latest`，`$ ls -la ./notes --sort=date` 引出按日期排列的 Published Note 列表。以一个 `$ grep -i` Token Query Field 替代独立标签筛选和搜索：输入 `#` 时显示 Tag Suggestion List，选中的 Canonical Tag 作为可删除的 Tag Token 留在同一输入区域；剩余文本按标题模糊匹配。全部 Tag Token 与标题文本取交集。

## User Stories

1. As a Notes Index visitor, I want to see `$ notes --info` and its `total`、`latest` output vertically, so that the collection summary reads like terminal output.
2. As a Notes Index visitor, I want the non-informative Notes page heading removed, so that the terminal information hierarchy stays focused.
3. As a Notes Index visitor, I want `$ ls -la ./notes --sort=date` to precede the list, so that the ordered results have a clear terminal context.
4. As a Notes Index visitor, I want one `$ grep -i` field for both tag and title filtering, so that I do not have to coordinate separate controls.
5. As a Notes Index visitor, I want `#` to open Canonical Tag suggestions, so that I can discover available tags without remembering their spelling.
6. As a Notes Index visitor, I want to select multiple Tag Tokens, so that I can find Published Notes sharing every chosen Canonical Tag.
7. As a Notes Index visitor, I want ordinary input text to match Published Note titles case-insensitively, so that I can narrow a selected tag set further.
8. As a keyboard user, I want Up/Down, Enter, and Escape to operate the Tag Suggestion List, so that tag filtering does not require a pointer.
9. As an editor of the Token Query Field, I want a Tag Token to behave as part of the text sequence and be removable with Backspace when the caret is immediately after it, so that correction feels native.
10. As a Notes Index visitor, I want selected tags omitted or disabled in suggestions, so that the input never displays duplicate Tag Tokens.
11. As a visitor, I want every rendered Canonical Tag to start with `#`, so that tags are recognizable in rows, selected tokens, and suggestions.
12. As a narrow-screen reader, I want the composite query field and the note rows to remain readable without horizontal page scrolling, so that filtering works on small screens.
13. As a visitor with no matching Published Notes, I want the terminal no-match result while the query remains editable, so that I can refine it.
14. As a visitor of an empty Publish Set, I want the confirmed zero-note state and return navigation without an inactive Token Query Field, so that no unavailable control is presented.

## Implementation Decisions

- Notes Index retains the shared Terminal Shell and its fixed contextual return footer.
- The index body is composed as terminal output: first `$ notes --info` followed by a two-row title/value output for `total` and `latest`; then `$ ls -la ./notes --sort=date` followed by the list. The old `h1` is removed.
- `total` and `latest` are the only summary values; do not add `topics`, reading time, or `READ`.
- The list command is static presentation only, consistent with Terminal Command Display. It does not focus, filter, or navigate.
- Replace separate tag buttons and title input with one Token Query Field displayed after the `$ grep -i` prompt. Its placeholder explains that `#` filters tags and ordinary text searches titles.
- The Token Query Field presents a terminal-style wide block caret while editable and remains one accessible composite control with an explicit label.
- A bare `#` opens all unselected Canonical Tags. Text after the current `#` narrows suggestions by canonical display name. A selected suggestion becomes one Tag Token and clears only that in-progress tag text.
- Tag Suggestion List supports pointer selection and Up/Down, Enter, Escape keyboard interaction. The active option is exposed to assistive technology; unavailable already-selected tags cannot be selected again.
- Tag Tokens preserve selection order in the Token Query Field. Backspace immediately after a token removes it; pointer and touch do not provide a separate removal action. Normal title text preserves expected text editing behavior.
- Filtering is browser-local and never changes the URL. A result must contain every selected Canonical Tag and have a case-insensitive title match for the remaining title text. With no Tag Token or title text, all Published Notes are visible.
- Canonical Tag ordering in suggestions remains `zh-CN` collation. Tags in rows, Tag Tokens, and suggestions display a leading `#`, while comparisons continue to use Canonical Tag values without the display prefix.
- Wide list columns remain DATE, NAME, TAGS; narrow rows remain date, title, and tags stacked vertically. No `READ` column is introduced.
- Non-empty no-match state retains terminal info, list command, Token Query Field, and footer. Empty Publish Set hides the list command and Token Query Field while keeping summary and footer.

## Testing Decisions

- Test observable visitor behavior, not component structure, selectors, or internal state storage.
- Extend the existing generated-site build acceptance seam to verify the two terminal command displays, omitted page heading, zero-note output, and `#` Canonical Tag display.
- Use the existing generated-site browser acceptance seam as the primary feature seam. It must exercise multi-Tag Token intersection, title intersection, `#` suggestion filtering, duplicate prevention, keyboard selection, Backspace deletion, no-match recovery, row navigation, and wide/narrow layouts.
- Browser acceptance verifies the page remains non-scrolling while Terminal Shell body scrolling and fixed footer behavior remain intact.
- Reuse the current fixture-driven Publish Set metadata and local mock Published Notes to cover multiple tags, a tag containing whitespace, title search, empty tags, and no matches.

## Out of Scope

- Full-text or body-content search, server-side search, query-string persistence, and shareable filter URLs.
- Adding reading-time output, a `READ` column, `topics`, or clickable terminal command displays.
- Changing Published Note URL identity, Canonical Tag normalization rules, or Publish Set contents.
- Editing Published Note reader behavior beyond its existing contextual navigation.

## Further Notes

- This supplements the completed Notes Index redesign rather than reopening its prior ticket.
- Tag Token interaction is intentionally local and reversible; it does not require a new ADR.
