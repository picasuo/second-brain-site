# 从派发的 Vault Revision 构建网站

Vault 更新后通过仓库派发通知 Site Repository，并在负载中携带 `vault_sha`。站点构建必须检出该提交而非构建时的默认分支头部，因此每次 Published Site 都能准确追溯到触发它的 Vault Revision；代价是需要维护跨仓库派发权限和构建并发控制。
