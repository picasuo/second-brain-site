# Notes Index Filter Caret Editor

Status: ready-for-agent

## Problem Statement

Notes Index Filter Prompt 目前把标题查询交给原生 input、把 Tag Token 渲染在 input 之外，并在末尾放置独立的视觉光标。访问者会看到光标停在可输入区域末端而不是输入起点或实际文本后的插入点；方向键不能跨过 Tag Token，鼠标也不能定位到 Token 两侧。因此访问者无法像使用普通编辑器一样，精确移动 Caret 并以删除键编辑标题查询和 Tag Token。

## Solution

将 Notes Index Filter Prompt 提升为 Caret Editor：Tag Token 始终是标题查询前的固定有序前缀，标题查询仍是浏览器本地的大小写不敏感筛选条件。组件维护一个统一的 Caret 位置，让键盘和指针可在 Token 边界与标题查询字符之间移动。可见的块状 Caret 始终反映实际编辑位置；输入、删除、Tag Suggestion List 选择和浏览器本地筛选均由这个位置协调。

## User Stories

1. As a Notes Index visitor, I want the initial Caret at the left edge of the editable query region, so that I immediately know where typing begins.
2. As a keyboard visitor, I want a title query Caret to follow each inserted character, so that the terminal prompt behaves like an input editor.
3. As a keyboard visitor, I want Left and Right Arrow to move by one character inside the title query, so that I can edit a title query in place.
4. As a keyboard visitor, I want Left and Right Arrow to cross each Tag Token as one atomic unit, so that I can reach every boundary in the filter sequence predictably.
5. As a keyboard visitor, I want `delete` (⌫) on macOS to remove the one unit to the Caret's left, so that I can remove either a title character or the intended Tag Token.
6. As a keyboard visitor, I want `fn + delete` to remove the one unit to the Caret's right, so that forward deletion matches ordinary text-editor behavior.
7. As a Notes Index visitor, I want Tag Token to remain a fixed prefix before the title query, so that the active Canonical Tag intersection stays easy to read.
8. As a visitor with existing title text, I want a newly selected Tag Token appended to the end of the Tag prefix, so that Tag ordering never depends on my prior title Caret position.
9. As a visitor who selects a new Tag Token, I want the Caret immediately after that Token and before the title query, so that the new selection has an observable editing position.
10. As a visitor whose Caret is between Tag Token, I want plain text input appended to the title query's end, so that Tag Token remain a prefix while typing remains predictable.
11. As a visitor with no title query, I want text typed from the Token region to start at the left edge of the title-query region, so that the first character has an obvious location.
12. As a pointer visitor, I want clicking the left or right half of a Tag Token to place the Caret before or after it, so that Token editing is possible without keyboard-only navigation.
13. As a pointer visitor, I want to click within title text to position the Caret by character, so that pointer editing matches normal input behavior.
14. As a visitor selecting a Tag Suggestion from a `#` fragment in title text, I want only that fragment replaced while the remaining title text stays intact, so that selection does not erase unrelated query text.
15. As a visitor, I want the selected Tag from that suggestion added to the fixed prefix, so that all selected Canonical Tag still intersect with the title query.
16. As a visitor using Chinese input methods, I want composition to complete without Enter or deletion handlers interrupting it, so that I can enter Chinese title queries normally.
17. As a visitor pasting text, I want pasted content treated as ordinary title-query text and appended under the same rule as typing, so that pasted `#tag` text does not create an unexpected Tag Token.
18. As a visitor, I want the Caret to blink with high contrast while the Prompt has focus, so that its active editing state is unmistakable.
19. As a visitor after moving focus elsewhere, I want the Caret to stay visibly static at lower contrast, so that the Prompt remains discoverable without pretending to own keyboard focus.
20. As a visitor who prefers reduced motion, I want the focused Caret to remain visible without blinking, so that the editing affordance remains available without motion.
21. As a visitor, I want existing Tag Suggestion List keyboard and pointer selection, duplicate prevention, no-match recovery, Published Note row navigation, and fixed footer navigation to keep working, so that richer editing does not regress confirmed Notes Index behavior.
22. As a visitor of an empty Publish Set, I want the existing non-interactive empty state, so that an unavailable Caret Editor is not implied.
23. As a privacy-conscious visitor, I want all editing and filtering to remain browser-local with no URL change or server query, so that the Filter Prompt stays a local Notes Index Filter.

## Implementation Decisions

- Extend the dedicated Notes Index Filter Prompt module; Terminal Command Display remains static and Terminal Shell remains the owner of the window, scrolling body, and contextual footer.
- Represent the editable sequence with three coordinated states: the ordered Tag Token prefix, the title-query text, and a Caret position. A Caret position is either a boundary within the Token prefix or a character offset in the title query.
- Tag Token are atomic editing units and never move behind title text. New Token are appended to the prefix, including when title text exists.
- Use the actual Caret state, rather than a fixed trailing decoration, to render the visible block cursor. The default Caret is the beginning of the empty title-query region; text editing uses character positions and Token editing uses prefix boundaries.
- Arrow keys move by character in title text and by a whole Token in the prefix. When a text insertion starts from a Token boundary, append it to the title-query end and relocate the Caret to that end.
- Apply backward and forward deletion to the adjacent unit indicated by the Caret. Preserve the existing no-duplicate Canonical Tag behavior and re-run the browser-local Notes Index Filter after each mutation.
- Use the Token hit target's left/right halves to map pointer input to its preceding/following Caret boundary. Title-query pointer interaction maps to its normal character position.
- Detect the active `#` fragment at the Caret when presenting Tag Suggestion List choices. Selecting a choice replaces that fragment only, preserves all other title-query text, appends the selected Token to the prefix, and positions the Caret after it.
- During IME composition, defer Tag suggestion confirmation and Caret-edit command handling to the browser's composition lifecycle. Pasted text is ordinary title-query text, never implicit Tag Token input.
- Treat the static `$ ls -la ./notes --sort=date | grep -i` pipeline and the editable Token/query region as two indivisible prompt segments. When they no longer fit together, the editable segment starts a new line at the Prompt's left edge; the static pipeline is never split or reordered around it.
- Move an overlong Placeholder or title query to a complete Prompt line and wrap it from the Prompt's left edge instead of clipping or indenting it beneath the current input column. The editable control and visible Caret remain aligned across every visual line, while Enter remains reserved for Tag Suggestion List selection rather than inserting a query line break.
- Focused Caret use high-contrast blinking when motion is allowed. Unfocused Caret remain visible but lower contrast and static; reduced-motion mode makes all Caret states static.
- No publication, API, URL, or search-index contract changes are needed. This is a reversible Notes Index interaction refinement and does not require an ADR.

## Testing Decisions

- Test visitor-observable behavior, not DOM implementation details, visual-cursor positioning algorithms, or internal state representations.
- Use a generated Published Site browser acceptance test as the primary feature seam. It should drive a representative non-empty Publish Set through keyboard and pointer interactions and observe Caret location, visible Token/text state, filtered rows, no-match recovery, and navigation.
- The browser seam must cover the initial empty title-query position; text insertion and character-arrow movement; Token-boundary arrow movement; backward/forward Token and character deletion; Token-side pointer placement; text pointer placement; selecting a Tag after existing text; and insertion from a Token boundary.
- The browser seam must also cover `#` fragment replacement, duplicate suppression, composition-safe handling, paste-as-text, focus/blur/reduced-motion Caret states, existing suggestion controls, row navigation, footer navigation, and the lack of horizontal page overflow.
- At the width where the editable segment wraps, the browser seam must verify that it begins at the Prompt's left edge while the static pipeline remains intact.
- The browser seam must verify that a Placeholder or title query longer than its available width expands to multiple visible lines from the Prompt's left edge, without horizontal clipping.
- Reuse the existing generated Published Site build acceptance for static Prompt accessibility structure, the static `notes --info` Terminal Command Display, Canonical Tag display, and the empty Publish Set state. The existing fixture-driven Published Note metadata and Tag Token scenarios are prior art.
- Keep the full build and typecheck suite as release validation; browser acceptance is the highest behavioral seam for this feature.

## Out of Scope

- `Shift + Arrow` multi-unit selection across Tag Token and title text.
- Batch deletion, clipboard selection semantics, and rich cross-Token paste behavior.
- Complete IME selection semantics beyond preserving normal composition and avoiding command-handler interruption.
- Automatic Tag Token creation from pasted text or plain `#` text without an explicit Tag Suggestion List selection.
- Full-text search, URL persistence, server-side queries, changes to Canonical Tag normalization, Publish Set contents, Note URLs, or contextual navigation destinations.
- Generic terminal-editor abstractions or changes to Terminal Command Display and Terminal Shell responsibilities.

## Further Notes

- The existing deferred expansion record remains under the earlier Filter Prompt effort; this spec is the implementation-ready source for the separate Caret Editor feature.
- The primary acceptance seam reflects the earlier agreement to validate the generated Notes Index through real keyboard and pointer interaction, while the existing build seam protects static output and empty-state behavior.
