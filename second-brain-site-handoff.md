# Handoff: Astro `transition:persist` 改造接力

## 目标

把当前站点里的终端壳子从“每次路由切换都重绑一次”改成“壳子尽量保活，内容继续随路由刷新”的结构，优先评估是否适合引入 `transition:persist`。

## 现状

- 仓库：`/Users/picasuo/codehub/second-brain-site`
- 相关文件：
  - `src/layouts/BaseLayout.astro`
  - `src/layouts/TerminalShell.astro`
- 目前页面使用：
  - `ClientRouter`
  - `transition:name`
  - `transition:animate="none"`
  - `astro:page-load` 里重新初始化终端窗口交互
- 当前 `TerminalShell.astro` 里，模块级变量 `presentation` 会跨客户端路由保留；`initializeTerminalWindow()` 会在每次 `astro:page-load` 时重新查询 DOM、重绑事件，并通过 `cleanupActiveWindow` 清理旧监听器。

## 已达成的设计判断

- `transition:persist` 不是当前方案的直接替代品。
- 如果直接把整个 `TerminalShell` 挂 `persist`，`slot` 里的页面内容也会一起被保住，路由内容就不会正常换掉。
- 更合适的方向是把“终端壳子”和“路由内容”拆开。

## 推荐实施方案

1. 拆分结构
   - 提出一个固定壳层，例如 `TerminalFrame`
   - 提出一个动态内容层，例如 `TerminalBody`
   - `TerminalFrame` 负责背景、窗口外框、标题栏、窗口控件、窗口状态
   - `TerminalBody` 负责当前路由的正文和 footer

2. 调整层级关系
   - 不要让 `TerminalBody` 继续嵌在一个会被 `persist` 的父节点里
   - 改成兄弟层，或者通过共同父容器提供内容区定位
   - 让“包裹感”来自布局，而不是 DOM 嵌套

3. 只对真正稳定的壳层使用 `transition:persist`
   - 保留终端壳子和窗口状态
   - 路由内容仍然正常重渲染

4. 简化脚本
   - 保留壳层后，尽量减少 `astro:page-load` 里的重初始化逻辑
   - 目标是让交互脚本只在壳层首次挂载时初始化一次

## 设计要点

- `TerminalBody` 不负责“包裹感”，它只负责填充内容区。
- 内容区尺寸、内边距、圆角、遮罩等，应该由 `TerminalFrame` 或共同父容器定义。
- 可以用 CSS 变量传递内容区 inset，例如内容区四周留白、标题栏高度、窗口边距。
- `persist` 应该只落在“不会因为路由变化而改变语义”的那层。

## 需要继续确认

- 是只保留窗口壳子，还是连某些状态动画也一起保留。
- 是否希望 `TerminalShell` 继续是单文件实现，还是拆成两个 Astro 组件更清晰。
- 路由内容区是否还需要和窗口动画联动。

## 参考文档

- Astro View Transitions: https://docs.astro.build/en/guides/view-transitions/
- Astro transitions API: https://v5.docs.astro.build/en/reference/modules/astro-transitions/

## Suggested skills

- `codebase-design`：继续做壳层/内容层的 seam 设计
- `diagnosing-bugs`：如果改完后出现路由切换或窗口状态异常
- `tdd`：如果下一步要先写行为测试再改结构

