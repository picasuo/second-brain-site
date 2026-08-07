# Vault 派发工作流

本仓库只保存 Vault 侧工作流模板；不要在 Site Repository 中保存跨仓库令牌。Vault 的实际工作流、密钥和笔记 Frontmatter 均由 Vault 负责人操作。

## 派发契约

将 [Vault 工作流模板](templates/vault-dispatch-published-site.yml) 复制到 Vault 仓库的 `.github/workflows/dispatch-published-site.yml`。它只会在 `vault-release-*` tag 的推送中向 `picasuo/second-brain-site` 派发；普通 tag 和手动运行都不会触发公开部署。

```json
{
  "event_type": "publish-vault-revision",
  "client_payload": {
    "vault_sha": "<触发该工作流的完整 40 位提交 SHA>",
    "contract_version": "<已固定的 Publication Contract 包版本>"
  }
}
```

这里的 `vault_sha` 直接来自 `github.sha`，不是默认分支随后移动时的 HEAD。将 Vault 的 Actions variable `PUBLICATION_CONTRACT_VERSION` 设为**精确的** `0.2.1`。派发模板会拒绝空值、范围、`latest` 或任何不等于 `0.2.1` 的值。Site Repository 会先拒绝缺失、不完整或版本不匹配的回执，之后才检出 Vault Revision；成功产物中的 `publication-receipt.json`、构建诊断和 job summary 都记录这两个值。

## Release Preflight

在创建任何 `vault-release-*` tag 前，由 Vault 作者明确执行以下一次性配置；不要让 Site Repository 或自动化流程改写 Vault 笔记：

1. 将 [依赖模板](templates/vault-release-package.json) 合并到 Vault 的 `package.json`，并将 [预检脚本](templates/vault-release-preflight.mjs) 复制为 `scripts/release-preflight.mjs`。依赖必须保持为 `"@picasuo/publish-set-contract": "0.2.1"`，不得使用范围或 `latest`。
2. 由作者运行 `npm install --package-lock-only`，审阅并提交更新的 `package.json`、`package-lock.json` 与预检脚本。锁文件应解析 `@picasuo/publish-set-contract@0.2.1` 并记录其完整性信息。
3. 在准备发布的 Vault Revision 上运行 `npm ci --ignore-scripts && npm run release:preflight`。只有命令以零退出码结束时，才创建并推送 `vault-release-<name>` tag。

预检只调用 Publication Contract 的无写入校验；它输出 Blocking Error 并以非零状态退出，不会生成或写入 Stable Note Slug、Frontmatter 或任何 Vault 笔记。派发工作流会在发送 repository dispatch 前对 tag 所指向的同一 Revision 再运行一次预检，因此即使有人跳过发布前命令，含 Blocking Error 的 tag 也不会部署公开站点。

## 权限与负责人核验

在把模板放进 Vault 的 `.github/workflows/` 前，由下列负责人逐项完成并记录核验结果：

| 位置 | 配置 | 负责人 | 最小权限 |
| --- | --- | --- | --- |
| Site Repository | Actions variable `VAULT_REPOSITORY=picasuo/second-brain` | Site Repository 管理员 | 无敏感值 |
| Site Repository | Actions secret `VAULT_READ_TOKEN` | Vault Repository 管理员或指定凭据管理员 | 仅 `picasuo/second-brain` 的 Contents: read |
| Vault Repository | Actions secret `SITE_REPOSITORY_DISPATCH_TOKEN` | Site Repository 管理员或指定凭据管理员 | 仅 `picasuo/second-brain-site` 的 Contents: write |
| Vault Repository | Actions variable `PUBLICATION_CONTRACT_VERSION=0.2.1` | Vault Repository 管理员 | 与 Release Preflight 固定依赖一致 |

`SITE_REPOSITORY_DISPATCH_TOKEN` 不能用 Vault 自身的 `GITHUB_TOKEN` 替代；它必须是有权对目标 Site Repository 创建 repository dispatch 的细粒度 PAT 或 GitHub App token。令牌只存入 Vault 的 Actions secret，模板通过环境变量交给 `curl`，绝不写入 Git、日志或命令输出。

核验顺序：

1. 两位负责人确认上述变量、密钥归属和最小权限，且未在仓库或本地配置中泄露值。
2. 在 Vault Revision 上完成 `npm ci --ignore-scripts && npm run release:preflight`，确认没有 Blocking Error；由作者创建并推送一个指向该提交的 `vault-release-*` tag，确认其工作流成功；在 Site Repository 确认收到 `publish-vault-revision`，并检查该 run 的 `Vault Revision`、检出的提交与产物名完全相同。
3. 该 run 成功后才视为派发 Action 已就绪。模板首次产生的空 Publish Set 不会公开未标记的笔记。

GitHub 对 repository dispatch 的细粒度令牌要求目标仓库的 Contents: write；Actions secret 仅能由工作流显式引用。[GitHub REST API 文档](https://docs.github.com/en/rest/repos/repos?apiversion=2022-11-28#create-a-repository-dispatch-event) 与 [Secrets 文档](https://docs.github.com/en/actions/reference/security/secrets) 是权限配置的依据。
