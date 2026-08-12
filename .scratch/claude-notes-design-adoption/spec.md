# Claude Notes Design Adoption

Status: ready-for-agent

## Problem Statement

Claude 提供的 `/notes` 与 Published Note 详情页在暗色 token、mono 字体尺度、Notes Index 行 hover、筛选建议样式、Table of Contents、正文段落和章节 rail 上更适合当前终端阅读体验。当前站点需要吸收这些视觉优点，但不能改变发布领域模型、Note URL、Markdown 原文或已确认的背景机制。

## Scope

- 采用 Claude 版的低亮度暗色层级、文本颜色、边框层级和绿色 accent。
- 统一 Terminal Shell、Notes Index、Published Note 的 mono 字体尺度、颜色和字重；保留 CJK fallback。
- 保留当前 `.terminal-shell` 背景的 `background-image` 与 `mask-image` 机制，只微调其中的颜色与透明度。
- 采用 Claude 版 Notes Index listing 视觉：`DATE / NAME / TAGS` 三列、轻绿色 hover 背景、标题变亮、左侧细竖线 indicator。
- `NAME` 列采用 Claude 版权限前缀：`-rw-r--r--` 作为视觉装饰，不进入筛选数据或可访问名称。
- 记录筛选 suggestion 的视觉目标，但本轮不把 Notes Index Filter Prompt 整体改成 Claude 的输入框结构。
- 采用 Claude 版大屏 TOC：`$ tree --toc`，左侧固定，一级 `├─/└─ + 01`，二级缩进弱化，大屏有当前章节 active state。
- 小屏 TOC 与正文上下排布，不显示 active state。
- Published Note 正文按 `h2` 自动生成 `01/02/03` section rail；大屏和小屏都保留 rail。
- Published Note metadata 采用 Claude 版 key-value 行：`date` 与 `tags` 作为小号 mono metadata，不再作为普通横向 chip strip。

## Implementation Decisions

- Section rail 是展示层增强，不写入 Markdown 原文。
- `h2` 是正文一级章节；每个 `h2` 到下一个 `h2` 之间形成一个 `.doc-section`。
- `h3` 是 section 内子标题，不生成正文 rail 编号；TOC 中仍作为缩进项显示。
- 没有 `h2` 的短笔记不生成 section rail。
- Section rail 不改变 heading anchor；TOC 链接继续指向原有 Markdown heading id。
- 有 section rail 的正文中，首个 `h2` 之前的导语内容也应缩进到正文内容列，避免 rail 之外的文本与 section 内容左侧不对齐。
- `blockquote` 内部的最后一个段落不保留普通段落的 bottom margin，保证引用文本在引用容器内视觉居中。
- 大屏 TOC active state 表示“当前阅读位置对应的一级章节”，不是 hover/click state。
- 大屏 active state 只在 `min-width: 1200px` 生效；小屏不启用 scroll-spy，不呈现 active state。
- 不新增 reading time、read column、正文搜索或 URL filter state。
- Notes Index 表格不落地 Claude 版 `READ` 列；其 64px 列宽与 16px gap 合并到 `TAGS` 列，最终桌面列宽为 `96px minmax(0, 1fr) 270px`。
- Notes Index 表格整体继承 mono 字体，header、row、permission、title、tags 的字号、padding、border、radius、hover 与 Claude 版 listing 对齐。
- 小屏 Notes Index 表格按 Claude 版折叠为 `date / title / tags` 三行布局，隐藏权限前缀。
- 本地预览应通过 `pnpm prepare-dev -- --vault <vault-revision-path>` 从 Vault Markdown 生成 `src/generated/published-notes.ts`，避免手写 generated module 与真实构建结果偏离。
- 不创建 ADR；本次是可逆的视觉采用，不改变发布架构。

## Out of Scope

- 将 Notes Index Filter Prompt 整体改成 Claude 版 `cmdline-box`，该工作后续单独开启。
- 修改 Home 的信息结构、链接、交互和 approved 背景机制。
- 修改 Stable Note Slug、Note URL、Content Link、Heading Anchor 或 Publication Contract 行为。
- 长期维护手写 HTML mock Published Note 作为主要开发数据。
