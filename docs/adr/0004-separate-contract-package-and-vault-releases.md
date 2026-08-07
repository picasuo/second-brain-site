---
Status: accepted
---

# 分离 Contract Package Release 与 Vault Release Tag

`@picasuo/publish-set-contract` 由独立的 Contract Repository 拥有源码、版本、Git tag 与 npm 发布职责。每个 Contract Package Release 都从该仓库经过验证的提交发布为不可变的精确版本；Site Repository 与 Vault 均只安装这一 registry 产物，不能通过 workspace、版本范围或本地源码替代它。

Vault Release Tag 继续只属于 Vault，并只表达要构建的不可变 `vault_sha`。它不能触发 npm 发布，也不能被 Contract Package Release 取代。Vault 端工作流只匹配专用内容发布 tag（`vault-release-*`），并在 Release Preflight 固定的精确 Contract Package 版本与 Site 派发回执中传递同一 `contract_version`。

Site Repository 在检出 Vault Revision 前，使用已安装 Contract Package 导出的版本验证回执。缺失、无效或与已安装精确版本不一致的 `contract_version` 均为 Blocking Error，不能构建或部署 Published Site。这样，Vault Revision receipt、Published Site Build 与 artifact receipt 可共同追溯到同一个不可变 Contract Package Release。

## Considered Options

- **由 Site Repository 以 `contract-v*` 发布包：** 拒绝；Git tag、发布权限与源码生命周期仍会耦合到站点应用，且 Site 会继续容易误用本地源码。
- **保留 workspace 并只比较版本字符串：** 拒绝；这无法证明 Published Site 使用的是 Vault Release Preflight 所固定的 registry 产物。
- **让 Contract Repository 单独发布并让消费者精确安装：** 采用；代价是 Contract、Vault 与 Site 升级必须经过受控发布窗口并显式协调版本。
