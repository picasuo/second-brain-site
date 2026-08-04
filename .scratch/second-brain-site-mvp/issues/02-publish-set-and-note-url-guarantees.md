# 02 — Publish Set and Note URL Guarantees

**What to build:** Make Published Site Build form a correct Publish Set and expose deterministic Published Note metadata and routes. Readers see all and only valid Published Note ordered consistently; authors receive actionable failures instead of accidental publication or URL ambiguity.

**Blocked by:** 01 — Minimal Published Site Build

**Status:** ready-for-agent

- [ ] Only notes with Frontmatter `published: true` enter the Publish Set and generate public pages.
- [ ] Published Note Metadata applies the title fallback, requires a valid `YYYY-MM-DD` date, and exposes Canonical Tag.
- [ ] Note URL follows the validated `slug`-then-path rule; an invalid slug or Note URL Conflict fails the build with a locating diagnostic.
- [ ] Notes Index uses Published Note Order: descending date, then `zh-CN` ascending title for equal dates.
- [ ] Build-level fixtures cover private-note exclusion, invalid metadata, invalid slug, URL conflict, stable ordering, and Canonical Tag normalization.
