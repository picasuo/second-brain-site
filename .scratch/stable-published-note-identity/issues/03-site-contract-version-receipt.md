# 03 — Site Contract-Version Receipt and Build

**What to build:** Make the Site Repository consume the Publication Contract for its build and accept a declared `contract_version` alongside `vault_sha` in the repository dispatch receipt.

**Blocked by:** 01, 02

**Status:** ready-for-human

- [x] The Site build uses the Publication Contract rather than a duplicate rule implementation.
- [x] A dispatch requires a complete Vault SHA and a declared contract version.
- [x] A dispatch whose contract version differs from the Site workspace package version fails before deployment.
- [x] The job summary and artifact evidence record Vault SHA and contract version.
- [x] Tests prove a matching receipt succeeds and a mismatched receipt cannot deploy.

## Comments

- 2026-08-06 — 已由 `9f7c1bd` 实现。`test/vault-revision-receipt.test.ts` 覆盖匹配回执、版本不匹配的部署前阻断，以及 artifact receipt 写入。
