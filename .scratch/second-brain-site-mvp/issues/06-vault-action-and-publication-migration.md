# 06 — Vault Action and Publication Migration

**What to build:** Add the Vault-side action that dispatches a Vault Revision to the Site Repository, then safely migrate the current publishable operational notes into the Publish Set. This makes public release author-driven and sends the Site Repository the exact content version it must build.

**Blocked by:** 05 — Site Repository Vault Revision Receipt

**Status:** needs-info

- [ ] The Vault action emits the agreed repository dispatch event and includes the immutable `vault_sha` for the triggering Vault Revision.
- [ ] Required cross-repository permissions and secret ownership are documented and validated with the responsible owner before the action is enabled.
- [ ] Immediately before migration, the Vault is re-scanned so the migration reflects the then-current publishable operational notes rather than the earlier set of 12.
- [ ] The migration adds `published: true` only after the action is ready and only to the re-scanned intended notes.
- [ ] A dispatched Vault Revision produces a Published Site from the migrated Publish Set without exposing unpublished notes or non-referenced attachments.

## Comments

- 2026-08-04：已重新扫描当前 Vault `main`：`运维/` 下仍有 12 篇 Markdown 运营笔记，均未设置 `published: true`。已记录 Vault 派发工作流模板与最小权限/密钥归属核验清单；Vault Frontmatter 由 Vault 负责人维护，Site Repository 不提供迁移工具。
- 2026-08-04：在临时 Vault 副本进行端到端预演时，发现 `运维/Cloudflare Tunnel 完整方案.md` 的既有 `slug: cloudflare tunnel solution` 含空格，不符合已确认的单层小写字母、数字和连字符规则。请作者决定该笔记是删除该 `slug` 以使用路径 URL，还是改为所需的合法公开 slug；不得由 Site Repository 猜测或覆盖。
- 2026-08-04：Site Repository 与 Vault Repository 的负责人需按 `docs/vault-publication.md` 配置并验证 `VAULT_READ_TOKEN`、`SITE_REPOSITORY_DISPATCH_TOKEN` 和 `VAULT_REPOSITORY`，之后才能启用 Vault Action、写入 Frontmatter 并完成最终派发验收。
