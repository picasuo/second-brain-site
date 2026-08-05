# 07 — End-to-End Published Site Acceptance

**What to build:** Prove the complete public-release path using a real Vault Revision: the reader-facing Published Site is built from the dispatched revision and exhibits all confirmed MVP publication, navigation and reading behaviour.

**Blocked by:** 04 — Reader-Facing Site Experience; 06 — Vault Action and Publication Migration

**Status:** ready-for-agent

- [x] A real dispatched Vault Revision can be traced from the Vault action through Site Repository build output to the resulting Published Site.
- [ ] The resulting Home, Notes Index and Published Note pages satisfy the confirmed Contextual Navigation, metadata, ordering, Markdown and Table of Contents behaviour.
- [ ] The acceptance run verifies that unpublished notes remain unavailable and that Published Attachment exposure follows the Publish Set rules.
- [ ] Blocking publication errors and non-blocking Unresolved Content Link diagnostics remain distinguishable in the end-to-end run.
- [x] The final verification records any deployment-specific values still needed without inventing domain, server, registry or secret details.

## Comments

- 2026-08-05：真实发布验收已推进至 Vault tag `v0.0.4`。Site Repository 的 [publish-vault-revision #7](https://github.com/picasuo/second-brain-site/actions/runs/30974705130) 成功从 Vault Revision `1e6b9366665d8524d99a79c109a48303b582f5f7` 构建并部署 artifact `published-site-1e6b9366665d8524d99a79c109a48303b582f5f7` 至 `https://picasuo.qzz.io/`。Home、Notes Index 与 `/notes/cloudflare-tunnel-solution/` 可访问；Published Note 显示日期、Canonical Tag、Table of Contents、Markdown 表格与代码块，并可返回 Notes Index。
- 2026-08-05：上述 Published Note 中指向未公开 `Oracle 多机集群零公网架构方案` 的 Content Link 保留其目标 Note URL；直接访问该 URL 返回 GitHub Pages 404，符合 Unpublished Link 行为。该 Published Note 当前没有 Published Attachment，且这次真实构建没有 Unresolved Content Link 诊断；附件公开边界与非阻断诊断仍待独立验收。
