# 02 — Publish Set and Note URL Guarantees

**What to build:** Make Published Site Build form a correct Publish Set and expose deterministic Published Note metadata and routes. Readers see all and only valid Published Note ordered consistently; authors receive actionable failures instead of accidental publication or URL ambiguity.

**Blocked by:** 01 — Minimal Published Site Build

**Status:** resolved

- [x] Only notes with Frontmatter `published: true` enter the Publish Set and generate public pages.
- [x] Published Note Metadata applies the title fallback, requires a valid `YYYY-MM-DD` date, and exposes Canonical Tag.
- [x] Note URL follows the validated `slug`-then-path rule; an invalid slug or Note URL Conflict fails the build with a locating diagnostic.
- [x] Notes Index uses Published Note Order: descending date, then `zh-CN` ascending title for equal dates.
- [x] Build-level fixtures cover private-note exclusion, invalid metadata, invalid slug, URL conflict, stable ordering, and Canonical Tag normalization.

## Comments

- 2026-08-06：验收完成。`test/published-site-build.test.ts` 覆盖私有笔记排除、日期/slug 校验、URL 冲突、中文与空格路径隔离、Published Note 顺序及 Canonical Tag；全量 `pnpm test`（33/33）与 `pnpm typecheck`（0 errors、0 warnings）通过。稳定 slug 契约取代早期路径 URL 回退，且约束更严格。
