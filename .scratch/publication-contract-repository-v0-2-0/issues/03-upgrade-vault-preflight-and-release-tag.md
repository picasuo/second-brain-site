# 03 — Vault 升级 Preflight 与 Release Tag

**What to build:** Vault 的 Release Preflight 与派发配置精确采用 `@picasuo/publish-set-contract@0.2.1`，并将公开部署收窄为专用 Vault Release Tag，使每个待发布的 Vault Revision 都以明确的 `contract_version` 派发给 Site。

**Blocked by:** 01 — 初始化 Contract Repository 并发布 v0.2.1.

**Status:** ready-for-agent

- **Completion:** completed

- [x] Vault 的 Release Preflight 与冻结锁文件精确采用 `@picasuo/publish-set-contract@0.2.1`，不使用版本范围或 latest；派发的 `contract_version` 取自 CI 已安装包导出的版本。
- [x] 只有专用 Vault Release Tag 触发派发；它携带触发 tag 所指向的完整 Vault SHA 和 `contract_version: 0.2.1`。
- [x] Release Preflight 在 Blocking Error 存在时阻止创建验收 tag，且不在未获作者显式请求时写入 Vault。
- [x] Vault 的派发凭据仍仅拥有向 Site 创建 repository dispatch 的最小权限，且不输出密钥值。

## Comments

- 2026-08-07：已在 Vault 工作区完成依赖与锁文件升级（`@picasuo/publish-set-contract@0.2.1`），并将派发收据版本改为从 `pnpm install --frozen-lockfile` 后已安装包的 `publicationContractVersion` 读取。工作流仅匹配 `vault-release-*`，会先运行只读 Release Preflight；发布脚本创建 `vault-release-vX.Y.Z`。Vault 的测试与实际只读预检均通过，未写入笔记。相关 Vault 提交：`28d4f07`、`a2bd098`。
