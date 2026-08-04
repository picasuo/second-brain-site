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
