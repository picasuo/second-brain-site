import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, expect, test } from "vitest";

import { buildPublishedSite } from "../src/published-site-build.js";

const temporaryDirectories: string[] = [];

afterEach(async () => {
  await Promise.all(temporaryDirectories.splice(0).map((directory) => rm(directory, { recursive: true, force: true })));
});

test("a Published Note reader uses the final filename and navigates the complete Published Note sequence", async () => {
  const metadataOutputDirectory = await mkdtemp(join(tmpdir(), "second-brain-site-"));
  temporaryDirectories.push(metadataOutputDirectory);

  await buildPublishedSite({
    vaultRevisionPath: new URL("./fixtures/publish-set-metadata/", import.meta.url),
    outputDirectory: metadataOutputDirectory,
  });

  const titledNote = await readFile(join(metadataOutputDirectory, "notes", "alpha-release", "index.html"), "utf8");
  const filenameFallbackNote = await readFile(join(metadataOutputDirectory, "notes", "latest-note", "index.html"), "utf8");
  const lastNote = await readFile(join(metadataOutputDirectory, "notes", "zulu-release", "index.html"), "utf8");

  expect(titledNote).toContain("alpha.md");
  expect(titledNote).toContain("view ~/notes/alpha.md");
  expect(titledNote).toContain("<h1>Alpha</h1>");
  expect(titledNote).toContain("2026-08-04");
  expect(titledNote).toContain("engineering");
  expect(titledNote).toContain("运维");
  expect(titledNote).toContain('class="terminal-footer-back"');
  expect(titledNote).toContain('aria-label="返回笔记列表"');
  expect(titledNote).toContain('href="/notes/"');
  expect(titledNote).toContain('aria-label="上一篇：latest-note"');
  expect(titledNote).toContain('href="/notes/latest-note/"');
  expect(titledNote).toContain('aria-label="下一篇：Zulu"');
  expect(titledNote).toContain('href="/notes/zulu-release/"');
  expect(titledNote).not.toContain("Back to notes");
  expect(titledNote).not.toContain("alpha-release.md");
  expect(titledNote).not.toContain("read");
  expect(filenameFallbackNote).toContain("<h1>latest-note</h1>");
  expect(filenameFallbackNote).toContain('aria-label="没有上一篇"');
  expect(filenameFallbackNote).toContain('aria-label="下一篇：Alpha"');
  expect(lastNote).toContain('aria-label="上一篇：Alpha"');
  expect(lastNote).toContain('aria-label="没有下一篇"');
});

test("a Published Note reader preserves Markdown headings and adapts its Table of Contents", async () => {
  const markdownOutputDirectory = await mkdtemp(join(tmpdir(), "second-brain-site-"));
  temporaryDirectories.push(markdownOutputDirectory);

  await buildPublishedSite({
    vaultRevisionPath: new URL("./fixtures/linked-rendering/", import.meta.url),
    outputDirectory: markdownOutputDirectory,
  });

  const guidePage = await readFile(join(markdownOutputDirectory, "notes", "guide", "index.html"), "utf8");

  expect(guidePage).toContain('<h1 id="guide-heading">Guide Heading</h1>');
  expect(guidePage).toContain('<h2 id="overview">Overview</h2>');
  expect(guidePage).toContain('<h3 id="details">Details</h3>');
  expect(guidePage).toContain('class="wide-table-of-contents"');
  expect(guidePage).toContain('class="toc-mobile"');
  expect(guidePage).toContain('<summary>$ tree --toc</summary>');
  expect(guidePage).toContain("<details");
  expect(guidePage).toContain('href="#overview-1"');
});
