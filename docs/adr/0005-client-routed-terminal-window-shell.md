---
Status: accepted
---

# 使用客户端路由维持 Terminal Window Shell

Home、Notes Index 与 Published Note 统一由 Root `BaseLayout` 拥有 Terminal Window Shell，并使用 Astro `ClientRouter` 在站内跳转时替换页面内容。窗口背景、边框和标题栏不参与路由动画，只有 Terminal Body 淡入淡出；代价是页面脚本必须监听 `astro:page-load` 来重新绑定新内容的交互。这避免每页各自创建窗口而重复播放入场动画，保留终端界面的沉浸感。

## Considered Options

- **每页独立渲染 Terminal Window Shell：** 拒绝；完整页面导航会重新创建并播放窗口入场动画。
- **持久化整个 Shell DOM：** 拒绝；Astro 的 `transition:persist` 会同时保留旧内容，无法只替换页面主体。
