import { chmod, mkdir, mkdtemp, readFile, rm, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, expect, test } from "vitest";

import { buildPublishedSite } from "../src/published-site-build.js";

const temporaryDirectories: string[] = [];

afterEach(async () => {
  await Promise.all(temporaryDirectories.splice(0).map((directory) => rm(directory, { recursive: true, force: true })));
});

test("Notes Index Filter Prompt 在窄屏以 16px 输入文字避免 iOS 聚焦缩放", async () => {
  const prompt = await readFile(new URL("../src/components/NotesIndexFilterPrompt.astro", import.meta.url), "utf8");

  expect(prompt).toMatch(/@media \(max-width: 560px\)[\s\S]*?\.cmdline-mirror,\s*\.cmd-input\s*\{[\s\S]*?font-size:\s*16px;/u);
});

test("Terminal Window Shell 的页面布局直接使用内容容器宽度", async () => {
  const [notesIndex, publishedNote] = await Promise.all([
    readFile(new URL("../src/pages/notes/index.astro", import.meta.url), "utf8"),
    readFile(new URL("../src/pages/notes/[...slug].astro", import.meta.url), "utf8"),
  ]);

  expect(notesIndex).toContain(".notes-index { width: 100%; }");
  expect(notesIndex).not.toContain(".notes-index { max-width:");
  expect(publishedNote).toContain(".terminal-note { width: 100%; }");
  expect(publishedNote).toContain(".note-body { grid-area: content; width: 100%;");
  expect(publishedNote).toContain(".terminal-note .note-header { width: 100%;");
  expect(publishedNote).toContain(".terminal-note .note-layout { display: grid; grid-template-columns: minmax(12.5rem, 16rem) minmax(0, 1fr);");
  expect(publishedNote).not.toContain(".terminal-window.is-fullscreen");
});

test("Terminal Window Shell 仅在首次加载时按 700px 断点选择默认形态", async () => {
  const [baseLayout, terminalShell] = await Promise.all([
    readFile(new URL("../src/layouts/BaseLayout.astro", import.meta.url), "utf8"),
    readFile(new URL("../src/layouts/TerminalShell.astro", import.meta.url), "utf8"),
  ]);

  expect(baseLayout).toContain('window.matchMedia("(max-width: 699px)").matches ? "fullscreen" : "windowed"');
  expect(baseLayout.match(/window\.matchMedia\("\(max-width: 699px\)"\)/gu)).toHaveLength(1);
  expect(baseLayout).toContain('window["__secondBrainTerminalInitialForm"] === undefined');
  expect(terminalShell).toMatch(/const presentation: WindowPresentation = \{\s*form: document\.documentElement\.dataset\.terminalInitialForm === "fullscreen" \? "fullscreen" : "windowed",/u);
  expect(terminalShell).toMatch(/@media \(max-width: 699px\) \{\s*html\[data-terminal-initial-form="fullscreen"\] \.terminal-window \{/u);
  expect(terminalShell).toContain('document.documentElement.removeAttribute("data-terminal-initial-form");');
});

test("Terminal footer navigation cannot expand its window on narrow viewports", async () => {
  const terminalShell = await readFile(new URL("../src/layouts/TerminalShell.astro", import.meta.url), "utf8");

  expect(terminalShell).toMatch(/\.terminal-window \{[\s\S]*?min-width: 0;[\s\S]*?max-width: 100%;/u);
  expect(terminalShell).toContain(".terminal-footer { min-width: 0; max-width: 100%; overflow: hidden;");
  expect(terminalShell).toContain(".terminal-footer-navigation { display: flex; align-items: stretch; width: 100%; max-width: 100%; overflow: hidden;");
});

test("Notes Index 表格在桌面窗口中按均衡轨道分配三列", async () => {
  const notesIndex = await readFile(new URL("../src/pages/notes/index.astro", import.meta.url), "utf8");

  expect(notesIndex).toContain("grid-template-columns: minmax(7rem, .75fr) minmax(0, 1.5fr) minmax(15rem, 1.75fr);");
  expect(notesIndex).toContain("gap: var(--space-5);");
  expect(notesIndex).not.toContain("grid-template-columns: 96px minmax(0, 1fr) 270px;");
});

test("a Vault Revision with one Published Note produces a Notes Index and public note page", async () => {
  const outputDirectory = await mkdtemp(join(tmpdir(), "second-brain-site-"));
  temporaryDirectories.push(outputDirectory);

  await buildPublishedSite({
    vaultRevisionPath: new URL("./fixtures/one-published-note/", import.meta.url),
    outputDirectory,
  });

  const notesIndex = await readFile(join(outputDirectory, "notes", "index.html"), "utf8");
  const notePage = await readFile(join(outputDirectory, "notes", "first-published-note", "index.html"), "utf8");

  expect(notesIndex).toContain('href="/notes/first-published-note/"');
  expect(notesIndex).toContain("First Published Note");
  expect(notePage).toContain("First Published Note");
  expect(notePage).toContain("A fixture Vault Revision is the explicit source for this published page.");
});

test("Home、Notes Index 与 Published Note 共享启用客户端路由的 Terminal Window Shell", async () => {
  const outputDirectory = await mkdtemp(join(tmpdir(), "second-brain-site-"));
  temporaryDirectories.push(outputDirectory);

  await buildPublishedSite({
    vaultRevisionPath: new URL("./fixtures/one-published-note/", import.meta.url),
    outputDirectory,
  });

  const pages = await Promise.all([
    readFile(join(outputDirectory, "index.html"), "utf8"),
    readFile(join(outputDirectory, "notes", "index.html"), "utf8"),
    readFile(join(outputDirectory, "notes", "first-published-note", "index.html"), "utf8"),
  ]);

  for (const page of pages) {
    expect(page).toContain('name="astro-view-transitions-enabled"');
    expect(page).toContain('class="terminal-shell"');
    expect(page).toContain('class="terminal-window');
    expect(page).toContain('class="terminal-body"');
    expect(page).toContain('aria-label="收起为应用图标"');
    expect(page).toContain('aria-label="缩放为悬浮小窗"');
    expect(page).toContain('aria-label="进入全屏"');
  }
});

test("Home presents picasuo's profile and links to supported platforms", async () => {
  const outputDirectory = await mkdtemp(join(tmpdir(), "second-brain-site-"));
  temporaryDirectories.push(outputDirectory);

  await buildPublishedSite({
    vaultRevisionPath: new URL("./fixtures/one-published-note/", import.meta.url),
    outputDirectory,
  });

  const home = await readFile(join(outputDirectory, "index.html"), "utf8");

  expect(home).toContain("picasuo --info");
  expect(home).toContain("杭州");
  expect(home).toContain("2021 — 至今");
  expect(home).toContain('href="https://www.immed.co/"');
  expect(home).toContain("frontend");
  expect(home).toContain('href="/notes/"');
  expect(home).toContain('href="https://github.com/picasuo"');
  expect(home).toContain('href="https://x.com/picasuo"');
  expect(home).not.toContain("First Published Note");
});

test("a Publish Set excludes private notes, orders Published Notes, and exposes Canonical Tag", async () => {
  const outputDirectory = await mkdtemp(join(tmpdir(), "second-brain-site-"));
  temporaryDirectories.push(outputDirectory);

  await buildPublishedSite({
    vaultRevisionPath: new URL("./fixtures/publish-set-metadata/", import.meta.url),
    outputDirectory,
  });

  const notesIndex = await readFile(join(outputDirectory, "notes", "index.html"), "utf8");
  const alphaNote = await readFile(join(outputDirectory, "notes", "alpha-release", "index.html"), "utf8");

  expect(notesIndex).toContain("latest-note");
  expect(notesIndex).toContain('href="/notes/alpha-release/"');
  expect(notesIndex).toContain('href="/notes/latest-note/"');
  expect(notesIndex).toContain("engineering");
  expect(notesIndex).toContain("运维");
  expect(notesIndex).toContain("data-note-tags=");
  expect(notesIndex).not.toContain("Private Note");
  await expect(readFile(join(outputDirectory, "notes", "private", "index.html"), "utf8")).rejects.toThrow("ENOENT");
  expect(notesIndex.indexOf("latest-note")).toBeLessThan(notesIndex.indexOf("Alpha"));
  expect(notesIndex.indexOf("Alpha")).toBeLessThan(notesIndex.indexOf("Zulu"));
  expect(alphaNote).toContain("2026-08-04");
  expect(alphaNote).toContain("engineering");
  expect(alphaNote).toContain("运维");
  expect(alphaNote).toContain('href="/notes/"');
  expect(alphaNote).not.toContain('href="/tags/"');
});

test("a Notes Index renders a local filter prompt, static terminal output, Canonical Tags, and terminal navigation", async () => {
  const outputDirectory = await mkdtemp(join(tmpdir(), "second-brain-site-"));
  temporaryDirectories.push(outputDirectory);

  await buildPublishedSite({
    vaultRevisionPath: new URL("./fixtures/publish-set-metadata/", import.meta.url),
    outputDirectory,
  });

  const notesIndex = await readFile(join(outputDirectory, "notes", "index.html"), "utf8");

  expect(notesIndex).toContain("notes --info");
  expect(notesIndex).toContain("<dt>total</dt>");
  expect(notesIndex).toContain("<dd>3</dd>");
  expect(notesIndex).toContain("<dt>latest</dt>");
  expect(notesIndex).toContain("<dd>2026-08-05</dd>");
  expect(notesIndex).toContain('data-notes-filter-prompt');
  expect(notesIndex).toContain('data-notes-filter-static-command');
  expect(notesIndex).toContain("ls -la ./notes --sort=date");
  expect(notesIndex).toContain("grep -i");
  expect(notesIndex).toContain('data-notes-search');
  expect(notesIndex).toContain('<input');
  expect(notesIndex).toContain('autofocus');
  expect(notesIndex).toContain('role="combobox"');
  expect(notesIndex).toContain('aria-autocomplete="list"');
  expect(notesIndex).toContain('id="cmd-box"');
  expect(notesIndex).toContain('id="cmd-mirror"');
  expect(notesIndex).toContain('role="listbox"');
  expect(notesIndex).toContain('data-tag-suggestions');
  expect(notesIndex).not.toContain("--all");
  expect(notesIndex).not.toContain('<h1 id="notes-title">Notes</h1>');
  expect(notesIndex).toContain('data-note-title="latest-note"');
  expect(notesIndex).toContain("data-note-tags=");
  expect(notesIndex).toContain("#engineering");
  expect(notesIndex).toContain("#运维");
  expect(notesIndex).toContain('href="/notes/latest-note/"');
  expect(notesIndex).toContain('class="terminal-footer-back"');
  expect(notesIndex).toContain('aria-label="返回首页"');
  expect(notesIndex).not.toContain("Back to home");
  expect(notesIndex).not.toContain("READ");
  expect(notesIndex).toContain("-rw-r--r--");
  expect(notesIndex).not.toContain("topics");
});

test("an empty Publish Set renders its confirmed zero-note state without filters", async () => {
  const vaultDirectory = await mkdtemp(join(tmpdir(), "second-brain-site-vault-"));
  const outputDirectory = await mkdtemp(join(tmpdir(), "second-brain-site-"));
  temporaryDirectories.push(vaultDirectory, outputDirectory);

  await buildPublishedSite({ vaultRevisionPath: vaultDirectory, outputDirectory });

  const notesIndex = await readFile(join(outputDirectory, "notes", "index.html"), "utf8");

  expect(notesIndex).toContain("notes --info");
  expect(notesIndex).toContain("<dt>total</dt>");
  expect(notesIndex).toContain("<dd>0</dd>");
  expect(notesIndex).toContain("<dt>latest</dt>");
  expect(notesIndex).toContain("<dd>—</dd>");
  expect(notesIndex).toContain("notes: no published notes");
  expect(notesIndex).not.toContain("ls -la ./notes --sort=date");
  expect(notesIndex).not.toContain("grep -i");
  expect(notesIndex).not.toContain("--all");
  expect(notesIndex).not.toContain("DATE");
  expect(notesIndex).toContain('aria-label="返回首页"');
  expect(notesIndex).not.toContain("Back to home");
});

test("a Published Note without a valid date prevents publication with its source path", async () => {
  const outputDirectory = await mkdtemp(join(tmpdir(), "second-brain-site-"));
  temporaryDirectories.push(outputDirectory);

  await expect(buildPublishedSite({
    vaultRevisionPath: new URL("./fixtures/missing-date/", import.meta.url),
    outputDirectory,
  })).rejects.toThrow("Published Note missing-date.md requires a valid date in YYYY-MM-DD format.");
});

test("a Published Note with an invalid date prevents publication with its source path", async () => {
  const outputDirectory = await mkdtemp(join(tmpdir(), "second-brain-site-"));
  temporaryDirectories.push(outputDirectory);

  await expect(buildPublishedSite({
    vaultRevisionPath: new URL("./fixtures/invalid-date/", import.meta.url),
    outputDirectory,
  })).rejects.toThrow("Published Note invalid-date.md requires a valid date in YYYY-MM-DD format.");
});

test("a Published Note with an invalid slug prevents publication with its source path", async () => {
  const outputDirectory = await mkdtemp(join(tmpdir(), "second-brain-site-"));
  temporaryDirectories.push(outputDirectory);

  await expect(buildPublishedSite({
    vaultRevisionPath: new URL("./fixtures/invalid-slug/", import.meta.url),
    outputDirectory,
  })).rejects.toThrow("Published Note invalid-slug.md has an invalid slug: Invalid_Slug.");
});

test("a Published Note without a Stable Note Slug prevents a Chinese or space-containing source path from becoming an Astro route", async () => {
  const vaultDirectory = await mkdtemp(join(tmpdir(), "second-brain-site-vault-"));
  const outputDirectory = await mkdtemp(join(tmpdir(), "second-brain-site-"));
  temporaryDirectories.push(vaultDirectory, outputDirectory);
  await mkdir(join(vaultDirectory, "中文 笔记"));
  await writeFile(join(vaultDirectory, "中文 笔记", "没有 Slug.md"), "---\npublished: true\ntitle: Missing Slug\ndate: 2026-08-04\ntags: []\n---\n");

  await expect(buildPublishedSite({ vaultRevisionPath: vaultDirectory, outputDirectory }))
    .rejects.toThrow("Published Note 中文 笔记/没有 Slug.md requires a Stable Note Slug.");
});

test("a Stable Note Slug keeps Chinese and space-containing source paths out of Astro routes", async () => {
  const outputDirectory = await mkdtemp(join(tmpdir(), "second-brain-site-"));
  temporaryDirectories.push(outputDirectory);

  await buildPublishedSite({
    vaultRevisionPath: new URL("./fixtures/stable-slug-non-ascii/", import.meta.url),
    outputDirectory,
  });

  const notePage = await readFile(join(outputDirectory, "notes", "stable-note-url", "index.html"), "utf8");

  expect(notePage).toContain("This path must not become part of the Note URL.");
  await expect(readFile(join(outputDirectory, "notes", "中文 笔记", "稳定 URL", "index.html"), "utf8")).rejects.toThrow("ENOENT");
});

test("two Published Notes with the same Note URL prevent publication and identify both sources", async () => {
  const outputDirectory = await mkdtemp(join(tmpdir(), "second-brain-site-"));
  temporaryDirectories.push(outputDirectory);

  await expect(buildPublishedSite({
    vaultRevisionPath: new URL("./fixtures/note-url-conflict/", import.meta.url),
    outputDirectory,
  })).rejects.toThrow("Note URL Conflict: first.md and second.md both resolve to /notes/shared-note/.");
});

test("a Published Note renders MVP Markdown, safe links, attachments, and a Table of Contents", async () => {
  const outputDirectory = await mkdtemp(join(tmpdir(), "second-brain-site-"));
  temporaryDirectories.push(outputDirectory);

  const buildResult = await buildPublishedSite({
    vaultRevisionPath: new URL("./fixtures/linked-rendering/", import.meta.url),
    outputDirectory,
  });

  const guidePage = await readFile(join(outputDirectory, "notes", "guide", "index.html"), "utf8");
  const copiedImage = await readFile(join(outputDirectory, "assets", "diagram.svg"), "utf8");
  const copiedPdf = await readFile(join(outputDirectory, "assets", "guide.pdf"), "utf8");

  expect(guidePage).toContain('<h2 id="overview">Overview</h2>');
  expect(guidePage).toContain('<h2 id="overview-1">Overview</h2>');
  expect(guidePage).toContain('<section class="doc-section">');
  expect(guidePage).toContain('<span class="sec-no">01</span><h2 id="overview">Overview</h2>');
  expect(guidePage).toContain('aria-label="目录"');
  expect(guidePage).toContain('href="#overview-1"');
  expect(guidePage).toContain("<strong>bold</strong>");
  expect(guidePage).toContain("<em>emphasis</em>");
  expect(guidePage).toContain("<code>inline code</code>");
  expect(guidePage).toContain("<ul>");
  expect(guidePage).toContain("<blockquote>");
  expect(guidePage).toContain("<hr>");
  expect(guidePage).toContain("<table>");
  expect(guidePage).toContain('class="language-ts"');
  expect(guidePage).toContain('href="/notes/target/#target-heading"');
  expect(guidePage).toContain('href="/notes/private-reference/"');
  expect(guidePage).toContain('href="https://example.com"');
  expect(guidePage).toContain('href="#overview"');
  expect(guidePage).toContain('<a href="#overview">Same page anchor</a>');
  expect(guidePage).not.toContain('href="/notes/missing/"');
  expect(guidePage).toContain("<span>Missing note</span>");
  expect(guidePage).toContain("<span>Missing target heading</span>");
  expect(guidePage).toContain("<span>No slug target</span>");
  expect(guidePage).not.toContain('href="undefined"');
  expect(guidePage).toContain('src="/assets/diagram.svg"');
  expect(guidePage).toContain('href="/assets/guide.pdf"');
  expect(copiedImage).toContain("fixture-diagram");
  expect(copiedPdf).toContain("fixture-pdf");
  expect(buildResult.diagnostics).toContain("Unresolved Content Link in guide.md: missing.md.");
  expect(buildResult.diagnostics).toContain("Unresolved Content Link in guide.md: target.md#missing-heading.");
  expect(buildResult.diagnostics).toContain("Unresolved Content Link in guide.md: target note does not have a Stable Note Slug.");
  expect(buildResult.diagnostics.join("\n")).not.toContain("no-slug.md");
  await expect(readFile(join(outputDirectory, "notes", "private-reference", "index.html"), "utf8")).rejects.toThrow("ENOENT");
});

test("an unresolved attachment prevents publication with its source and target", async () => {
  const outputDirectory = await mkdtemp(join(tmpdir(), "second-brain-site-"));
  temporaryDirectories.push(outputDirectory);

  await expect(buildPublishedSite({
    vaultRevisionPath: new URL("./fixtures/unresolved-attachment/", import.meta.url),
    outputDirectory,
  })).rejects.toThrow("Unresolved Attachment in broken-image.md: assets/missing.svg.");
});

test("an attachment path that leaves the Vault prevents publication", async () => {
  const outputDirectory = await mkdtemp(join(tmpdir(), "second-brain-site-"));
  temporaryDirectories.push(outputDirectory);

  await expect(buildPublishedSite({
    vaultRevisionPath: new URL("./fixtures/outside-attachment/", import.meta.url),
    outputDirectory,
  })).rejects.toThrow("Vault-local Attachment violation in outside.md: ../not-a-vault-attachment.pdf.");
});

test("an attachment symlink that resolves outside the Vault prevents publication", async () => {
  const vaultDirectory = await mkdtemp(join(tmpdir(), "second-brain-site-vault-"));
  const outsideDirectory = await mkdtemp(join(tmpdir(), "second-brain-site-outside-"));
  const outputDirectory = await mkdtemp(join(tmpdir(), "second-brain-site-"));
  temporaryDirectories.push(vaultDirectory, outsideDirectory, outputDirectory);
  await mkdir(join(vaultDirectory, "assets"));
  await writeFile(join(vaultDirectory, "linked.md"), "---\npublished: true\nslug: linked\ntitle: Linked\ndate: 2026-08-04\ntags: []\n---\n\n[Outside](assets/outside.pdf)\n");
  await writeFile(join(outsideDirectory, "outside.pdf"), "%PDF-1.1\nexternal\n");
  await symlink(join(outsideDirectory, "outside.pdf"), join(vaultDirectory, "assets", "outside.pdf"));

  await expect(buildPublishedSite({ vaultRevisionPath: vaultDirectory, outputDirectory }))
    .rejects.toThrow("Vault-local Attachment violation in linked.md: assets/outside.pdf.");
});

test("an unreadable attachment prevents publication", async () => {
  const vaultDirectory = await mkdtemp(join(tmpdir(), "second-brain-site-vault-"));
  const outputDirectory = await mkdtemp(join(tmpdir(), "second-brain-site-"));
  temporaryDirectories.push(vaultDirectory, outputDirectory);
  await mkdir(join(vaultDirectory, "assets"));
  await writeFile(join(vaultDirectory, "unreadable.md"), "---\npublished: true\nslug: unreadable\ntitle: Unreadable\ndate: 2026-08-04\ntags: []\n---\n\n[Unreadable](assets/private.pdf)\n");
  const attachmentPath = join(vaultDirectory, "assets", "private.pdf");
  await writeFile(attachmentPath, "%PDF-1.1\nprivate\n");
  await chmod(attachmentPath, 0o000);

  await expect(buildPublishedSite({ vaultRevisionPath: vaultDirectory, outputDirectory }))
    .rejects.toThrow("Unresolved Attachment in unreadable.md: assets/private.pdf.");
});
