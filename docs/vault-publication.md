# Vault 派发与 Publish Set 迁移

本仓库只保存 Vault 侧工作流模板和迁移工具；不要在 Site Repository 中保存跨仓库令牌。Vault 的实际工作流、密钥和笔记 Frontmatter 均由各自仓库的负责人操作。

## 派发契约

将 [Vault 工作流模板](templates/vault-dispatch-published-site.yml) 复制到 Vault 仓库的 `.github/workflows/dispatch-published-site.yml`。它会在任意 tag 的推送（以及手动触发）中向 `picasuo/second-brain-site` 派发：

```json
{
  "event_type": "publish-vault-revision",
  "client_payload": {
    "vault_sha": "<触发该工作流的完整 40 位提交 SHA>"
  }
}
```

这里的 `vault_sha` 直接来自 `github.sha`，不是默认分支随后移动时的 HEAD。Site Repository 已通过该 SHA 检出 Vault Revision、验证实际检出值，并在产物名称和构建诊断中记录它。

## 权限与负责人核验

在把模板放进 Vault 的 `.github/workflows/` 前，由下列负责人逐项完成并记录核验结果：

| 位置 | 配置 | 负责人 | 最小权限 |
| --- | --- | --- | --- |
| Site Repository | Actions variable `VAULT_REPOSITORY=picasuo/second-brain` | Site Repository 管理员 | 无敏感值 |
| Site Repository | Actions secret `VAULT_READ_TOKEN` | Vault Repository 管理员或指定凭据管理员 | 仅 `picasuo/second-brain` 的 Contents: read |
| Vault Repository | Actions secret `SITE_REPOSITORY_DISPATCH_TOKEN` | Site Repository 管理员或指定凭据管理员 | 仅 `picasuo/second-brain-site` 的 Contents: write |

`SITE_REPOSITORY_DISPATCH_TOKEN` 不能用 Vault 自身的 `GITHUB_TOKEN` 替代；它必须是有权对目标 Site Repository 创建 repository dispatch 的细粒度 PAT 或 GitHub App token。令牌只存入 Vault 的 Actions secret，模板通过环境变量交给 `curl`，绝不写入 Git、日志或命令输出。

核验顺序：

1. 两位负责人确认上述变量、密钥归属和最小权限，且未在仓库或本地配置中泄露值。
2. 提交模板到 Vault 默认分支；再创建并推送一个指向该提交的 tag，确认其工作流成功；在 Site Repository 确认收到 `publish-vault-revision`，并检查该 run 的 `Vault Revision`、检出的提交与产物名完全相同。
3. 该 run 成功后才视为派发 Action 已就绪。模板首次产生的空 Publish Set 不会公开未标记的笔记。

GitHub 对 repository dispatch 的细粒度令牌要求目标仓库的 Contents: write；Actions secret 仅能由工作流显式引用。[GitHub REST API 文档](https://docs.github.com/en/rest/repos/repos?apiversion=2022-11-28#create-a-repository-dispatch-event) 与 [Secrets 文档](https://docs.github.com/en/actions/reference/security/secrets) 是权限配置的依据。

## 重新扫描并迁移运营笔记

派发已验证后，在 Vault 的当前 `main` 工作树运行预览：

```sh
pnpm --dir /path/to/second-brain-site migrate:publish-set -- \
  --vault /path/to/second-brain \
  --notes-dir 运维
```

工具递归重新扫描指定运营目录中的 Markdown 笔记，打印完整候选清单但不修改文件。对当前 Vault，预期候选数是 12；该数字或清单若已变化，应由作者重新确认，而不是沿用旧清单。

确认清单和派发 run 后，显式确认并写入：

```sh
pnpm --dir /path/to/second-brain-site migrate:publish-set -- \
  --vault /path/to/second-brain \
  --notes-dir 运维 \
  --dispatch-validated \
  --apply
```

`--apply` 缺少 `--dispatch-validated` 会失败。写入前，工具会预检全部候选笔记的公开 `slug`；任一 slug 不合规则零写入失败。它只在重新扫描的候选笔记没有 `published` 字段时添加 `published: true`；遇到 `published: false` 或其他既有值会停止，而不会覆盖作者已有的发布意图。提交并推送这次 Vault 迁移后，Vault Action 会派发该迁移提交的 SHA；Site Repository 将只使用这个 Publish Set 构建网站。
