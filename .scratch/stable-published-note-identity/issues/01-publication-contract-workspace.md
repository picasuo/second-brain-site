# 01 — Publication Contract Workspace

**What to build:** Convert the public Site Repository to a pnpm workspace and add the publishable `@picasuo/publish-set-contract` package. Its interface is side-effect-free and returns structured publication validation results and missing-slug proposals; it never writes Vault files.

**Blocked by:** none

**Status:** resolved

- [x] The workspace contains a separately versioned public package with build, typecheck and test entry points.
- [x] The package exposes Publication Contract validation and proposal types without Astro, GitHub Actions, credentials or write operations.
- [x] The Site application can consume the workspace package without changing Vault visibility or deployment credentials.
- [x] Package publication instructions pin a released npm version for external consumers.

## Comments

- 2026-08-06 — 已由 `9a3455d` 实现并发布 `@picasuo/publish-set-contract@0.1.0`；2026-08-06 全量测试与类型检查通过。状态改为 `ready-for-human`，等待维护者关闭（本 tracker 没有 completed 标签）。
