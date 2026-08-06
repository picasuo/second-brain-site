# 04 — Vault Release Preflight and Explicit Slug Repair

**What to build:** In the private Vault, add a release command that installs an exact published Publication Contract version, validates the candidate release, and can explicitly apply only missing-slug proposals before the author commits and tags.

**Blocked by:** 01, 02

**Status:** resolved

- [x] The default release preflight is read-only and presents source-located blocking errors and non-blocking diagnostics.
- [x] The Vault pins an exact npm package version and exposes it as `contract_version` when dispatching a release.
- [x] An explicit write option only writes missing stable slugs, displays the resulting diff, and requires validation to pass again before tag creation.
- [x] Dates, invalid/duplicate slugs, attachments, links and `published` values are never auto-corrected.
- [x] Vault credentials and private content do not enter the public package or Site Repository.

## Comments

- 2026-08-06 — 工程实现已完成：Vault 固定 `@picasuo/publish-set-contract@0.1.0`，默认 Release Preflight 只读，`--write-missing-slugs` 只写入契约提出的缺失 slug、展示 diff 并二次校验；tag 派发包含 `contract_version`。5 个自动化测试、Bash 语法、工作流 YAML 与精确包版本校验均已通过。真实 Vault 的只读预检按预期阻断 `运维/Oracle 多机集群零公网架构方案.md` 缺失 slug，且未改写笔记。作者审阅并迁移该 slug 属于 05 号工单，端到端发版验收属于 06 号工单。
