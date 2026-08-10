export type TableOfContentsItem = { depth: 2 | 3; id: string; text: string };

export type PublishedNote = { title: string; date: string; filename: string; tags: string[]; noteUrl: string; renderedContent: string; tableOfContents: TableOfContentsItem[] };

export const publishedNotes: PublishedNote[] = [
  {
    title: "从零搭建个人知识库",
    date: "2026-08-09",
    filename: "build-a-second-brain.md",
    tags: ["productivity", "obsidian"],
    noteUrl: "/notes/build-a-second-brain/",
    renderedContent: `
      <p>这是一篇用于测试详情页排版、目录和长内容滚动的模拟笔记。</p>
      <h2 id="why-a-second-brain">为什么需要第二大脑</h2>
      <p>把短期记忆交给可靠的系统，才能把注意力留给思考与创造。</p>
      <h3 id="capture-first">先捕获，再整理</h3>
      <p>任何灵感都先进入收集箱，避免因为分类成本而放弃记录。</p>
      <h2 id="a-small-workflow">一个足够小的工作流</h2>
      <p>每天花几分钟回顾，给真正值得保留的内容补上上下文。</p>
      <blockquote><p>好的系统应该减少摩擦，而不是制造新的待办事项。</p></blockquote>
      <h3 id="review-weekly">每周回顾</h3>
      <p>确认哪些主题正在积累，并删除不再有价值的临时信息。</p>
    `,
    tableOfContents: [
      { depth: 2, id: "why-a-second-brain", text: "为什么需要第二大脑" },
      { depth: 3, id: "capture-first", text: "先捕获，再整理" },
      { depth: 2, id: "a-small-workflow", text: "一个足够小的工作流" },
      { depth: 3, id: "review-weekly", text: "每周回顾" },
    ],
  },
  {
    title: "React 状态管理的取舍",
    date: "2026-08-07",
    filename: "react-state-tradeoffs.md",
    tags: ["engineering", "react"],
    noteUrl: "/notes/react-state-tradeoffs/",
    renderedContent: "<p>用一份简短的清单判断状态应该放在哪里。</p><h2 id=\"state-boundaries\">状态边界</h2><p>优先让状态靠近它的使用者。</p>",
    tableOfContents: [{ depth: 2, id: "state-boundaries", text: "状态边界" }],
  },
  {
    title: "设计一次更安静的晨间例行",
    date: "2026-08-05",
    filename: "quiet-morning-routine.md",
    tags: ["life", "productivity"],
    noteUrl: "/notes/quiet-morning-routine/",
    renderedContent: "<p>为一天预留一段没有通知、没有输入的时间。</p>",
    tableOfContents: [],
  },
  {
    title: "发布检查清单",
    date: "2026-08-03",
    filename: "release-checklist.md",
    tags: ["engineering", "release notes"],
    noteUrl: "/notes/release-checklist/",
    renderedContent: "<p>检查构建、链接、元数据和回滚路径。</p><h2 id=\"before-shipping\">发布前</h2><ul><li>运行测试</li><li>检查变更摘要</li></ul>",
    tableOfContents: [{ depth: 2, id: "before-shipping", text: "发布前" }],
  },
  {
    title: "无标签的临时想法",
    date: "2026-08-01",
    filename: "untagged-thought.md",
    tags: [],
    noteUrl: "/notes/untagged-thought/",
    renderedContent: "<p>这篇笔记用于验证没有标签时的列表与详情页显示。</p>",
    tableOfContents: [],
  },
];
