# 03 — Safe Linked Published Note Rendering

**What to build:** Render Published Note as supported MVP Markdown while safely resolving its attachments and Content Link. Readers can follow valid internal links, anchors, attachments and external links; authors receive correct blocking errors or non-blocking diagnostics according to the publication rules.

**Blocked by:** 02 — Publish Set and Note URL Guarantees

**Status:** ready-for-agent

- [ ] MVP Markdown renders headings, paragraphs, lists, emphasis, quotes, rules, tables, inline code, fenced language-tagged code, standard links, images and PDFs.
- [ ] Each Published Attachment is Vault-local, copied safely, and exposed at its Attachment URL; unresolved, unreadable, out-of-Vault or external-symlink attachments fail the build with a locating diagnostic.
- [ ] Relative Markdown links resolve to Note URL or Attachment URL and preserve Heading Anchor; External Link remains unchanged and is never network-validated.
- [ ] Unpublished Link points to its target Note URL, whose page is not generated and returns 404.
- [ ] Unresolved Content Link leaves readable non-clickable text, emits a source-and-target diagnostic, and does not fail the build.
- [ ] A Table of Contents is generated from level-two and level-three headings and links to the same Heading Anchor used in the rendered note.
- [ ] Build-level fixtures exercise duplicate headings, links, anchors, PDF and image attachments, external links, Unpublished Link, Unresolved Content Link, and every attachment failure mode.
