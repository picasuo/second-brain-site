# 06 — Vault Action and Publication Migration

**What to build:** Add the Vault-side action that dispatches a Vault Revision to the Site Repository, then safely migrate the current publishable operational notes into the Publish Set. This makes public release author-driven and sends the Site Repository the exact content version it must build.

**Blocked by:** 05 — Site Repository Vault Revision Receipt

**Status:** ready-for-agent

- [ ] The Vault action emits the agreed repository dispatch event and includes the immutable `vault_sha` for the triggering Vault Revision.
- [ ] Required cross-repository permissions and secret ownership are documented and validated with the responsible owner before the action is enabled.
- [ ] Immediately before migration, the Vault is re-scanned so the migration reflects the then-current publishable operational notes rather than the earlier set of 12.
- [ ] The migration adds `published: true` only after the action is ready and only to the re-scanned intended notes.
- [ ] A dispatched Vault Revision produces a Published Site from the migrated Publish Set without exposing unpublished notes or non-referenced attachments.
