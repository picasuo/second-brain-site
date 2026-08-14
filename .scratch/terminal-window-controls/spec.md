# Terminal Window Controls

Status: completed

## Problem Statement

Terminal Window Shell 已具备 macOS 风格的三色控件外观，但控件尚未承载窗口拟态行为。访客应能以接近桌面应用的方式在三种窗口形态之间切换、暂存为 app icon，并在窗口化时拖动标题栏。

## Interaction Model

- **Terminal Window Form** 只有三种：`windowed`（默认）、`fullscreen`、`floating-miniature`。
- 红灯将窗口暂存为页面左上角的 **App Icon**。App Icon 不是窗口形态；它保存收起前的 `windowed` 或 `fullscreen` 形态，点击后恢复该形态。
- 黄灯仅在 `windowed` 时可用。点击后，真实的 Terminal Window Shell 缩放并移动到左下角，进入 `floating-miniature`；点击小窗任意位置恢复原 `windowed` 形态。
- `fullscreen` 时黄灯必须显式禁用，不能通过指针或键盘触发。
- 绿灯在 `windowed` 和 `fullscreen` 之间切换。标题栏的非控件区域双击触发相同切换。
- 标题栏只在 `windowed` 时可拖拽；拖动后恢复、最小化及从全屏返回时都保留该位置。全屏与小窗状态不允许拖动。
- 小窗、app icon 的收起与恢复使用 Claude demo 相同的平滑缩放动画；窗口化与全屏化直接切换布局，避免在动画中记录中间几何尺寸。`prefers-reduced-motion: reduce` 下不播放位移动画。

## Scope

- 将三色圆点改为具有正确语义、键盘可达性和禁用状态的按钮。
- 在 Terminal Shell 外层提供左上角 App Icon 与左下角小窗落点；不引用 Claude demo 的外部 Ghostty 图标资源，改用随站点构建的本地图标资源。
- 用 Pointer Events 支持鼠标、触控板和触屏拖动，并限制标题栏至少保持在可见视口内。
- 与 Astro ClientRouter 兼容：在站内路由切换后，当前窗口形态和已拖拽位置继续生效，且不重复注册事件。
- 保持终端正文作为唯一滚动区域；不改变发布内容、路由、筛选器或页脚导航。

## Reference Demo Adoption

- 采用 demo 的“冻结当前几何尺寸，再以 `transform` 缩放到目标位置”的思路，避免布局跳变。
- 采用 demo 的黄灯禁用与绿灯图标反转提示，但使用语义化按钮、无外部图片和 Pointer Events 替代其纯 `i` 标签 / Mouse Events 实现。
- demo 将红灯命名为 close；本站将其定义为暂存（iconify），因为点击 app icon 必须恢复之前窗口形态，且页面内容不会卸载。

## Acceptance Criteria

- 默认显示窗口化 Terminal Window Shell。
- 红灯收起为左上角 app icon；点击 icon 恢复收起前形态。
- 黄灯只在窗口化可操作；进入左下角小窗后点击小窗恢复窗口化。
- 绿灯与标题栏双击都能切换窗口化 / 沉浸全屏；全屏时黄灯不可用。
- 窗口化标题栏可拖动，窗口不会完全拖离视口；控件、标题和可交互正文不误触发拖动。
- 小窗、app icon 的转换在普通动效偏好下平滑，在减少动态效果偏好下即时完成；全屏切换保持 Claude demo 的直接布局切换。
- Home、Notes Index、Published Note 的路由切换不破坏窗口控件或当前窗口形态。

## Out of Scope

- 浏览器原生 Fullscreen API、系统窗口管理、跨页面刷新/重新打开浏览器后的状态持久化。
- 可调整窗口大小、多个窗口、拖放吸附或右上角的窗口控制菜单。

## Implementation Notes

- 三色控件使用语义化 `button`，红灯、黄灯与绿灯分别对应暂存、小窗与全屏操作；绿灯会依据当前窗口形态切换提示图标。
- 小窗和 App Icon 动画冻结当前窗口几何尺寸后以 `transform` 缩放到目标落点，沿用 Claude demo 的 `cubic-bezier(.32,.72,0,1)` 与 460/420/380ms 时长。
- 标题栏拖拽仅在指针移动超过 3px 后才写入窗口位置，普通点击与双击不会将临时或默认几何尺寸固化为拖拽尺寸。
- 窗口动画完成只接受 Terminal Window 自身的 `transform` 结束事件，控件 hover 动画不会提前结束窗口动画；动画进行时拒绝新的窗口形态操作。
- `.window-controls` 在标题栏 Grid 中使用内容宽度与左侧对齐，避免默认拉伸占满左侧网格列并误拦截标题栏双击。
- App Icon 使用 `src/assets/terminal-app-icon.png`，由 Astro 作为本地静态资源输出。

## Verification

- `pnpm typecheck` 通过。
- `pnpm test` 通过，29 个测试全部成功。
- 浏览器连续执行 20 组全屏↔窗口化双击后，窗口始终恢复默认尺寸；标题栏计算光标为 `auto`，收起后显示本地 App Icon。
