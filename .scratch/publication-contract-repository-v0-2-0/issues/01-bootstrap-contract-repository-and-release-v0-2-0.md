# 01 — 初始化 Contract Repository 并发布 v0.2.1

**What to build:** 将已有的远程与本地 Contract Repository 工作目录引导为独立的 `@picasuo/publish-set-contract` 项目，迁移 Publication Contract 的公开 Interface、行为测试与发布说明；通过受最小权限保护的 GitHub Actions 将可追溯的 `v0.2.1` 发布为 npm 的唯一不可变 Contract Package Release。

**Blocked by:** None — can start immediately.

**Status:** completed

- [x] Contract Repository 独立拥有 Package 的源码、测试、版本和发布工作流，且不包含 Vault 内容、凭据或 Published Site 部署职责。
- [x] `v0.2.1` tag、包元数据版本与导出的 Publication Contract 版本一致；包的 build、typecheck 与测试在发布前全部通过。
- [x] npm 上存在可安装、不可覆盖的 `@picasuo/publish-set-contract@0.2.1`，其发布记录可追溯到对应 Git tag 与提交。
- [x] 发布工作流采用可信发布和最小权限，不打印或保存长期 registry 凭据。

## Comments

- 2026-08-07：原始 `v0.2.0` 发布在 npm publish 步骤失败，未发布 npm 产物，且标签保持不变。遵循不可变原则后，修正的 Contract Package Release 改为 `v0.2.1`：Git tag `v0.2.1` 指向 `8cb4913`，GitHub Actions 成功完成 OIDC 可信发布，npm registry 已验证 `@picasuo/publish-set-contract@0.2.1`。
