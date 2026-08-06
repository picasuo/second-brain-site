# 06 — Stable Identity Release Acceptance

**What to build:** Prove a complete release from Vault Release Preflight through Site Repository receipt, Pages deployment and reader-facing URLs using matching Publication Contract versions.

**Blocked by:** 03, 04, 05

**Status:** resolved

- [x] The Vault preflight and Site receipt report the same contract version and Vault SHA.
- [x] A matching release deploys the intended Published Notes and their Published Attachments.
- [x] The migrated Oracle multi-node URL returns 200, while eligible unpublished Note URLs return 404.
- [x] A deliberate contract-version mismatch fails before deployment.
- [x] A missing/invalid slug blocks the preflight and Site build; an Unresolved Content Link remains non-blocking and non-clickable.
- [x] The acceptance evidence records tag, Vault SHA, contract version, artifact name, deployment URL and tested page URLs.

## Comments

- 2026-08-06 — 已验证 release tag `v0.0.6` 指向 Vault SHA `0326562a52dfab8b0672d07ef9e7a57d0e9afb1d`，Publication Contract 版本为 `0.1.0`。三个 Published Note URL（`cloudflare-tunnel-solution`、`oracle-server-setup`、`n-dc38d8d8-5706-421f-bfd4-682b46d1becc`）及 Oracle 开机 SOP 的一项 Published Attachment 均返回 HTTP 200。`pnpm test`（33 tests）与 `pnpm typecheck` 通过；其中涵盖不匹配契约版本的部署前阻断、无效/缺失 slug 阻断，以及非阻断且不可点击的 Unresolved Content Link。
- 2026-08-06 — `v0.0.7` 运行证据：Vault tag 指向 SHA `3c2b1154b4628ca4f2357a2afffdb66b1f2062a5`，Dispatch 传入的 Publication Contract 版本为 `0.1.0`；Site 构建检出相同 SHA，上传 artifact `published-site-3c2b1154b4628ca4f2357a2afffdb66b1f2062a5`（ID `8958549384`），并成功部署至 `http://picasuo.qzz.io/`。构建产物包含三个 Published Note 路由及 Oracle 开机 SOP 附件。
- 2026-08-06 — 读者侧复查：`cloudflare-tunnel-solution`、`oracle-server-setup`、迁移后的 `n-dc38d8d8-5706-421f-bfd4-682b46d1becc` 和一项 Oracle SOP 附件均返回 HTTP 200；带合法 slug 但未设置 `published: true` 的 `personal-server-security-hardening-solution` 返回 HTTP 404。
- 尚未完成端到端回执验收：本次 Site job 使用的提交是 `c88aa7f`，早于加入 Site 回执校验/写入步骤的 `9f7c1bd`，日志中也没有该步骤。因此 `publication-receipt.json` 返回 404 属于本次旧工作流的预期结果。待将当前 Site `main` 推送到远端并针对同一 Vault SHA 重新 Dispatch（或发布新的 Vault tag）后，核对已生成的回执并勾选第 1、6 项。
- 2026-08-06 — 重新 Dispatch 的 [GitHub Actions run #31079225872](https://github.com/picasuo/second-brain-site/actions/runs/31079225872) 已成功完成；它运行在 Site SHA `095bcd507bdea2e0259c73f1a4de39f36ada61c8`，`Validate Vault Revision receipt`、`Record Publication Contract receipt in artifact` 和 Pages 部署步骤均通过。已部署的 `publication-receipt.json` 返回 Vault SHA `3c2b1154b4628ca4f2357a2afffdb66b1f2062a5` 与 Contract `0.1.0`，和 Vault `v0.0.7` Dispatch 一致；第 1、6 项完成。
