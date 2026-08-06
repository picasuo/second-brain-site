# 07 — End-to-End Published Site Acceptance

**What to build:** Prove the complete public-release path using a real Vault Revision: the reader-facing Published Site is built from the dispatched revision and exhibits all confirmed MVP publication, navigation and reading behaviour.

**Blocked by:** 04 — Reader-Facing Site Experience; 06 — Vault Action and Publication Migration

**Status:** resolved

- [x] A real dispatched Vault Revision can be traced from the Vault action through Site Repository build output to the resulting Published Site.
- [x] The resulting Home, Notes Index and Published Note pages satisfy the confirmed Contextual Navigation, metadata, ordering, Markdown and Table of Contents behaviour.
- [x] The acceptance run verifies that unpublished notes remain unavailable and that Published Attachment exposure follows the Publish Set rules.
- [x] Blocking publication errors and non-blocking Unresolved Content Link diagnostics remain distinguishable in the end-to-end run.
- [x] The final verification records any deployment-specific values still needed without inventing domain, server, registry or secret details.

## Comments

- 2026-08-05：真实发布验收已推进至 Vault tag `v0.0.4`。Site Repository 的 [publish-vault-revision #7](https://github.com/picasuo/second-brain-site/actions/runs/30974705130) 成功从 Vault Revision `1e6b9366665d8524d99a79c109a48303b582f5f7` 构建并部署 artifact `published-site-1e6b9366665d8524d99a79c109a48303b582f5f7` 至 `https://picasuo.qzz.io/`。Home、Notes Index 与 `/notes/cloudflare-tunnel-solution/` 可访问；Published Note 显示日期、Canonical Tag、Table of Contents、Markdown 表格与代码块，并可返回 Notes Index。
- 2026-08-05：上述 Published Note 中指向未公开 `Oracle 多机集群零公网架构方案` 的 Content Link 保留其目标 Note URL；直接访问该 URL 返回 GitHub Pages 404，符合 Unpublished Link 行为。该 Published Note 当前没有 Published Attachment，且这次真实构建没有 Unresolved Content Link 诊断；附件公开边界与非阻断诊断仍待独立验收。
- 2026-08-06：本 Issue 的最终端到端验收因 [Stable Published Note Identity and Release Preflight](../../stable-published-note-identity/spec.md) 暂缓，而非关闭。Vault tag `v0.0.5` 的实际构建已暴露路径 URL 回退缺陷：无 `slug` 的 `Oracle 多机集群零公网架构方案` 虽进入 artifact，却在公开站点返回 404。现有 run 仍证明 Vault Revision 派发与基础部署，但不足以验收稳定 Note URL 或契约版本对齐。待 [06 — Stable Identity Release Acceptance](../../stable-published-note-identity/issues/06-stable-identity-release-acceptance.md) 完成新的 tag、`vault_sha`、`contract_version`、附件与诊断边界验收后，再恢复本 Issue 的收尾。
- 2026-08-06：最终验收完成。产品负责人已确认正式站点 MVP 的 Home、Notes Index 和 Published Note 体验符合 [04 — Reader-Facing Site Experience](04-reader-facing-site-experience.md)，包括上下文导航、排序、元数据、Markdown、目录、无搜索/标签浏览及桌面和移动阅读体验。发布链路采用 Vault `v0.0.7`（SHA `3c2b1154b4628ca4f2357a2afffdb66b1f2062a5`、Contract `0.1.0`），Site receipt 与已部署的 `publication-receipt.json` 均匹配；artifact 为 `published-site-3c2b1154b4628ca4f2357a2afffdb66b1f2062a5`。三个 Published Note 与一项 Published Attachment 返回 200，合法 slug 的未发布笔记返回 404。契约版本不匹配及缺失/无效 slug 的阻断、以及非阻断且不可点击的 Unresolved Content Link，均由同一发布契约测试覆盖；完整证据见 [06 — Stable Identity Release Acceptance](../../stable-published-note-identity/issues/06-stable-identity-release-acceptance.md)。
