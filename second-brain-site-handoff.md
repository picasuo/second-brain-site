# Second Brain Site — next-session handoff

## Goal

Continue the product-design grilling session, then bootstrap and implement the Astro MVP once the remaining product choices are settled.

## Read first

- Domain language and all confirmed content rules: `CONTEXT.md` in the workspace root.
- Cross-repository build decision: `docs/adr/0001-build-from-dispatched-vault-revision.md`.
- Initial implementation roadmap: [FigJam handoff board](https://www.figma.com/board/4GbkGZ00X9dLHwPFeTBuNc/second-brain-site?node-id=2-2).
- Repository instructions: `AGENTS.md` and `docs/agents/`.

Do not repeat the decisions already recorded in `CONTEXT.md`.

## Current status

- The workspace has no Astro application source yet; the current work completed domain discovery and documentation only.
- The content source inspected during this session was `<USER_HOME>/Documents/second-brain/运维`.
  - It contains 12 Markdown notes and local assets.
  - Existing notes use standard Markdown relative `.md` links, same-page anchors, standard image links, and external HTTP(S) links. They do not use Obsidian Wiki links or embeds.
  - Each inspected note has `title`, `date`, and YAML-list `tags`; none currently has `published: true`.
- When implementing the GitHub Action in the Vault project, batch-add `published: true` to the current 12 operational notes. Re-scan then because the set may have changed; do not make that external write before the Action work.
- The home page `/` has been settled as a personal introduction with a clear entry point to `/notes/`; it is not a notes list.
- Tag Browsing by Canonical Tag is explicitly deferred beyond the MVP; `/notes/` has no tag-filtering UI or tag-specific routes.
- Search is explicitly deferred beyond the MVP; `/notes/` is a single list ordered by Published Note Order.
- Canonical Tag is shown as read-only metadata in Notes Index items and Published Note pages, but does not filter or navigate in the MVP.
- MVP uses Contextual Navigation only: Home links into `/notes/`, while Published Note pages provide a return to the Notes Index; there is no persistent global navigation.
- Every Published Note page includes an automatically generated Table of Contents from its level-two and level-three headings, linking to its Heading Anchors.
- Until the author supplies personal details, Home uses this provisional, easily replaceable copy: “你好，这里是我整理思考与实践的地方。记录工程实践、工具、系统运维与持续学习中的问题、方法和复盘。公开内容均从日常 Obsidian Vault 中挑选、整理后发布。” Its CTA is “浏览笔记” and links to `/notes/`. Do not invent a name, portrait, biography, or external accounts.

## Known deferred inputs

The user will provide deployment-specific values later: domain, server details, container registry, and secret ownership. Do not invent or request secrets before deployment work actually needs them.

## Suggested skills

- `grill-with-docs` and `domain-modeling`: resume product decisions and update `CONTEXT.md` immediately as terms resolve.
- `obsidian-vault` and `obsidian-markdown`: inspect the source Vault again before implementing the importer or migrating `published: true`.
- `tdd`: use if the user asks for test-first implementation; otherwise build and verify proportionately.
- `figma-use-figjam`: use only if the FigJam board needs to be read or changed.
