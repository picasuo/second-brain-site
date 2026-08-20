# Second Brain Site

将个人 Obsidian 知识库中的可发布内容呈现为公开静态网站的发布边界。它的重点是让每一次公开发布都能追溯到明确的知识库版本。

## Language

**Vault**:
作为网站内容来源的 Obsidian Markdown 知识库。
_Avoid_: 内容仓库、笔记文件夹

**Vault Revision**:
触发一次网站构建的 Vault 的不可变 Git 提交。
_Avoid_: 最新内容、当前版本

**Publish Set**:
一个 Vault Revision 中 Frontmatter 明确设为 `published: true` 的笔记，以及由这些笔记引用、为正常呈现而公开的附件的集合。
_Avoid_: 全部 Vault、默认公开内容

**Published Note**:
Publish Set 中可由 Published Site 呈现的一篇笔记。
_Avoid_: Vault 笔记、私密笔记

**Published Attachment**:
由 Published Note 引用并随其公开，以便正常显示的图片、PDF 或其他附件；即使它也被私密笔记引用，仍保持公开。
_Avoid_: 私密附件、笔记属性

**Unresolved Attachment**:
Published Note 引用但无法在 Vault Revision 中解析、读取或复制的附件；它是构建错误，必须阻止发布。
_Avoid_: 破损资源、可忽略警告

**Vault-local Attachment**:
最终解析路径位于 Vault 根目录内的 Published Attachment；路径越出 Vault 或符号链接指向 Vault 外时，构建失败。
_Avoid_: 外部本机文件、越界资源

**Attachment URL**:
Published Attachment 在 Published Site 上的地址；它镜像附件相对 Vault 根目录的路径。
_Avoid_: 扁平资源目录、重命名附件 URL

**External Link**:
Published Note 中指向 Vault 外 HTTP(S) 地址的标准 Markdown 链接；原样保留，不在构建时联网校验，也不因其失效阻止发布。
_Avoid_: 已验证的外部链接、构建依赖

**Unpublished Link**:
Published Note 中保留的、指向未进入 Publish Set 且具有 Stable Note Slug 的笔记的链接；构建时仍按目标笔记的 Note URL 转换，其目标在 Published Site 上返回 404。
_Avoid_: 已移除链接、私密笔记页面

**Content Link**:
Published Note 中的标准 Markdown 链接，包括相对路径的笔记链接、同页锚点和资源链接；构建时相对 `.md` 链接转换为目标笔记的 Note URL，并保留锚点；MVP 不支持 Obsidian Wiki 链接或嵌入语法。
_Avoid_: Wiki 链接、Wiki 嵌入

**MVP Markdown**:
Published Note 支持的 Markdown 范围：标题、段落、列表、强调、引用、分隔线、表格、行内代码、带语言标识的代码块、标准 Markdown 链接、锚点、图片、PDF 和外部链接；不支持 Obsidian Wiki 链接、Wiki 嵌入、Callout 或 Mermaid。
_Avoid_: Obsidian 扩展语法、未声明的渲染特性

**Heading Anchor**:
Content Link 中指向 Markdown 标题的片段；使用 Astro 自动生成的标题 ID，重复标题由该规则自动加后缀区分。
_Avoid_: 自定义锚点体系、手写重复标题 ID

**Table of Contents**:
Published Note 页面中由二级、三级 Markdown 标题自动生成的页面内导航，并链接至对应 Heading Anchor；窄屏默认收起，展开时完整显示。
_Avoid_: 手写目录、独立锚点体系

**Unresolved Content Link**:
目标 `.md` 文件或目标 Heading Anchor 不存在的 Content Link；构建继续进行并输出可定位该链接来源与目标的诊断提示，最终页面保留其文字但不提供可点击链接。
_Avoid_: 静默失效链接、构建错误、无上下文的 404

**Note URL**:
由 Stable Note Slug 推导出的、位于 `/notes/` 下的站点地址。不再由 Vault 文件路径推导；Published Note 缺少合法 Stable Note Slug 是构建错误。未公开但具有 Stable Note Slug 的笔记保留该地址，并在 Published Site 上返回 404。
_Avoid_: 文件路径 URL、临时链接

**Stable Note Slug**:
Vault Note Frontmatter 中持久保存的合法 `slug`。每篇 Published Note 必须有一个，且作者不应因改名或移动笔记而改变它。Vault 的显式修复流程可仅为缺失值生成一次 `n-<lowercase-uuid>`；它不会改写既有值。
_Avoid_: 每次构建生成的 ID、由文件路径派生的 ID

**Publication Contract**:
定义 Publish Set、Published Note Metadata、Note URL、附件与 Content Link 行为的无写入校验规则及其版本。Vault Release Preflight 与 Site Repository 对同一个 Vault Revision 必须使用相同版本。
_Avoid_: 两套独立的发布校验、仅供作者参考的检查

**Release Preflight**:
在 Vault 创建 release tag 前运行的 Publication Contract 校验。默认只报告诊断；仅在作者显式请求时，Vault 侧可为缺失的 Stable Note Slug 写入建议值，随后必须重新校验、审阅并提交。
_Avoid_: 静默改写、Site Repository 对 Vault 的写入

**Contract Package Release**:
从已验证的 Contract Repository 提交发布到 npm 的、不可变的 `@picasuo/publish-set-contract` 精确版本；Vault 与 Site Repository 均以该精确版本作为 Publication Contract。
_Avoid_: Site 发布、Vault Release Tag、浮动依赖版本

**Vault Release Tag**:
标记一个 Vault Revision 并触发 Published Site 构建的 Vault Git tag；它表达内容快照，不表达 Contract Package Release。
_Avoid_: Contract Package Release、Site Repository 根版本

**Notes Index**:
`/notes/` 页面，主要按 Published Note Order 展示所有 Published Note。
_Avoid_: Home、标签页

**Home**:
`/` 页面，以作者的个人介绍为主体，并提供进入 Notes Index 的明确入口；它不承担 Published Note 的列表职责。
_Avoid_: Notes Index、笔记列表

**Contextual Navigation**:
MVP 的页面间导航：Home 提供进入 Notes Index 的入口；Notes Index 与 Published Note 的窗口固定 footer 分别提供返回 Home 和 Notes Index 的入口；不设置常驻的全局导航。
_Avoid_: 全局导航栏、站点范围菜单

**Terminal Window Shell**:
包裹 Home、Notes Index 与 Published Note 的共享拟态 macOS 窗口框架；路由切换时框架保持视觉连续，仅替换其中的页面内容。
_Avoid_: 页面级窗口容器、常驻全局导航

**Terminal Window Form**:
Terminal Window Shell 对访客呈现的三种可交互形态：Windowed、Fullscreen 与 Floating Miniature；初次进入时，宽视口默认为 Windowed，窄视口默认为 Fullscreen。访客主动改变形态后，该选择在当前页面会话的路由跳转和视口变化中保持；收起为 App Icon 是保留原形态的暂存状态，不是第四种窗口形态。
_Avoid_: 原生浏览器全屏、关闭应用、第四种窗口模式

**Terminal Command Display**:
终端拟态中用于展示上下文或命令的静态文本；它不承担导航、筛选或其他点击交互。
_Avoid_: 链接、按钮、可点击命令

**Notes Index Filter Prompt**:
Notes Index 中将已排序的 Published Note 列表与浏览器本地筛选衔接的交互式终端提示符；它以 `$ ls -la ./notes --sort=date | grep -i` 表示筛选上下文，并承载 Tag Token、标题查询、建议和输入反馈。静态管道命令与可编辑区域是完整的两个换行单元：空间不足时，可编辑区域从提示符左缘续行，不拆散或重排静态命令；过长的 Placeholder 或标题查询也会移至完整 Prompt 行并从左缘自动续行。查询区域不呈现传统输入框外观，页面进入时获得焦点并展示醒目的块状闪烁光标；减少动态效果时光标保持静态。
_Avoid_: Terminal Command Display、可提交的 Shell、服务端查询

**Notes Index Filter**:
`/notes/` 中仅在浏览器内运行的 Published Note 筛选器：零个或多个 Canonical Tag 与不区分大小写的标题搜索可同时使用；每篇结果必须命中全部 Tag Token 并匹配标题查询。它不查询正文或私密内容，也不进入 URL，页面重新进入时恢复默认状态。
_Avoid_: 全文搜索、服务端搜索、标签页

**Tag Token**:
Notes Index Filter 输入区域中表示一个已选 Canonical Tag 的可编辑令牌；它与查询文本处于同一编辑顺序，光标位于令牌后按 Backspace 会移除该令牌。
_Avoid_: 独立筛选按钮、不可编辑标签

**Tag Suggestion List**:
当 Notes Index Filter 查询以 `#` 开头时出现的 Canonical Tag 候选列表；可通过鼠标或方向键、Enter 选择，并用 Esc 关闭，已选标签不可重复选择。
_Avoid_: 全文搜索结果、固定标签栏

**Search Index**:
未来可用于站点全文搜索的构建期索引，可包含 Published Note 的标题、正文和 Canonical Tag；它不同于 Notes Index Filter。
_Avoid_: 私密内容索引、运行时搜索服务

**Note URL Conflict**:
两篇 Published Note 得到同一个 Note URL 的内容错误；构建必须失败并指出冲突的笔记和 URL，而不自动加后缀。
_Avoid_: 自动消歧、静默覆盖

**Retired Note URL**:
因 Published Note 更改 `slug` 而不再使用的 Note URL；其目标直接返回 404，不维护重定向或别名。
_Avoid_: URL 别名、301 重定向

**Published Note Metadata**:
Published Note 的展示属性：`title` 缺失时回退为移除 `.md` 后缀的 Published Note Filename；`date` 必填且只接受 `YYYY-MM-DD`，缺失或格式不合法即为构建错误；`tags` 可为空，并以 Canonical Tag 显示在 Notes Index 列表项和 Published Note 正文页。
_Avoid_: 虚构日期、可缺失日期、带时间的日期

**Published Note Filename**:
Published Note 的 Vault 源文件最终文件名（含 `.md`），仅可作为终端拟态的显示标签；它不决定 Note URL，也不包含 Vault 目录。
_Avoid_: Stable Note Slug、Vault 路径、页面标题

**Canonical Tag**:
由 Published Note 的 YAML `tags` 列表产生的标签标识；比较时忽略大小写、去除首尾空格并统一全角与半角，等价写法归入同一标签；同一篇笔记中的等价标签自动合并。其展示名称使用小写英文、去首尾空格和半角字符，中文保持原样。
_Avoid_: 原始标签拼写、大小写敏感标签

**Published Note Order**:
Published Note 在 Notes Index 中的排序；先按 `date` 降序，日期相同时按 `title` 的 `zh-CN` 升序比较。
_Avoid_: 文件顺序、标题顺序

**Site Repository**:
将一个指定的 Vault Revision 构建并交付为网站的独立仓库。
_Avoid_: Vault、内容仓库

**Published Site**:
由某个 Vault Revision 生成、可公开访问的静态网站。
_Avoid_: Vault 镜像、在线笔记库
