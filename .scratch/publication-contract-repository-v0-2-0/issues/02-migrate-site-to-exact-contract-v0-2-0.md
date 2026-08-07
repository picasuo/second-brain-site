# 02 — Site 使用精确的 Contract v0.2.1

**What to build:** Site Repository 从本地 workspace Contract 迁移为锁定的 npm `@picasuo/publish-set-contract@0.2.1`，使 Published Site Build 与 Vault Revision receipt 都使用可重现的已发布 Publication Contract，而不改变 Publish Set 的公开行为。

**Blocked by:** 01 — 初始化 Contract Repository 并发布 v0.2.1.

**Status:** completed

- [x] Site 不再拥有或通过 workspace 解析 Contract 源码，并精确锁定 `0.2.1` 的 registry 产物与完整性信息。
- [x] Published Site Build、现有 fixture 和 Vault Revision receipt 测试继续通过，且由已发布的 Contract Package 提供同一公开 Interface。
- [x] Site 仅接受与其已锁定版本相同的 `contract_version: 0.2.1`；缺失、无效或不匹配版本在检出 Vault Revision 前失败并不部署。
- [x] Site 的术语与 ADR 记录 Contract Repository 为 Contract Package Release 的所有者，移除“由 Site workspace 发布”的过时决定。

## Comments

- 2026-08-07：Site 已在提交 `db75fd2` 迁移至精确的 `@picasuo/publish-set-contract@0.2.1` registry 依赖；`pnpm-lock.yaml` 记录已解析版本与完整性哈希。移除了本地 workspace Contract 源码和 workspace 清单，Vault Revision receipt 改为以已安装包导出的 `publicationContractVersion` 在检出 Vault Revision 前校验。`pnpm install --frozen-lockfile --offline`、`pnpm typecheck` 与 `pnpm test` 均通过（25 项测试）。
