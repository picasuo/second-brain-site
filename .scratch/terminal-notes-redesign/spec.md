# Terminal Notes Redesign

Status: ready-for-agent

## Problem Statement

Published Site 的 Home 已有定稿的终端拟态体验，但 Notes Index 与 Published Note 页面仍使用另一套页面结构与滚动方式，无法形成一致的阅读体验。用户需要在不改变 Home 已定稿视觉、尺寸、背景、内容排版或交互的前提下，将三页收敛到同一套终端窗口，并为 Notes Index 提供可访问的本地筛选与明确的宽窄屏阅读布局。

现有页面还缺少对空 Publish Set、筛选无结果、长笔记内部滚动、窄屏目录展开和整行笔记导航的明确体验。

## Solution

为 Home、Notes Index 与 Published Note 提供一个以 Home 为视觉基准的 Terminal Shell。页面容器锁定视口，只有窗口正文区纵向滚动；标题栏、背景、窗口尺寸和固定 footer 由 Shell 统一承担。各页面只提供自己的窗口标题、静态终端命令和内容。

Notes Index 显示 Published Note 总数、最新日期、标签筛选与标题搜索。Published Note 保持当前 Markdown 语义，提供与屏幕宽度相适应的 Table of Contents。导航仅由固定 footer 和 Notes Index 的笔记行承担，终端命令始终是静态展示。

## User Stories

1. As a site visitor, I want Home, Notes Index, and each Published Note to appear in the same terminal window, so that the Published Site feels coherent.
2. As a Home visitor, I want its existing visual proportions, information layout, links, and keyboard navigation to remain unchanged, so that the redesign does not regress the approved landing experience.
3. As a reader, I want the browser page itself not to scroll, so that the terminal framing remains stable while reading.
4. As a reader of a long Published Note, I want only the terminal body to scroll, so that the title bar and return action remain available.
5. As a Notes Index visitor, I want to see the total Published Note count and latest publication date, so that I can assess the collection at a glance.
6. As a Notes Index visitor, I want to select one Canonical Tag or all notes, so that I can narrow the collection by subject.
7. As a Notes Index visitor, I want title search and tag selection to combine as an intersection, so that I can find a specific Published Note within a subject.
8. As a Notes Index visitor, I want filters to stay local to the currently open page and not alter the URL, so that the index remains a simple static route.
9. As a Notes Index visitor, I want an explicit terminal-style no-match message, so that an empty list is understandable rather than ambiguous.
10. As a visitor of an empty Publish Set, I want a clear zero-note state and a way back Home, so that the page remains useful even without Published Notes.
11. As a desktop reader, I want each Notes Index row to expose date, title, and tags in columns, so that I can scan the collection quickly.
12. As a narrow-screen reader, I want filters stacked and each note displayed as date, main title, and tags, so that no table needs horizontal scrolling.
13. As a keyboard, mouse, or touch user, I want an entire Notes Index row to be one focusable Note URL entry with visible hover, focus, and press feedback, so that navigation is clear across input modes.
14. As a Published Note reader, I want the terminal window title and static view command to use the Published Note Filename rather than a Stable Note Slug or Vault path, so that the terminal metaphor is meaningful without exposing Vault structure.
15. As a Published Note reader, I want date and Canonical Tag metadata but no reading-time estimate, so that only authored publication information is shown.
16. As a Markdown author, I want `h1`, `h2`, and `h3` to keep their current markdown-it meaning, so that the redesign does not rewrite my document structure into visual section counters.
17. As a wide-screen reader, I want a fixed Table of Contents on the left of the article, so that I can navigate a long Published Note without losing my reading position.
18. As a narrow-screen reader, I want the Table of Contents initially collapsed and expandable to its full height, so that document navigation is available without consuming reading space.
19. As a reader, I want the terminal footer to always offer the contextual return action, so that I can move from a Published Note to the Notes Index or from the Notes Index to Home at any point.
20. As a visitor, I want terminal-looking commands to be presentation only, so that only clearly indicated links, filter controls, and rows perform actions.

## Implementation Decisions

- Build one Terminal Shell module with a deliberately small interface: window title plus named page content. It owns the page container, background, macOS-like title bar, maximum window dimensions, sole scrollable body, and fixed footer region.
- Treat Home as the reference adapter for the Terminal Shell. Refactoring Home through the Shell must preserve its existing visual output and current link-selection keyboard behavior.
- Build a small Terminal Command Display module for the common `$` prompt and command typography. Its interface accepts display text only; it never renders a link or control.
- Generate a Published Note Filename display value from only the final Vault filename. It includes `.md` for terminal titles and commands; it never uses or exposes Vault directories. Stable Note Slug remains solely responsible for Note URL identity.
- Notes Index headings display only `total` and `latest`; do not introduce `topics`, a core-tag concept, or additional metadata.
- Implement Notes Index Filter as browser-local state: `--all` or one Canonical Tag plus normalized case-insensitive title text. The predicate is their intersection. State is not encoded in the URL and returns to defaults on page entry.
- Keep `--all` first and order all other Canonical Tags by `zh-CN` collation.
- Do not add a `READ` column, detail reading-time metadata, frontmatter field, or build-time estimate.
- On wide Notes Index layouts, use date, name, and tags columns. On narrow layouts, hide the table header; place filter tags and search on separate rows; render each whole-row Note URL as date, title-or-filename fallback, and tags.
- Use one whole-row Note URL rather than nested per-field links. Hover, focus-visible, and touch active states communicate that the row is interactive.
- Show `$ grep: no matching notes` for a non-empty Publish Set with no filter match. Retain the header, filters, and footer in this state.
- For an empty Publish Set, show `total 0 篇`, `latest —`, and `$ notes: no published notes`; hide the otherwise nonfunctional header, filters, and search while retaining the return footer.
- Use the Published Note display title for the page header: `title` first, then Published Note Filename without `.md`.
- Show the static command `$ view ~/notes/<Published Note Filename>` at the top of a Published Note. It is not a return action.
- Keep the existing markdown-it configuration, heading anchors, content-link handling, and Table of Contents extraction. Do not transform source headings into numeric visual sections.
- Render a fixed left Table of Contents at viewport widths of at least 1200px. Below 1200px, render a closed disclosure control; when opened, it has no height cap and lists all `h2` and `h3` entries. The 1200px threshold is intentionally a visual-review parameter.
- Render terminal fixed footer navigation as `← Back to home` for Notes Index and `← Back to notes` for Published Note. Its text remains one line at the supported minimum width of 20rem.

## Testing Decisions

- Test external behavior rather than internal classes, layout implementation, generated selectors, or component decomposition.
- Extend the existing Published Site build acceptance seam to verify generated Notes Index and Published Note HTML includes the public display data required by the feature, including filename fallback, empty Publish Set copy, and no reading-time output.
- Add browser-level acceptance coverage against a generated Published Site. This is the highest useful seam because it executes browser-local Notes Index Filter behavior, row navigation, hover/focus/active affordances, responsive layout changes, closed/open Table of Contents behavior, and the distinction between page scrolling and terminal-body scrolling.
- Browser acceptance must assert outcomes at representative wide and narrow viewports, including the temporary 1200px Table of Contents threshold. It must verify that the document page does not overflow vertically while a long terminal body does.
- Reuse the existing fixture-driven publication build tests as prior art for constructing Published Note, empty Publish Set, tags, heading, and link scenarios. Add minimal fixtures only where no existing fixture can express the user-visible state.
- Verify Home through the same generated-site acceptance seam to establish that the Terminal Shell refactor preserves its existing text, links, and keyboard link selection.

## Out of Scope

- Full-text search, server-side search, URL query parameters, or shareable filter URLs.
- Reading-time estimation, a `READ` field, or new reading-time frontmatter.
- A `topics` concept, core-tag metadata, or any tag summary beyond filters.
- Vault directory disclosure, deriving display filenames from Stable Note Slug, or changing Note URL identity behavior.
- Markdown source rewrites, numeric heading conversion, or changes to markdown-it parsing semantics.
- Persistent global navigation, clickable terminal commands, or additional interactive terminal controls.
- Changing the Home visual design or its existing keyboard navigation behavior.

## Further Notes

- The spec uses the established terms Published Note, Published Note Filename, Stable Note Slug, Canonical Tag, Notes Index, Notes Index Filter, Table of Contents, and Contextual Navigation.
- The fixed footer and body-scrolling constraints are intentional visual contracts, not incidental implementation details.
- Existing publication ADRs remain applicable: the redesign must not compromise Stable Note Slug identity, Note URL behavior, or Vault privacy.
- The current design avoids a new ADR because the layout and local filtering choices are reversible and do not change publication architecture.
