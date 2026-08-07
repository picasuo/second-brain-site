# 04 — 验收 v0.2.1 Vault Release

**What to build:** 使用作者确认的 Vault Revision 运行 `0.2.1` Release Preflight、推送专用 Vault Release Tag，并完整验证从 repository dispatch 到 Published Site 部署的可观察发布行为。

**Blocked by:** 02 — Site 使用精确的 Contract v0.2.1; 03 — Vault 升级 Preflight 与 Release Tag.

**Status:** completed

- [x] 已发布的 `@picasuo/publish-set-contract@0.2.1`、Vault Release Preflight、派发 payload 与 Site receipt 均记录同一 `contract_version`。
- [x] Site Actions 验证 payload 后检出与 Vault Release Tag 相同的 Vault Revision，并成功完成 Published Site Build、artifact 上传与部署。
- [x] artifact 收据、job summary、实际检出 SHA 与部署结果相互一致；Published Site 仍只呈现该 Vault Revision 的 Publish Set。
- [x] 验收记录明确列出 Contract Package Release、Vault Release Tag、Vault Revision、Site run 与 Published Site URL，并不暴露 token 或私有 Vault 内容。

## Comments

- 2026-08-07：真实验收完成。Contract Package Release 为 `@picasuo/publish-set-contract@0.2.1`；Vault Release Tag 为 `vault-release-v0.0.1`，指向 Vault Revision `a2bd0985d2871a4ed4be9c1529fec871df6b7eb9`。Vault 的只读 Release Preflight 通过，实际使用的 Contract 版本为 `0.2.1`，未写入笔记。
- Site Actions [publish-vault-revision #15](https://github.com/picasuo/second-brain-site/actions/runs/31143018223) 成功：receipt、实际检出 SHA 与 job summary 均记录该 Vault Revision 和 `0.2.1`；artifact 为 `published-site-a2bd0985d2871a4ed4be9c1529fec871df6b7eb9`。Pages 部署成功，Published Site 为 [picasuo.qzz.io](http://picasuo.qzz.io/)，首页与 Notes Index 可访问。
- 首次派发的 #14 在 receipt 校验前失败，因为远程 Site 尚未包含 `0.2.1` 迁移；推送已验证的 Site `main` 后，重新运行同一 Vault tag 的派发得到 #15。没有创建第二个 tag，也未输出凭据或私有 Vault 内容。
