import { chmod, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { afterEach, expect, test } from "vitest";

import { validatePublicationContract } from "../src/index.js";

const temporaryDirectories: string[] = [];

afterEach(async () => {
  await Promise.all(temporaryDirectories.splice(0).map((directory) => rm(directory, { recursive: true, force: true })));
});

test("a Publication Contract proposes a Stable Note Slug without changing a Published Note", async () => {
  const vaultRoot = await mkdtemp(join(tmpdir(), "publish-set-contract-"));
  temporaryDirectories.push(vaultRoot);
  const sourcePath = join(vaultRoot, "published.md");
  const source = "---\npublished: true\ntitle: Published\ndate: 2026-08-04\ntags: []\n---\n\nA published note.\n";
  await writeFile(sourcePath, source);

  const result = await validatePublicationContract({ vaultRoot, proposeMissingSlugs: true });

  expect(result.blockingErrors).toEqual([]);
  expect(result.diagnostics).toEqual([]);
  expect(result.missingSlugProposals).toEqual([
    expect.objectContaining({ sourcePath: "published.md", slug: expect.stringMatching(/^n-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/) }),
  ]);
  expect(await readFile(sourcePath, "utf8")).toBe(source);
});

test("a Publication Contract reports an unreadable Vault root as a structured blocking error", async () => {
  const vaultRoot = join(tmpdir(), "publish-set-contract-does-not-exist");

  const result = await validatePublicationContract({ vaultRoot });

  expect(result.blockingErrors).toEqual([
    expect.objectContaining({ code: "unreadable-vault-root", sourcePath: "." }),
  ]);
  expect(result.diagnostics).toEqual([]);
});

test("a Publication Contract reports an invalid Published Note date without throwing", async () => {
  const vaultRoot = await mkdtemp(join(tmpdir(), "publish-set-contract-"));
  temporaryDirectories.push(vaultRoot);
  await writeFile(join(vaultRoot, "invalid-date.md"), "---\npublished: true\ndate: 2026-02-30\ntags: []\n---\n");

  const result = await validatePublicationContract({ vaultRoot });

  expect(result.blockingErrors).toEqual([
    expect.objectContaining({ code: "invalid-published-note-date", sourcePath: "invalid-date.md" }),
  ]);
});

test("a Publication Contract reports non-list Published Note tags as a structured blocking error", async () => {
  const vaultRoot = await mkdtemp(join(tmpdir(), "publish-set-contract-"));
  temporaryDirectories.push(vaultRoot);
  await writeFile(join(vaultRoot, "invalid-tags.md"), "---\npublished: true\ndate: 2026-08-04\ntags: engineering\n---\n");

  const result = await validatePublicationContract({ vaultRoot });

  expect(result.blockingErrors).toEqual([
    expect.objectContaining({ code: "invalid-published-note-tags", sourcePath: "invalid-tags.md" }),
  ]);
});

test("a Publication Contract reports an unreadable Vault note as a structured blocking error", async () => {
  const vaultRoot = await mkdtemp(join(tmpdir(), "publish-set-contract-"));
  temporaryDirectories.push(vaultRoot);
  const sourcePath = join(vaultRoot, "unreadable.md");
  await writeFile(sourcePath, "---\npublished: true\ndate: 2026-08-04\ntags: []\n---\n");
  await chmod(sourcePath, 0o000);

  const result = await validatePublicationContract({ vaultRoot });

  expect(result.blockingErrors).toEqual([
    expect.objectContaining({ code: "unreadable-vault-note", sourcePath: "unreadable.md" }),
  ]);
});
