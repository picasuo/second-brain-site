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
Published Note 中保留的、指向未进入 Publish Set 的笔记的链接；构建时仍按目标笔记的 Note URL 转换，其目标在 Published Site 上返回 404。
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
Published Note 页面中由二级、三级 Markdown 标题自动生成的页面内导航，并链接至对应 Heading Anchor。
_Avoid_: 手写目录、独立锚点体系

**Unresolved Content Link**:
目标 `.md` 文件或目标 Heading Anchor 不存在的 Content Link；构建继续进行并输出可定位该链接来源与目标的诊断提示，最终页面保留其文字但不提供可点击链接。
_Avoid_: 静默失效链接、构建错误、无上下文的 404

**Note URL**:
从 Vault 笔记推导出的、位于 `/notes/` 下的站点地址；优先由其 Frontmatter 的单层小写字母、数字和连字符组成的 `slug` 决定，未设置时才由 Vault 文件路径推导；不合规的 `slug` 是构建错误。笔记公开时该地址有页面，未公开时该地址返回 404。
_Avoid_: 仅文件路径、临时链接

**Notes Index**:
`/notes/` 页面，主要按 Published Note Order 展示所有 Published Note。
_Avoid_: Home、标签页

**Home**:
`/` 页面，以作者的个人介绍为主体，并提供进入 Notes Index 的明确入口；它不承担 Published Note 的列表职责。
_Avoid_: Notes Index、笔记列表

**Contextual Navigation**:
MVP 的页面间导航：Home 仅提供进入 Notes Index 的入口；Published Note 页面仅提供返回 Notes Index 的入口；不设置常驻的全局导航。
_Avoid_: 全局导航栏、站点范围菜单

**Search Index**:
仅包含 Published Note 的标题、正文和 Canonical Tag 的构建期搜索索引；MVP 不提供搜索，此概念留待后续支持搜索时采用。
_Avoid_: 私密内容索引、运行时搜索服务

**Note URL Conflict**:
两篇 Published Note 得到同一个 Note URL 的内容错误；构建必须失败并指出冲突的笔记和 URL，而不自动加后缀。
_Avoid_: 自动消歧、静默覆盖

**Retired Note URL**:
因 Published Note 更改 `slug` 或 Vault 文件路径而不再使用的 Note URL；其目标直接返回 404，不维护重定向或别名。
_Avoid_: URL 别名、301 重定向

**Published Note Metadata**:
Published Note 的展示属性：`title` 缺失时回退为文件名；`date` 必填且只接受 `YYYY-MM-DD`，缺失或格式不合法即为构建错误；`tags` 可为空，并以 Canonical Tag 显示在 Notes Index 列表项和 Published Note 正文页。
_Avoid_: 虚构日期、可缺失日期、带时间的日期

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
