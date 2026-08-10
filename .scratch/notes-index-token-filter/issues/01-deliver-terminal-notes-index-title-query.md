# 01 — 交付终端化 Notes Index 与标题查询

**What to build:**
将 Notes Index 重组为终端式信息与列表输出：以 `$ notes --info` 和纵向 `total`、`latest` 代替页面标题，以 `$ ls -la ./notes --sort=date` 引出列表，并用一个 `$ grep -i` 输入区完成不区分大小写的 Published Note 标题筛选。访问者可在宽窄屏查看带 `#` 前缀的 Canonical Tag、无匹配和空 Publish Set 状态，并随时通过整行 Note URL 与固定 footer 导航。

**Blocked by:** None — can start immediately.

**Status:** resolved

- [x] 非空 Publish Set 显示两段静态 Terminal Command Display、`total`/`latest` 纵向输出、DATE/NAME/TAGS 列和带 `#` 的 Canonical Tag；不显示 Notes 标题、`topics`、阅读时长或 READ。
- [x] `$ grep -i` 的单一输入区按标题进行不区分大小写的浏览器本地筛选，保留无匹配、空 Publish Set、整行导航、固定 footer 及宽窄屏阅读结果。
- [x] 构建验收和生成站点浏览器验收覆盖终端结构、标题查询、标签显示、响应式、空状态和导航。

## Comments

- 2026-08-11：由 `bce00a3` 交付；终端化 Notes Index、标题查询和构建验收已进入当前基线。
