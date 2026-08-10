# 01 — 交付桌面 Notes Index Filter Prompt

**What to build:**
将 Notes Index 的列表命令、Tag Token 和标题查询交付为单行交互式 Notes Index Filter Prompt：`$ ls -la ./notes --sort=date | grep -i`。访问者在宽屏上可立即看到并输入终端式筛选提示符，而不再面对独立的传统输入框；既有 Notes Index Filter、Tag Suggestion List、无匹配、Published Note 行导航与固定 footer 均保持工作。

**Blocked by:** None — can start immediately.

**Status:** resolved

- [x] 宽屏将列表命令、`| grep -i`、Tag Token、标题查询和块状输入光标组合成一条可访问的 Notes Index Filter Prompt；页面进入时在非空 Publish Set 自动聚焦，且不呈现传统输入框边框、底色或圆角。
- [x] Filter Prompt 使用独立模块承载交互；Terminal Command Display 保持静态接口与既有 `notes --info` 展示，不增加交互模式或 slot。
- [x] `$ ls -la ./notes --sort=date | grep -i` 仅表达浏览器本地 Notes Index Filter 上下文，不执行 Shell、提交命令、改变 URL 或发起服务端查询。
- [x] Tag Token、标题不区分大小写查询、`#` Tag Suggestion List、键盘与指针选择、去重、Backspace 删除、无匹配恢复、整行 Note URL 和固定 footer 导航均保持已确认行为。
- [x] 生成 Published Site 构建验收与宽屏浏览器验收覆盖可访问提示符结构、管道命令、筛选行为、光标反馈与导航结果。

## Comments

- 2026-08-11：由 `36ac23e` 交付。该 Prompt 壳层是后续 Caret Editor 的既有基线。
