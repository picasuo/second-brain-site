# 02 — Stable Note URL Contract

**What to build:** Move Note URL and Markdown link validation into the Publication Contract, making a valid stable `slug` mandatory for every Published Note and eliminating the Vault-path fallback.

**Blocked by:** 01

**Status:** resolved

- [x] A Published Note without a slug fails with a source-located diagnostic.
- [x] Existing valid slugs resolve to stable `/notes/<slug>/` URLs and duplicate URLs fail.
- [x] No Published Note URL is derived from a Vault path.
- [x] An unpublished target with a slug remains an Unpublished Link and resolves to its 404 Note URL.
- [x] A target note without a slug yields a non-blocking Unresolved Content Link without exposing its Vault path.
- [x] Regression fixtures cover Chinese and space-containing source paths, proving they cannot affect a slug URL or Astro route output.

## Comments

- 2026-08-06 — 已由 `63bce36` 实现；Publication Contract 与 Site 构建回归测试覆盖 slug、冲突、未公开链接、缺失 slug 链接及中文/空格路径。
