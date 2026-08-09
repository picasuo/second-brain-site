import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, expect, test } from "vitest";

import { buildPublishedSite } from "../src/published-site-build.js";

const temporaryDirectories: string[] = [];

afterEach(async () => {
  await Promise.all(temporaryDirectories.splice(0).map((directory) => rm(directory, { recursive: true, force: true })));
});

test("a Published Note reader uses the final filename, preserves Markdown headings, and adapts its Table of Contents", async () => {
  const metadataOutputDirectory = await mkdtemp(join(tmpdir(), "second-brain-site-"));
  const markdownOutputDirectory = await mkdtemp(join(tmpdir(), "second-brain-site-"));
  temporaryDirectories.push(metadataOutputDirectory, markdownOutputDirectory);

  await buildPublishedSite({
    vaultRevisionPath: new URL("./fixtures/publish-set-metadata/", import.meta.url),
    outputDirectory: metadataOutputDirectory,
  });

  const titledNote = await readFile(join(metadataOutputDirectory, "notes", "alpha-release", "index.html"), "utf8");
  const filenameFallbackNote = await readFile(join(metadataOutputDirectory, "notes", "latest-note", "index.html"), "utf8");

  expect(titledNote).toContain("alpha.md");
  expect(titledNote).toContain("view ~/notes/alpha.md");
  expect(titledNote).toContain("<h1>Alpha</h1>");
  expect(titledNote).toContain("2026-08-04");
  expect(titledNote).toContain("engineering");
  expect(titledNote).toContain("运维");
  expect(titledNote).toContain("← Back to notes");
  expect(titledNote).toContain('href="/notes/"');
  expect(titledNote).not.toContain("alpha-release.md");
  expect(titledNote).not.toContain("read");
  expect(filenameFallbackNote).toContain("<h1>latest-note</h1>");

  await buildPublishedSite({
    vaultRevisionPath: new URL("./fixtures/linked-rendering/", import.meta.url),
    outputDirectory: markdownOutputDirectory,
  });

  const guidePage = await readFile(join(markdownOutputDirectory, "notes", "guide", "index.html"), "utf8");

  expect(guidePage).toContain('<h1 id="guide-heading">Guide Heading</h1>');
  expect(guidePage).toContain('<h2 id="overview">Overview</h2>');
  expect(guidePage).toContain('<h3 id="details">Details</h3>');
  expect(guidePage).toContain('class="wide-table-of-contents"');
  expect(guidePage).toContain('class="narrow-table-of-contents"');
  expect(guidePage).toContain("<details");
  expect(guidePage).toContain('href="#overview-1"');
});
