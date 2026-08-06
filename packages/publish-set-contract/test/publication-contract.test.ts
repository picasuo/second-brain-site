import { chmod, mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
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

  expect(result.blockingErrors).toContainEqual(
    expect.objectContaining({ code: "missing-published-note-slug", sourcePath: "published.md" }),
  );
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

  expect(result.blockingErrors).toContainEqual(
    expect.objectContaining({ code: "invalid-published-note-date", sourcePath: "invalid-date.md" }),
  );
});

test("a Publication Contract reports non-list Published Note tags as a structured blocking error", async () => {
  const vaultRoot = await mkdtemp(join(tmpdir(), "publish-set-contract-"));
  temporaryDirectories.push(vaultRoot);
  await writeFile(join(vaultRoot, "invalid-tags.md"), "---\npublished: true\ndate: 2026-08-04\ntags: engineering\n---\n");

  const result = await validatePublicationContract({ vaultRoot });

  expect(result.blockingErrors).toContainEqual(
    expect.objectContaining({ code: "invalid-published-note-tags", sourcePath: "invalid-tags.md" }),
  );
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

test("a Publication Contract requires a Stable Note Slug for every Published Note and derives its Note URL", async () => {
  const vaultRoot = await mkdtemp(join(tmpdir(), "publish-set-contract-"));
  temporaryDirectories.push(vaultRoot);
  await writeFile(join(vaultRoot, "stable.md"), "---\npublished: true\nslug: stable-note\ndate: 2026-08-04\ntags: []\n---\n");
  await writeFile(join(vaultRoot, "missing.md"), "---\npublished: true\ndate: 2026-08-04\ntags: []\n---\n");

  const result = await validatePublicationContract({ vaultRoot });

  expect(result.blockingErrors).toContainEqual(
    expect.objectContaining({ code: "missing-published-note-slug", sourcePath: "missing.md" }),
  );
  expect(result.notes).toContainEqual(expect.objectContaining({ sourcePath: "stable.md", noteUrl: "/notes/stable-note/" }));
  expect(result.notes).toContainEqual(expect.objectContaining({ sourcePath: "missing.md", noteUrl: undefined }));
});

test("a Publication Contract rejects two Published Notes with the same Note URL", async () => {
  const vaultRoot = await mkdtemp(join(tmpdir(), "publish-set-contract-"));
  temporaryDirectories.push(vaultRoot);
  const note = (title: string) => `---\npublished: true\ntitle: ${title}\nslug: shared-note\ndate: 2026-08-04\ntags: []\n---\n`;
  await writeFile(join(vaultRoot, "first.md"), note("First"));
  await writeFile(join(vaultRoot, "second.md"), note("Second"));

  const result = await validatePublicationContract({ vaultRoot });

  expect(result.blockingErrors).toContainEqual(expect.objectContaining({
    code: "note-url-conflict",
    message: "Note URL Conflict: first.md and second.md both resolve to /notes/shared-note/.",
    sourcePath: "second.md",
  }));
});

test("a Publication Contract resolves an Unpublished Link by Stable Note Slug and hides a target without one", async () => {
  const vaultRoot = await mkdtemp(join(tmpdir(), "publish-set-contract-"));
  temporaryDirectories.push(vaultRoot);
  await mkdir(join(vaultRoot, "private notes"));
  await writeFile(join(vaultRoot, "guide.md"), "---\npublished: true\nslug: guide\ndate: 2026-08-04\ntags: []\n---\n\n[Private](private%20notes/%E7%A7%81%E5%AF%86.md#section) and [No slug](unresolved.md).\n");
  await writeFile(join(vaultRoot, "private notes", "私密.md"), "---\nslug: private-target\n---\n\n## Section\n");
  await writeFile(join(vaultRoot, "unresolved.md"), "---\ntitle: Unresolved\n---\n");

  const result = await validatePublicationContract({ vaultRoot });

  expect(result.contentLinks).toContainEqual(expect.objectContaining({
    kind: "resolved",
    resolvedHref: "/notes/private-target/#section",
    sourcePath: "guide.md",
  }));
  expect(result.diagnostics).toContainEqual(expect.objectContaining({
    code: "unresolved-content-link-missing-slug",
    sourcePath: "guide.md",
  }));
  expect(result.diagnostics.find((diagnostic) => diagnostic.code === "unresolved-content-link-missing-slug")?.message)
    .not.toContain("unresolved.md");
});

test("a Publication Contract does not validate Content Links from an unpublished note", async () => {
  const vaultRoot = await mkdtemp(join(tmpdir(), "publish-set-contract-"));
  temporaryDirectories.push(vaultRoot);
  await writeFile(join(vaultRoot, "published.md"), "---\npublished: true\nslug: published\ndate: 2026-08-04\ntags: []\n---\n");
  await writeFile(join(vaultRoot, "private.md"), "---\ntitle: Private\n---\n\n[Missing](missing.md)\n");

  const result = await validatePublicationContract({ vaultRoot });

  expect(result.diagnostics).toEqual([]);
  expect(result.contentLinks).toEqual([]);
});
