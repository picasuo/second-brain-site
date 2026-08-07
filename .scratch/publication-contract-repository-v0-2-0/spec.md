# 独立 Publication Contract Repository 与 v0.2.1 发布验收

Status: completed

## Problem Statement

`@picasuo/publish-set-contract` 是 Vault 的 Release Preflight 与 Site Repository 的共同 Publication Contract，却仍作为 Site Repository 的 pnpm workspace 包存在。它的 Git tag、发布权限和源码生命周期因而与 Site 应用耦合；Site 又通过 `workspace:*` 使用本地源码，不能证明其运行的是 Vault 已固定的 npm 产物。作者无法以一个清晰、可审计的版本完成 Contract Package Release，并确认同一版本在 Vault 和 Published Site 中一致生效。

## Solution

将 `@picasuo/publish-set-contract` 提取到独立的公开 Contract Repository，由该仓库拥有包源码、版本、`v0.2.1` tag、GitHub Actions 发布和 npm 供应链证明。Site Repository 与私有 Vault 都精确安装 `0.2.1`，不再引用 workspace 源码。作者在 Vault 对新的 Vault Revision 完成 `0.2.1` Release Preflight 后，推送版本化 `vX.Y.Z` Vault Release Tag；该 tag 派发包含同一 `contract_version` 的不可变 Vault Revision，Site 只在其已安装的 `0.2.1` 与 payload 一致时构建并部署 Published Site。该完整链路是本次唯一的主验收 seam。

## User Stories

1. 作为作者，我希望 Publication Contract 有独立的公开 Contract Repository，从而使其所有权、版本和发布历史不再混入 Site Repository。
2. 作为作者，我希望 Contract Repository 的 `v0.2.1` tag 只表示 `@picasuo/publish-set-contract@0.2.1`，从而能从 Git ref 直接追溯 npm 包源码。
3. 作为作者，我希望 GitHub Actions 在 Contract Repository 中验证并发布 `v0.2.1`，从而不必依赖本机 npm 凭据或人工复制构建产物。
4. 作为作者，我希望每一个 Contract Package Release 都在发布前运行包自身的 build、typecheck 与 test，从而不把未经验证的 Publication Contract 提供给 Vault 或 Site。
5. 作为作者，我希望 Contract Package Release 使用 npm 的可信发布机制与最小权限，从而避免长期 npm token 出现在仓库、日志或 Vault 中。
6. 作为作者，我希望 Site Repository 精确安装 `@picasuo/publish-set-contract@0.2.1`，从而构建不再悄然使用本地 workspace 源码。
7. 作为作者，我希望 Site 的锁文件记录 Contract Package Release 的已解析版本和完整性信息，从而能够重现发布时使用的依赖。
8. 作为作者，我希望 Vault 的 Release Preflight 精确安装并执行 `0.2.1`，从而在创建 Vault Release Tag 前得到与 Site 相同的 Publication Contract 规则。
9. 作为作者，我希望 Vault 从冻结安装的 Contract Package 导出精确版本作为 `contract_version`，从而派发的值反映 Release Preflight 实际使用的规则，而不依赖默认值、范围或当前最新版本。
10. 作为作者，我希望 Site 仅接受 `contract_version: 0.2.1` 的 Vault 派发，从而避免使用不同规则验证过的 Vault Revision 被公开部署。
11. 作为作者，我希望 Site 在构建收据、artifact 和 job summary 中记录 Vault Revision 与 `0.2.1`，从而能审计一次 Published Site 的内容来源与规则版本。
12. 作为作者，我希望 Vault 只有版本化 `vX.Y.Z` Release Tag 才触发公开部署，从而普通提交和非发布 tag 不会意外派发 Publish Set。
13. 作为作者，我希望 Vault Release Tag 指向不可变 Vault Revision，而不是默认分支随后移动的 HEAD，从而保持 Published Site 可重现。
14. 作为作者，我希望在 Contract、Site 与 Vault 升级期间出现的版本不匹配明确失败，从而不产生混用规则的 Published Site。
15. 作为作者，我希望 `v0.2.1` 发布失败时保留 `v0.1.0` 的可用历史，从而能以明确版本回退，而不是重写或重新发布同一版本号。
16. 作为 Vault 作者，我希望 Release Preflight 的 Blocking Error 在创建 tag 前停止发布，从而不把无效 Publish Set 交给 Site。
17. 作为 Site 维护者，我希望 repository dispatch payload 缺少、格式错误或版本不匹配时在检出 Vault 前失败，从而不扩大私有 Vault 读取与构建范围。
18. 作为读者，我希望本次真实验收生成的 Published Site 仍只呈现 Publish Set，从而 Contract Repository 的迁移不会改变公开边界。
19. 作为维护者，我希望 Publication Contract 的行为测试随独立仓库迁移，从而未来改动继续由包的公开 Interface 保护，而不是由 Site 的实现细节偶然覆盖。
20. 作为维护者，我希望 Site 保留围绕 Vault Revision receipt 的高层测试，从而依赖升级不会削弱跨仓库派发的可观察行为。
21. 作为维护者，我希望迁移完成后 Site Repository 成为单一站点应用仓库，从而不必为一个外部发布包维护伪 monorepo 结构。
22. 作为维护者，我希望文档区分 Contract Package Release 与 Vault Release Tag，从而后续操作不会把包版本、站点部署和内容快照混为一谈。
23. 作为维护者，我希望真实验收只使用由作者确认的 Vault Release Tag 和 Vault Revision，从而不修改或暴露未确认的 Vault 内容。
24. 作为维护者，我希望所有 token、registry 设置和私有 Vault 读取凭据只保留在对应 GitHub Actions 的最小权限配置中，从而迁移过程不泄露密钥。

## Implementation Decisions

- `@picasuo/publish-set-contract` 是独立的 Contract Repository，不再是 Site Repository 的 workspace 包。新仓库只拥有该包的源码、测试、发布文档和发布工作流。
- Contract Repository 在 `v0.2.1` tag 上执行发布。该工作流必须拒绝 tag、包元数据版本和导出 Contract 版本不一致的候选发布；成功后发布唯一的 npm `0.2.1` 产物，不覆盖既有版本。
- Contract Package Release 在公开 registry 中使用可信发布与最小 GitHub Actions 权限；发布工作流不读取 Vault，不包含 Site 部署凭据，也不派发 Published Site。
- Site Repository 移除 pnpm workspace 与本地 Contract 源码，改为安装精确的 registry 版本 `0.2.1`。Site 的 Production Build、测试和 receipt 校验均使用该已锁定依赖。
- 私有 Vault 的 Release Preflight 改为使用精确的 `0.2.1` 包版本。它继续保持无写入校验的默认行为，只有作者显式请求时才允许既有的 Stable Note Slug 修复流程写入 Vault。
- Site receipt 校验继续以 `vault_sha` 与 `contract_version` 为公开跨仓库 Interface；`contract_version` 必须等于 Site 已锁定的 `0.2.1`，任何不一致均为 Blocking Error。
- Vault 派发工作流只匹配 Vault 的 `v*` 发布 tag；同名版本在独立 Contract Repository 中属于不同 Git ref 命名空间。Vault tag 只表达 Vault Revision 内容快照。
- `0.2.1` 的升级采用受控发布窗口：先发布 Contract Package Release，再更新 Site 与 Vault 的精确依赖和配置，期间不创建新的 Vault Release Tag；三处一致后再创建验收 tag。禁止以版本范围或“latest”消除协调步骤。
- 回滚使用已存在的精确 Contract Package Release，并同步恢复 Site 与 Vault 的匹配配置；不得移动、删除或重发 `v0.2.1`。
- ADR-0003 中“公共 Site Repository 发布包”的归属决定将更新为独立 Contract Repository；ADR-0004 将从提议更新为接受，并记录此选择及其版本协调代价。

## Testing Decisions

- 主测试为已确认的唯一高层 seam：Vault 对一个作者确认的 Vault Revision 使用 `0.2.1` 完成 Release Preflight，版本化 Vault Release Tag 派发该 revision 与版本，Site 验证 receipt、检出该 revision、使用 `0.2.1` 构建、上传带 Vault SHA 的 artifact，并成功部署 Published Site。
- 主测试仅断言外部可观察行为：npm 中存在不可变 `0.2.1`、Vault Release Preflight 成功、Site Actions receipt/实际检出 SHA/artifact 收据均记录 `0.2.1` 和同一 Vault Revision，以及部署后的 Published Site 可访问。不得断言包的内部目录或实现函数调用顺序。
- Contract Repository 保留并执行 Publication Contract 的单元测试，覆盖其公开 Interface 的 blocking errors、非阻断 diagnostics、Publish Set、Stable Note Slug、Published Attachment 与 Content Link 行为。迁移前后相同输入必须保持相同的公开结果，除非另有版本化行为变更。
- Site Repository 保留既有 Vault Revision receipt 与 Published Site Build 测试，并更新为验证已安装的精确 registry 版本；这些测试快速定位依赖或 receipt 回归，但不取代主 seam。
- 增加版本不匹配的负向验收：Vault 声明非 `0.2.1`、缺失版本或无效 SHA 时，Site 必须在检出 Vault 之前失败且不部署。
- 使用已有的 fixture 驱动契约测试与 Vault revision receipt 测试作为先例；测试关注 Contract 与工作流的 Interface，而不是 workspace 拆除的文件操作。

## Out of Scope

- 改变 Publication Contract 对 Publish Set、Published Note、Published Attachment、Content Link、Stable Note Slug 或诊断的业务规则。
- 将 Site 单应用仓库人为重组到 `apps/` 目录；拆除伪 monorepo 后 Site 可以继续位于仓库根目录。
- 发布 `0.2.1` 之外的 Contract 功能、预发布通道、多包 monorepo 或自动批量升级工具。
- 自动向 Vault 写入 Frontmatter、Stable Note Slug 或 `published` 状态。
- 改变 GitHub Pages 域名、部署提供商、Published Site 页面设计或 Publish Set 内容。
- 为 Vault、Site 或 npm 以外的使用者提供新的运行时服务、HTTP API 或远程校验服务。

## Further Notes

- Contract 的外部 Interface 是 Vault Revision 的 Publication Contract 校验结果，以及 Vault 到 Site 的 `{ vault_sha, contract_version }` receipt；这两个 Interface 在迁移期间必须保持可追溯和版本明确。
- GitHub CLI 当前未登录；在执行远程仓库创建、GitHub Actions 设置或真实 run 查询前，需要有效的 GitHub 身份验证。该前置条件不影响本 spec 的实施范围。
- 作者提供的本地 Contract 工作目录目前尚未初始化为 Git Repository，且没有包元数据；实施从该工作目录引导独立 Contract Repository，不假设其中已有可迁移历史。
- Contract Package Release、Vault Release Tag 与 Published Site 部署是三个不同的事件，必须各自保留独立的 Git ref、权限和审计记录。

## Completion

- Contract Package Release：`@picasuo/publish-set-contract@0.2.1`，由独立 Contract Repository 的 `v0.2.1` 发布。
- Vault 验收：`vault-release-v0.0.1` 指向 `a2bd0985d2871a4ed4be9c1529fec871df6b7eb9`；后续 Vault 发布规则已恢复为版本化 `vX.Y.Z`。
- Site 验收：[publish-vault-revision #15](https://github.com/picasuo/second-brain-site/actions/runs/31143018223) 成功，artifact、receipt 与 job summary 均记录相同 Vault Revision 和 Contract `0.2.1`；[Published Site](http://picasuo.qzz.io/) 已部署并可访问。
