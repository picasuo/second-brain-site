# 06 — Vault Action and Publication Migration

**What to build:** Add the Vault-side action that dispatches a Vault Revision to the Site Repository, then safely migrate the current publishable operational notes into the Publish Set. This makes public release author-driven and sends the Site Repository the exact content version it must build.

**Blocked by:** 05 — Site Repository Vault Revision Receipt

**Status:** resolved

- [x] The Vault action emits the agreed repository dispatch event and includes the immutable `vault_sha` for the triggering Vault Revision.
- [x] Required cross-repository permissions and secret ownership are documented and validated with the responsible owner before the action is enabled.
- [x] Immediately before migration, the Vault is re-scanned so the migration reflects the then-current publishable operational notes rather than the earlier set of 12.
- [x] The migration adds `published: true` only after the action is ready and only to the re-scanned intended notes.
- [x] A dispatched Vault Revision produces a Published Site from the migrated Publish Set without exposing unpublished notes or non-referenced attachments.

## Comments

- 2026-08-04：已重新扫描当前 Vault `main`：`运维/` 下仍有 12 篇 Markdown 运营笔记，均未设置 `published: true`。已记录 Vault 派发工作流模板与最小权限/密钥归属核验清单；Vault Frontmatter 由 Vault 负责人维护，Site Repository 不提供迁移工具。
- 2026-08-04：在临时 Vault 副本进行端到端预演时，发现 `运维/Cloudflare Tunnel 完整方案.md` 的既有 `slug: cloudflare tunnel solution` 含空格，不符合已确认的单层小写字母、数字和连字符规则。请作者决定该笔记是删除该 `slug` 以使用路径 URL，还是改为所需的合法公开 slug；不得由 Site Repository 猜测或覆盖。
- 2026-08-04：Site Repository 与 Vault Repository 的负责人需按 `docs/vault-publication.md` 配置并验证 `VAULT_READ_TOKEN`、`SITE_REPOSITORY_DISPATCH_TOKEN` 和 `VAULT_REPOSITORY`，之后才能启用 Vault Action、写入 Frontmatter 并完成最终派发验收。
- 2026-08-05：已通过 Vault tag `v0.0.1` 验证真实派发。Vault Action 成功将 `vault_sha` `7a70f5ea9b21db7fa47d00bee0f197aade32ea04` 派发至 Site Repository；Site Repository 的 `publish-vault-revision #4` 成功完成。该结果同时验证了 Vault 的 `SITE_REPOSITORY_DISPATCH_TOKEN` 与 Site Repository 的 Vault 读取配置可用。
- 2026-08-05：Vault tag `v0.0.4` 的 Vault Revision `1e6b9366665d8524d99a79c109a48303b582f5f7` 经 Site Repository 的 `publish-vault-revision #7` 成功构建并部署。`运维/Cloudflare Tunnel 完整方案.md` 以布尔值 `published: true` 进入 Publish Set；此前 `v0.0.3` 的 `published: "true"` 是字符串，因此未进入 Publish Set。线上 Published Note 可访问，且其指向未公开 `Oracle 多机集群零公网架构方案` 的 Note URL 返回 404。该次发布尚未提供 Published Attachment 或非阻断 Unresolved Content Link 的真实验收样本。
- 2026-08-06：本 Issue 的最终迁移验收因 [Stable Published Note Identity and Release Preflight](../../stable-published-note-identity/spec.md) 暂缓，而非关闭。Published Note 将改为必须使用持久 `slug`，不再使用 Vault 路径 URL 回退；Vault Release Preflight 也必须在新 tag 前使用与 Site 相同版本的 Publication Contract。既有派发和权限证据继续有效，但不能单独证明新发布契约。待 [04 — Vault Release Preflight](../../stable-published-note-identity/issues/04-vault-release-preflight.md) 与 [05 — Published Note Slug Migration](../../stable-published-note-identity/issues/05-published-note-slug-migration.md) 完成后，以新的 Vault Revision 恢复本 Issue 的迁移验收。
- 2026-08-06：迁移验收恢复并完成。稳定身份迁移的作者审阅、Vault 预检、提交与 tag 记录在 [05 — Published Note Slug Migration](../../stable-published-note-identity/issues/05-published-note-slug-migration.md)；`v0.0.7` 指向 Vault SHA `3c2b1154b4628ca4f2357a2afffdb66b1f2062a5`，以 Contract `0.1.0` 派发，Site 成功构建并部署 artifact `published-site-3c2b1154b4628ca4f2357a2afffdb66b1f2062a5`。产品负责人复核正式站点，确认当前且仅有 `cloudflare-tunnel-solution`、`oracle-server-setup`、`n-dc38d8d8-5706-421f-bfd4-682b46d1becc` 三篇 Published Note，均可访问；其余未发布笔记仍返回 404。Site 验收同时覆盖一项 Published Attachment 返回 200，详见 [06 — Stable Identity Release Acceptance](../../stable-published-note-identity/issues/06-stable-identity-release-acceptance.md)。这以最终的重新审阅 Publish Set 取代早期 12 篇候选清单，并证明未额外公开笔记或非引用附件。
