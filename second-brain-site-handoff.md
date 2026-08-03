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
- The next unanswered grilling question is: what should the home page `/` primarily show — a personal-site introduction plus recent notes, or an entry point to `/notes/`?

## Known deferred inputs

The user will provide deployment-specific values later: domain, server details, container registry, and secret ownership. Do not invent or request secrets before deployment work actually needs them.

## Suggested skills

- `grill-with-docs` and `domain-modeling`: resume product decisions and update `CONTEXT.md` immediately as terms resolve.
- `obsidian-vault` and `obsidian-markdown`: inspect the source Vault again before implementing the importer or migrating `published: true`.
- `tdd`: use if the user asks for test-first implementation; otherwise build and verify proportionately.
- `figma-use-figjam`: use only if the FigJam board needs to be read or changed.

