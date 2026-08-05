# Second Brain Site — handoff（2026-08-05）

## 下一次会话的目标

完成 Issue 06 与 Issue 07 的剩余真实发布验收：先由 Vault 作者确认完整 Publish Set，再验收 Published Attachment 与构建诊断边界。不要重新实现已完成的 Vault Revision 派发、构建或 GitHub Pages 部署链路。

## 先读

- [Issue 06](.scratch/second-brain-site-mvp/issues/06-vault-action-and-publication-migration.md)
- [Issue 07](.scratch/second-brain-site-mvp/issues/07-end-to-end-published-site-acceptance.md)
- [MVP 规格](.scratch/second-brain-site-mvp/spec.md)
- [领域用语](CONTEXT.md)
- [ADR-0001：派发的 Vault Revision](docs/adr/0001-build-from-dispatched-vault-revision.md)
- [ADR-0002：GitHub Pages 部署](docs/adr/0002-deploy-published-site-to-github-pages.md)
- [Site 接收与部署工作流](.github/workflows/publish-vault-revision.yml)

## 当前已验证状态

- Issue 05 已完成：Site Repository 只从 repository dispatch payload 的完整 `vault_sha` 检出 Vault Revision，不会使用移动中的默认分支头部。
- Vault 的 `.github/workflows/dispatch-published-site.yml` 已在 tag 推送时派发 `publish-vault-revision`。Vault 侧的 `SITE_REPOSITORY_DISPATCH_TOKEN` 与 Site 侧 Vault 读取配置已通过真实 run 验证；不要索取、输出或保存令牌值。
- Site Repository 工作流已在 `f42369c` 支持 GitHub Pages：构建 artifact 名为 `published-site-<vault-sha>`，随后在独立 deploy job 自动部署。公开入口为 `https://picasuo.qzz.io/`；Cloudflare 将 `picasuo.qzz.io` 的 apex CNAME（`@`）解析至 `picasuo.github.io`。
- 最新真实验收是 Vault tag `v0.0.4`，Vault Revision `1e6b9366665d8524d99a79c109a48303b582f5f7`。Site 的 [publish-vault-revision #7](https://github.com/picasuo/second-brain-site/actions/runs/30974705130) 成功构建和部署，artifact 为 `published-site-1e6b9366665d8524d99a79c109a48303b582f5f7`。
- `运维/Cloudflare Tunnel 完整方案.md` 已以布尔值 `published: true` 成为 Published Note，线上 URL 是 `/notes/cloudflare-tunnel-solution/`；已验证日期、Canonical Tag、Table of Contents、Markdown 表格/代码块以及返回 Notes Index 导航。
- 该 Published Note 的一个 Content Link 指向未公开 `Oracle 多机集群零公网架构方案`；它保留目标 Note URL，直接访问结果为 GitHub Pages 404，符合 Unpublished Link 规则。
- `v0.0.3` 曾写成 `published: "true"`（字符串）并只生成 Home/Notes Index；它不进入 Publish Set。后续必须使用未加引号的 YAML 布尔值 `published: true`。
- Vault 的 [文档编写规范.md](/Users/picasuo/Documents/second-brain/文档编写规范.md) 已增加 Second Brain Site 的公开发布要求：合法 Frontmatter、受支持 Markdown、附件安全边界与公开内容检查。
- Site Repository 当前已记录真实验收证据的提交是 `76ac16f`；Issue 06、07 的 Comments 是后续验收证据的权威记录。

## 已知边界与未完成事项

- Site Repository 不得写入或批量迁移 Vault Frontmatter。`published: true`、Publish Set 和 Vault release tag 一律由 Vault 作者操作，除非用户对具体文件给予明确授权。
- Issue 06 仍为 `needs-info`（2/5）：需要在最终迁移前重新扫描 Vault、由作者确认完整 Publish Set，并以该集合完成迁移验收。不得沿用历史“12 篇”的清单作为当前决定。
- Issue 07 仍为 `ready-for-agent`（2/5）：已完成 Revision 可追溯性和部署值记录；仍需完成完整读者体验、Published Attachment、以及阻断错误/非阻断 Unresolved Content Link 的验收。
- 当前 Published Note 沿用了正文同名 `# Cloudflare Tunnel 完整方案`，与页面模板生成的 H1 重复。Vault 作者决定后续自行把正文调整为从 `##` 开始；不要由下一位 agent 自动修改或发布该笔记。
- 最新真实发布没有 Published Attachment，也没有 Unresolved Content Link 诊断。因此附件曝光规则和非阻断诊断尚未在真实 run 中留证；不要为此在生产页面中随意制造失效链接，先与作者确定可接受的受控验收方式。
- 最新 run 有 GitHub Actions Node 20 弃用警告，但 Actions 被强制以 Node 24 运行，构建与部署均成功；该警告不阻断当前验收。

## 建议验收顺序

1. 作者重新扫描 Vault 并确认哪些笔记及其附件构成完整 Publish Set；检查 `published: true` 是布尔值、`date` 合法、`slug`（若设置）只含小写字母/数字/连字符。
2. 选择至少一篇带真实本地图片或 PDF 的 Published Note，确认其附件位于 Vault 内且能以相对路径解析；由作者创建新的 release tag。
3. 在 Site Actions 中记录 payload SHA、实际检出 SHA、artifact 名和部署 URL 一致，并在浏览器中验收 Home、Notes Index、Published Note、未公开 Note URL 的 404 和附件 URL。
4. 与作者约定不污染正式发布的受控方式，证明阻断构建错误与非阻断 Unresolved Content Link 诊断的差异；将 run / artifact 证据追加到 Issue 07。
5. 仅在所有 Issue 06/07 checkbox 都有可复现证据后再更新状态；不要仅因页面可访问就关闭 ticket。

## 近期 Site Repository 提交

- `76ac16f` — 记录真实 Published Note、未公开链接 404 和 Issue 06/07 验收证据。
- `f42369c` — 自动将指定 Vault Revision artifact 部署到 GitHub Pages。
- `ca63d40` — 记录最初真实 Vault 派发验收。
- `2edac64` — 移除越界的 Vault Frontmatter 迁移工具。

## Suggested skills

- `obsidian-vault`：作者要求检查、扫描或整理 Vault 时使用；没有明确授权不得写入 Frontmatter。
- `diagnosing-bugs`：真实派发、构建或部署失败时使用，以 Actions 日志构建反馈环。
- `tdd`：端到端验收暴露 Site 行为缺陷、且用户授权修复时使用；先确认测试 seam。
- `implement`：仅在用户明确要求修复 Issue 06/07 的实现问题时使用。
