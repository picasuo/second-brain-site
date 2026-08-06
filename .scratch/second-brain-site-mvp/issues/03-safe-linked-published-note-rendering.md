# 03 — Safe Linked Published Note Rendering

**What to build:** Render Published Note as supported MVP Markdown while safely resolving its attachments and Content Link. Readers can follow valid internal links, anchors, attachments and external links; authors receive correct blocking errors or non-blocking diagnostics according to the publication rules.

**Blocked by:** 02 — Publish Set and Note URL Guarantees

**Status:** resolved

- [x] MVP Markdown renders headings, paragraphs, lists, emphasis, quotes, rules, tables, inline code, fenced language-tagged code, standard links, images and PDFs.
- [x] Each Published Attachment is Vault-local, copied safely, and exposed at its Attachment URL; unresolved, unreadable, out-of-Vault or external-symlink attachments fail the build with a locating diagnostic.
- [x] Relative Markdown links resolve to Note URL or Attachment URL and preserve Heading Anchor; External Link remains unchanged and is never network-validated.
- [x] Unpublished Link points to its target Note URL, whose page is not generated and returns 404.
- [x] Unresolved Content Link leaves readable non-clickable text, emits a source-and-target diagnostic, and does not fail the build.
- [x] A Table of Contents is generated from level-two and level-three headings and links to the same Heading Anchor used in the rendered note.
- [x] Build-level fixtures exercise duplicate headings, links, anchors, PDF and image attachments, external links, Unpublished Link, Unresolved Content Link, and every attachment failure mode.

## Comments

- 2026-08-06：验收完成。`test/published-site-build.test.ts` 覆盖 MVP Markdown、目录、链接/锚点、图片和 PDF 附件、未公开与未解析 Content Link，以及缺失、越界、外部 symlink、不可读附件的阻断行为；真实 `v0.0.7` 发布另验证一项 Published Attachment 返回 200。全量 `pnpm test`（33/33）与 `pnpm typecheck`（0 errors、0 warnings）通过。
