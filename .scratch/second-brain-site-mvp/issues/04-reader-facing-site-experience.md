# 04 — Reader-Facing Site Experience

**What to build:** Deliver the complete reader-facing Home, Notes Index and Published Note experience on top of the verified publication model. The site gives a clear personal introduction and supports calm, accessible long-form reading without presenting unsupported navigation features.

**Blocked by:** 03 — Safe Linked Published Note Rendering

**Status:** resolved

- [x] Home presents the agreed provisional introduction and a clear “浏览笔记” entry to Notes Index, without embedding a note list or inventing author identity details.
- [x] Notes Index presents all Published Note in Published Note Order with title, date and read-only Canonical Tag metadata.
- [x] Published Note presents metadata, rendered Markdown and the Table of Contents; Canonical Tag is visible but neither filters nor links anywhere.
- [x] Contextual Navigation is the only navigation: Home enters Notes Index and Published Note returns to Notes Index; no persistent global navigation is rendered.
- [x] The visual language is bright, restrained and editorial with a small amount of engineering character; configuration and visual assets remain replaceable.
- [x] Desktop and mobile reading layouts meet keyboard navigation, visible focus and readable contrast requirements in their supported light and dark appearances.
- [x] There is no search UI, Tag Browsing, tag-specific route or Tag-filter URL.

## Comments

- 2026-08-06：产品负责人已在正式站点完成 MVP 读者体验走查并确认通过：首页、笔记索引、笔记页、上下文导航、元数据、目录、Markdown 渲染、桌面/移动端可读性与浅深色对比度均符合本 Issue；未发现全局导航、搜索或标签浏览/筛选。后续页面视觉调整作为新的工作，不影响本次 MVP 验收。
