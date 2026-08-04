# Second Brain Site MVP

Status: ready-for-agent

## Problem Statement

作者需要把个人 Obsidian Vault 中明确允许公开的内容稳定地呈现为一个可阅读的静态网站，同时确保每次 Published Site 都能追溯到触发构建的 Vault Revision。现有 Vault 同时包含私密内容，因此网站不能把 Vault 当作可直接公开的镜像，也不能在构建时隐式采用“最新”内容。读者还需要一个简洁的个人入口、按日期浏览 Published Note 的列表，以及适合阅读长篇 Markdown 笔记的页面。

## Solution

构建一个 Astro 静态网站及其 Vault Revision 输入流程。网站只呈现 Publish Set，使用确定性的 Note URL、Attachment URL 和链接转换规则。Home 提供暂定的个人介绍和进入 Notes Index 的入口；Notes Index 按 Published Note Order 展示全部 Published Note；每篇 Published Note 呈现规范化元数据、MVP Markdown 和由二级、三级标题生成的 Table of Contents。站点采用明亮、克制的编辑式视觉语言，带少量工程感，并保留轻量、可替换的作者与视觉配置。

## User Stories

1. 作为作者，我希望只将 Frontmatter 为 `published: true` 的笔记纳入 Publish Set，从而明确决定公开边界。
2. 作为作者，我希望每次 Published Site 都从指定 Vault Revision 构建，从而能够追溯网站内容来源。
3. 作为作者，我希望 Site Repository 不会因默认分支推进而意外采用不同的 Vault 内容，从而避免“最新内容”替代已派发版本。
4. 作为作者，我希望发布流程能扫描当前 Vault Revision，而不是依赖固定文件清单，从而允许 Publish Set 随 Vault 演进。
5. 作为作者，我希望 `published: true` 的笔记在缺少合法日期时阻止构建，从而避免出现无法排序或不可信的公开内容。
6. 作为作者，我希望标题缺失时显示文件名，从而让可发布笔记仍拥有可识别的展示名称。
7. 作为作者，我希望不合规的 `slug` 被报告为构建错误，从而避免生成不稳定的 Note URL。
8. 作为作者，我希望两个 Published Note 获得同一 Note URL 时构建失败并指出冲突，从而避免静默覆盖。
9. 作为作者，我希望改名或移动笔记后不维护旧地址的重定向，从而保持 URL 行为简单且可预期。
10. 作为作者，我希望 Published Attachment 的网站地址镜像其相对 Vault 根目录的路径，从而保持内容链接可推导。
11. 作为作者，我希望无法解析、读取或复制的附件阻止构建，从而不发布带有破损公开资源的页面。
12. 作为作者，我希望附件越出 Vault 根目录或经符号链接指向 Vault 外时构建失败，从而不意外公开本机文件。
13. 作为作者，我希望保留外部 HTTP(S) 链接但不在构建时联网验证，从而避免让第三方可用性成为发布依赖。
14. 作为作者，我希望相对 Markdown 笔记链接转换为目标 Note URL，并保留锚点，从而让 Published Note 之间保持可用的上下文关系。
15. 作为作者，我希望指向未发布笔记的 Unpublished Link 仍使用目标 Note URL，从而保留原始引用意图并让目标如约返回 404。
16. 作为作者，我希望 Unresolved Content Link 不会阻止构建，但会产生定位到来源与目标的诊断，从而能逐步修复内容问题。
17. 作为作者，我希望 Unresolved Content Link 在页面上保留原有文字但不可点击，从而不把读者带到无意义的地址。
18. 作为读者，我希望访问 Home 时先看到作者的个人介绍和明确的“浏览笔记”入口，从而理解这个站点并进入阅读。
19. 作为读者，我希望 Home 不混入笔记列表，从而让个人介绍和笔记浏览各自保持聚焦。
20. 作为读者，我希望在 `/notes/` 一次浏览全部 Published Note，并按日期从新到旧排序，从而快速找到最近发布的内容。
21. 作为读者，我希望同日笔记按 `zh-CN` 标题顺序稳定排列，从而在日期相同时获得一致的浏览顺序。
22. 作为读者，我希望在 Notes Index 的每个条目中看到标题、日期和 Canonical Tag，从而判断是否进入阅读。
23. 作为读者，我希望在 Published Note 页面看到标题、日期和 Canonical Tag，从而保留笔记的上下文。
24. 作为读者，我希望 Canonical Tag 在 MVP 中仅作为元数据展示，从而不会误以为标签可以筛选或跳转。
25. 作为读者，我希望 Published Note 正确呈现 MVP Markdown，从而阅读标题、段落、表格、代码、图片、PDF 与标准链接。
26. 作为读者，我希望每篇 Published Note 有由二级、三级标题构成的 Table of Contents，从而快速跳转到长文的相关段落。
27. 作为读者，我希望 TOC 和正文链接使用同一组 Heading Anchor，从而不会遇到两套不一致的锚点。
28. 作为读者，我希望从 Home 进入 Notes Index，并能从 Published Note 返回 Notes Index，从而不需要常驻全局导航也能完成阅读路径。
29. 作为读者，我希望在手机与桌面上都能舒适阅读，从而不因设备变化丢失正文、目录或导航能力。
30. 作为作者，我希望在未提供姓名、头像、履历和外部账号前，网站使用可替换的临时介绍文案，从而先获得完整页面而不虚构个人资料。
31. 作为作者，我希望稍后可替换个人资料、视觉资产和部署参数，从而不需要重构内容发布边界。
32. 作为维护者，我希望构建失败与非阻断诊断分别清楚表达，从而能区分必须修复的发布风险与可逐步修复的内容问题。

## Implementation Decisions

- 使用 Astro 构建静态 Published Site。它接收一个已检出的 Vault Revision 作为内容输入，不从运行中的 Vault 或默认分支读取内容。
- Vault 通过携带 `vault_sha` 的仓库派发触发 Site Repository 构建。站点工作流必须检出该提交。这是 ADR-0001 已接受的跨仓库边界。
- 发布输入首先形成 Publish Set：仅 Frontmatter 显式为 `published: true` 的 Markdown 笔记，以及这些笔记正常呈现所引用的 Published Attachment。
- 发布模型必须集中处理 Frontmatter 校验、Note URL 推导、Canonical Tag 规范化、Published Note Order、附件解析和 Content Link 转换。页面层消费这个已验证模型，不重复解释 Vault 规则。
- Note URL 优先采用 Frontmatter 的单层小写字母、数字和连字符 `slug`；无 `slug` 时按 Vault 文件路径推导。Published Note 的 URL 冲突和非法 `slug` 是构建错误；Retired Note URL 不提供别名或重定向。
- Published Attachment 只能解析为 Vault-local Attachment。它的 Attachment URL 保留相对 Vault 根目录的路径。无法读取、复制、解析或安全验证的附件必须阻断构建。
- 支持 MVP Markdown：标题、段落、列表、强调、引用、分隔线、表格、行内代码、带语言标识的代码块、标准 Markdown 链接、锚点、图片、PDF 与外部链接。不支持 Obsidian Wiki 链接、Wiki 嵌入、Callout 或 Mermaid。
- 相对 `.md` Content Link 转换为目标 Note URL 并保留 Heading Anchor；相对资源链接转换为 Attachment URL；External Link 原样保留且不联网验证。Unpublished Link 指向目标 Note URL，目标页面不生成并返回 404。
- 构建继续处理 Unresolved Content Link，但输出包含来源笔记和目标信息的诊断。渲染时保留链接文本而不生成可点击链接。
- Notes Index 在构建期获取全部 Published Note，按 `date` 降序、同日按 `title` 的 `zh-CN` 升序排序。它不包含搜索、Tag Browsing、标签筛选 UI 或标签专页。
- Canonical Tag 使用既定的大小写、空白与全半角规范化规则；同一 Published Note 中的等价标签合并。它显示在 Notes Index 条目与 Published Note 页面，但在 MVP 不作为链接或控件。
- Home 是独立于 Notes Index 的个人介绍页。初始使用已确认的可替换文案和“浏览笔记”入口；不得虚构作者姓名、头像、履历或外部账号。
- MVP 采用 Contextual Navigation：Home 链接至 Notes Index，Published Note 链接回 Notes Index，不设置持久全局导航。
- Published Note 页面从 Markdown 标题生成 Table of Contents，只收录二级、三级标题，并链接至 Astro 生成的 Heading Anchor。
- 视觉实现使用明亮、克制的编辑式排版与少量工程感，优先长文可读性和响应式布局。个人资料与视觉资产应可替换。首次视觉稿可随用户反馈调整。
- 部署域名、服务器、镜像仓库、密钥归属和作者的正式资料均不在本规格中决定；相关配置只能在部署工作实际需要时补充。
- 在 Vault 项目的 GitHub Action 已准备好后，重新扫描 Vault，并为当时应公开的运营笔记批量添加 `published: true`。该外部写入不得提前发生。

## Testing Decisions

- 主测试使用已确认的单一高层 seam：对一个 fixture Vault Revision 执行 Published Site Build，并断言生成的 Published Site 或可定位的构建诊断。测试关注读者和作者可观察到的发布行为，不绑定解析器、集合或页面组件的内部实现。
- 成功 fixture 覆盖：Publish Set 选择、Vault Revision 追溯、Home、Notes Index、Published Note 页面、Published Note Order、Canonical Tag 展示、Contextual Navigation、MVP Markdown、Table of Contents 与 Heading Anchor。
- 链接 fixture 覆盖：相对笔记链接、同页锚点、图片和 PDF 附件、External Link、Unpublished Link，以及重复标题的 Heading Anchor。
- 失败 fixture 覆盖：非法或缺失的必填 Published Note Metadata、非法 `slug`、Note URL Conflict、Unresolved Attachment、越出 Vault 的附件路径和指向 Vault 外的符号链接。断言构建失败且诊断能定位问题。
- 非阻断 fixture 覆盖：Unresolved Content Link。断言构建完成、诊断包含来源与目标、最终页面保留文字且不输出可点击链接。
- 低层单元测试只在高层失败无法清晰归因时添加，优先围绕集中发布模型的公开输入输出边界。当前仓库没有可复用的测试先例，因此这些 fixture 是本功能的测试基线。
- 构建与页面验收还应检查桌面和移动阅读布局、键盘可达性、可见焦点、可读对比度，以及浅深色模式下的层次与内容可读性。

## Out of Scope

- Tag Browsing、标签筛选、标签专页和可分享的标签 URL。
- Search Index、全文搜索、运行时搜索服务或私密内容索引。
- Obsidian Wiki 链接、Wiki 嵌入、Callout、Mermaid 及任何未列入 MVP Markdown 的语法。
- Retired Note URL 的重定向、别名或历史 URL 管理。
- 外部链接的构建期联网检查。
- 作者姓名、头像、真实履历、外部账号和正式首页文案。
- 域名、服务器、容器注册表、密钥、生产部署供应商和具体基础设施配置。
- 在 GitHub Action 工作完成前修改外部 Vault 的 Frontmatter。

## Further Notes

- 当前已检查的 Vault 位于 `<USER_HOME>/Documents/second-brain/运维`，当时包含 12 篇 Markdown 笔记及本地附件。它们使用标准 Markdown 相对链接、同页锚点、标准图片链接与外部 HTTP(S) 链接；未使用 Obsidian Wiki 链接或嵌入。
- 已检查笔记具有 `title`、`date` 与 YAML 列表 `tags`，但当时没有 `published: true`。实现派发与迁移前必须重新扫描，因为 Vault 可能已变化。
- 当前仓库尚无 Astro 应用源代码。规格拆票后，应先完成能接收和验证 Vault Revision 的发布边界，再构建页面与视觉层，最后对接派发和部署。
