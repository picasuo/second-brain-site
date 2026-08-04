# Second Brain Site — handoff（2026-08-04）

## 下一次会话的目标

正确完成 Issue 06 的 Vault → Site 派发与发布验收，同时修正上一轮把 Vault 元数据迁移职责放入 Site Repository 的边界错误。

## 先读

- Issue 06：`.scratch/second-brain-site-mvp/issues/06-vault-action-and-publication-migration.md`
- MVP 规格：`.scratch/second-brain-site-mvp/spec.md`
- 跨仓库 ADR：`docs/adr/0001-build-from-dispatched-vault-revision.md`
- 领域用语：`CONTEXT.md`
- Site 接收工作流：`.github/workflows/publish-vault-revision.yml`

## 已确认的边界与现状

- Site Repository 已完成 Issue 05：接收 `repository_dispatch` 的 `publish-vault-revision`，从 payload 中的完整 `vault_sha` 检出 Vault Revision 并构建。不要重做这部分。
- 用户已确认：两仓库所需的 GitHub Actions 令牌与变量均已配置。不要索要、输出、读取或保存任何令牌值。
- 正确流程是 Vault 仓库的 GitHub Action 以触发提交的 `github.sha` 派发 `publish-vault-revision` 到 Site Repository；Site Repository 仅负责接收和构建。
- Vault 侧 Action 目前尚未实际写入 Vault 仓库的 `.github/workflows/`，因此还没有真实派发 run 可验收。
- 用户明确指出：Site Repository 不应修改 Vault 的 Markdown Frontmatter。Vault 的 `published: true` 由用户维护；若需真实迁移/验收，先请求用户配合，不要自行向 Vault 写入。

## 上一轮提交与需要修正的内容

- 当前分支 `main` 是干净的；最新提交为 `5cd48a5 feat: prepare vault publication migration`。
- 该提交中 `scripts/migrate-vault-publish-set.ts`、`src/vault-publish-set-migration.ts`、相应测试、`package.json` script，以及相关 README/文档说明，错误地让 Site Repository 能对传入 Vault 路径写入 `published: true`。下一位 agent 应通过新的更正提交移除这项越界功能，不要用 reset 改写历史。
- `docs/templates/vault-dispatch-published-site.yml` 是一份有效的 Vault Action 模板，但当前位于 Site Repository 的文档目录，GitHub 不会执行它。保留还是移除应由用户确认；若保留，必须明确它只是待复制到 Vault `.github/workflows/dispatch-published-site.yml` 的参考，不代表 Action 已部署。
- Issue 06 的状态和评论目前包含“令牌尚未配置”等已过时表述；在更正时更新为用户已确认配置完成，但尚无实际 Action run。

## 已知内容验收风险

- 上一轮对当前 Vault 的只读扫描曾发现 `运维/` 有 12 篇 Markdown，均未标记发布。这只是历史观察；真正发布前必须再次扫描，不得沿用 12 这个固定清单。
- 曾在临时副本的发布预演发现一篇笔记带有包含空格的 `slug`，不满足规格中的 slug 规则，构建会拒绝它。该 slug 的公开 URL 决策属于作者；不要自动删除或归一化。重新验收时先请用户决定，或由用户在 Vault 中修正。
- 原始 Vault 从未被本轮脚本修改。

## 验证记录

- 在提交 `5cd48a5` 时：`pnpm typecheck` 通过；`pnpm test` 通过（18/18）。
- 完成边界更正后，重跑类型检查、相关单测及完整测试套件。
- Vault Action 真正部署后，验收应使用用户提供或确认的 Vault Revision：确认 Site run 的 payload、检出提交、构建诊断与产物标识一致，并确认未发布笔记/未引用附件不在产物中。

## 建议的后续步骤

1. 先向用户确认是否希望保留文档模板，还是要求仅在 Vault 仓库维护工作流。
2. 通过新提交移除 Site Repository 的 Vault 写入脚本与不再成立的测试/文档断言，修正 Issue 06 的状态和评论。
3. 在用户配合下，在 Vault 仓库部署/确认 Action，并用一次无敏感内容泄露的真实派发验证 Site 接收流程。
4. 等用户在 Vault 中确认 `published: true` 的笔记和 slug 决策后，以那次 Vault SHA 做最终 Published Site 验收。

## Suggested skills

- `implement`：继续 Issue 06 的更正与实现时使用；先读技能文件。
- `tdd`：为 Site Repository 的可观察派发/构建边界补测试时使用；先确认测试 seam。
- `obsidian-vault`：仅在用户明确要求协助检查或维护 Vault 内容时使用；遵守“不要由 Site Repository 写 Vault”这一边界。
