# 05 — Published Note Slug Migration

**What to build:** Author-review and migrate the current Publish Set to stable slugs, including the Oracle multi-node note whose path-derived route returned 404.

**Blocked by:** 04

**Status:** resolved

- [x] The Vault author confirms every current Published Note and its stable slug.
- [x] The Oracle multi-node note receives a persistent slug before the next release tag.
- [x] Any private Content Link target that should remain an Unpublished Link has a slug; other missing-slug targets are accepted as unresolved diagnostics.
- [x] The author reviews, commits and tags the changed Vault Revision.

## Comments

- 2026-08-06 — 已审阅当前 Publish Set：`Cloudflare Tunnel 完整方案` 使用 `cloudflare-tunnel-solution`，`Oracle 多机集群零公网架构方案` 使用 `n-dc38d8d8-5706-421f-bfd4-682b46d1becc`，`Oracle 服务器开机 SOP` 使用 `oracle-server-setup`。缺失 slug 的私有链接目标按工单接受为非阻断 Unresolved Content Link，未创建额外 404 URL。默认 Release Preflight 已通过（保留上述非阻断诊断）；迁移和预检修复已提交为 Vault commit `e137dae`。尚未创建或推送 release tag，待作者人工审阅后完成。
- 2026-08-06 — 作者已提交并发布 Vault tag `v0.0.6`；部署后的 Oracle 多机 Published Note 已可访问：[https://picasuo.qzz.io/notes/n-dc38d8d8-5706-421f-bfd4-682b46d1becc/](https://picasuo.qzz.io/notes/n-dc38d8d8-5706-421f-bfd4-682b46d1becc/)。
