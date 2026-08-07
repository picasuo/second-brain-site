# 03 — Vault 升级 Preflight 与 Release Tag

**What to build:** Vault 的 Release Preflight 与派发配置精确采用 `@picasuo/publish-set-contract@0.2.1`，并将公开部署收窄为专用 Vault Release Tag，使每个待发布的 Vault Revision 都以明确的 `contract_version` 派发给 Site。

**Blocked by:** 01 — 初始化 Contract Repository 并发布 v0.2.1.

**Status:** ready-for-agent

- [x] Vault 的 Release Preflight、固定依赖和 `PUBLICATION_CONTRACT_VERSION` 都声明同一个精确的 `0.2.1`，不使用版本范围或 latest。
- [x] 只有专用 Vault Release Tag 触发派发；它携带触发 tag 所指向的完整 Vault SHA 和 `contract_version: 0.2.1`。
- [x] Release Preflight 在 Blocking Error 存在时阻止创建验收 tag，且不在未获作者显式请求时写入 Vault。
- [x] Vault 的派发凭据仍仅拥有向 Site 创建 repository dispatch 的最小权限，且不输出密钥值。
