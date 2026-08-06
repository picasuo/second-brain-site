# 06 — Stable Identity Release Acceptance

**What to build:** Prove a complete release from Vault Release Preflight through Site Repository receipt, Pages deployment and reader-facing URLs using matching Publication Contract versions.

**Blocked by:** 03, 04, 05

**Status:** ready-for-human

- [ ] The Vault preflight and Site receipt report the same contract version and Vault SHA.
- [x] A matching release deploys the intended Published Notes and their Published Attachments.
- [ ] The migrated Oracle multi-node URL returns 200, while eligible unpublished Note URLs return 404.
- [x] A deliberate contract-version mismatch fails before deployment.
- [x] A missing/invalid slug blocks the preflight and Site build; an Unresolved Content Link remains non-blocking and non-clickable.
- [ ] The acceptance evidence records tag, Vault SHA, contract version, artifact name, deployment URL and tested page URLs.

## Comments

- 2026-08-06 — 已验证 release tag `v0.0.6` 指向 Vault SHA `0326562a52dfab8b0672d07ef9e7a57d0e9afb1d`，Publication Contract 版本为 `0.1.0`。三个 Published Note URL（`cloudflare-tunnel-solution`、`oracle-server-setup`、`n-dc38d8d8-5706-421f-bfd4-682b46d1becc`）及 Oracle 开机 SOP 的一项 Published Attachment 均返回 HTTP 200。`pnpm test`（33 tests）与 `pnpm typecheck` 通过；其中涵盖不匹配契约版本的部署前阻断、无效/缺失 slug 阻断，以及非阻断且不可点击的 Unresolved Content Link。
- 仍待运行时证据：公开站点的 `publication-receipt.json` 返回 404，且本机 GitHub CLI 未认证，无法读取 Actions artifact/job summary；当前 Vault 也没有带 slug 的未公开笔记可验证 404。因此第 1、3、6 项保持未勾选。
