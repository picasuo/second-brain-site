import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, expect, test } from "vitest";

import { buildPublishedSite } from "../src/published-site-build.js";

const outputDirectories: string[] = [];

afterEach(async () => {
  await Promise.all(outputDirectories.splice(0).map((directory) => rm(directory, { recursive: true, force: true })));
});

test("a Vault Revision with one Published Note produces a Notes Index and public note page", async () => {
  const outputDirectory = await mkdtemp(join(tmpdir(), "second-brain-site-"));
  outputDirectories.push(outputDirectory);

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

test("a Publish Set excludes private notes, orders Published Notes, and exposes Canonical Tag", async () => {
  const outputDirectory = await mkdtemp(join(tmpdir(), "second-brain-site-"));
  outputDirectories.push(outputDirectory);

  await buildPublishedSite({
    vaultRevisionPath: new URL("./fixtures/publish-set-metadata/", import.meta.url),
    outputDirectory,
  });

  const notesIndex = await readFile(join(outputDirectory, "notes", "index.html"), "utf8");

  expect(notesIndex).toContain("latest-note");
  expect(notesIndex).toContain('href="/notes/alpha-release/"');
  expect(notesIndex).toContain('href="/notes/latest-note/"');
  expect(notesIndex).toContain("engineering");
  expect(notesIndex).toContain("运维");
  expect(notesIndex.match(/engineering/g)).toHaveLength(1);
  expect(notesIndex).not.toContain("Private Note");
  await expect(readFile(join(outputDirectory, "notes", "private", "index.html"), "utf8")).rejects.toThrow("ENOENT");
  expect(notesIndex.indexOf("latest-note")).toBeLessThan(notesIndex.indexOf("Alpha"));
  expect(notesIndex.indexOf("Alpha")).toBeLessThan(notesIndex.indexOf("Zulu"));
});

test("a Published Note without a valid date prevents publication with its source path", async () => {
  const outputDirectory = await mkdtemp(join(tmpdir(), "second-brain-site-"));
  outputDirectories.push(outputDirectory);

  await expect(buildPublishedSite({
    vaultRevisionPath: new URL("./fixtures/missing-date/", import.meta.url),
    outputDirectory,
  })).rejects.toThrow("Published Note missing-date.md requires a valid date in YYYY-MM-DD format.");
});

test("a Published Note with an invalid date prevents publication with its source path", async () => {
  const outputDirectory = await mkdtemp(join(tmpdir(), "second-brain-site-"));
  outputDirectories.push(outputDirectory);

  await expect(buildPublishedSite({
    vaultRevisionPath: new URL("./fixtures/invalid-date/", import.meta.url),
    outputDirectory,
  })).rejects.toThrow("Published Note invalid-date.md requires a valid date in YYYY-MM-DD format.");
});

test("a Published Note with an invalid slug prevents publication with its source path", async () => {
  const outputDirectory = await mkdtemp(join(tmpdir(), "second-brain-site-"));
  outputDirectories.push(outputDirectory);

  await expect(buildPublishedSite({
    vaultRevisionPath: new URL("./fixtures/invalid-slug/", import.meta.url),
    outputDirectory,
  })).rejects.toThrow("Published Note invalid-slug.md has an invalid slug: Invalid_Slug.");
});

test("two Published Notes with the same Note URL prevent publication and identify both sources", async () => {
  const outputDirectory = await mkdtemp(join(tmpdir(), "second-brain-site-"));
  outputDirectories.push(outputDirectory);

  await expect(buildPublishedSite({
    vaultRevisionPath: new URL("./fixtures/note-url-conflict/", import.meta.url),
    outputDirectory,
  })).rejects.toThrow("Note URL Conflict: first.md and second.md both resolve to /notes/shared-note/.");
});
