import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { afterEach, expect, test } from "vitest";

import { buildPublishedSite } from "../src/published-site-build.js";
import { migrateVaultPublishSet } from "../src/vault-publish-set-migration.js";

const temporaryDirectories: string[] = [];

afterEach(async () => {
  await Promise.all(temporaryDirectories.splice(0).map((directory) => rm(directory, { recursive: true, force: true })));
});

test("the Vault dispatch template sends the triggering immutable revision to the Site Repository", async () => {
  const workflow = await readFile(
    new URL("../docs/templates/vault-dispatch-published-site.yml", import.meta.url),
    "utf8",
  );

  expect(workflow).toContain("push:");
  expect(workflow).toContain("branches: [main]");
  expect(workflow).toContain("workflow_dispatch:");
  expect(workflow).toContain("VAULT_SHA: ${{ github.sha }}");
  expect(workflow).toContain("SITE_REPOSITORY_DISPATCH_TOKEN: ${{ secrets.SITE_REPOSITORY_DISPATCH_TOKEN }}");
  expect(workflow).toContain("https://api.github.com/repos/picasuo/second-brain-site/dispatches");
  expect(workflow).toContain('"event_type":"publish-vault-revision"');
  expect(workflow).toMatch(/"vault_sha":"[^}]*VAULT_SHA/);
  expect(workflow).not.toContain("secrets.GITHUB_TOKEN");
});

test("the migration only publishes the re-scanned operations notes after dispatch validation is acknowledged", async () => {
  const vaultDirectory = await mkdtemp(join(tmpdir(), "second-brain-site-vault-migration-"));
  const outputDirectory = await mkdtemp(join(tmpdir(), "second-brain-site-vault-migration-output-"));
  temporaryDirectories.push(vaultDirectory, outputDirectory);
  await mkdir(join(vaultDirectory, "运维"));
  await writeFile(join(vaultDirectory, "运维", "release.md"), operationalNote("Release note"));
  await writeFile(join(vaultDirectory, "private.md"), operationalNote("Private note"));

  const dryRun = await migrateVaultPublishSet({ vaultPath: vaultDirectory, notesDirectory: "运维" });
  expect(dryRun.candidatePaths).toEqual(["运维/release.md"]);
  expect(dryRun.updatedPaths).toEqual([]);
  await expect(readFile(join(vaultDirectory, "运维", "release.md"), "utf8")).resolves.not.toContain("published: true");

  await expect(migrateVaultPublishSet({ vaultPath: vaultDirectory, notesDirectory: "运维", apply: true }))
    .rejects.toThrow("--apply requires --dispatch-validated");

  const migration = await migrateVaultPublishSet({
    vaultPath: vaultDirectory,
    notesDirectory: "运维",
    dispatchValidated: true,
    apply: true,
  });

  expect(migration.updatedPaths).toEqual(["运维/release.md"]);
  await expect(readFile(join(vaultDirectory, "运维", "release.md"), "utf8")).resolves.toContain("published: true");
  await expect(readFile(join(vaultDirectory, "private.md"), "utf8")).resolves.not.toContain("published: true");
  await buildPublishedSite({ vaultRevisionPath: vaultDirectory, outputDirectory });
  await expect(readFile(join(outputDirectory, "notes", "%E8%BF%90%E7%BB%B4", "release", "index.html"), "utf8")).resolves.toContain("Release note");
  await expect(readFile(join(outputDirectory, "notes", "private", "index.html"), "utf8")).rejects.toThrow("ENOENT");
});

test("the migration rejects an invalid published-note slug before it writes any candidate", async () => {
  const vaultDirectory = await mkdtemp(join(tmpdir(), "second-brain-site-vault-migration-"));
  temporaryDirectories.push(vaultDirectory);
  await mkdir(join(vaultDirectory, "运维"));
  await writeFile(join(vaultDirectory, "运维", "first.md"), operationalNote("First note"));
  await writeFile(join(vaultDirectory, "运维", "invalid.md"), "---\ntitle: Invalid\ndate: 2026-08-04\ntags: []\nslug: invalid slug\n---\n\nInvalid\n");

  await expect(migrateVaultPublishSet({
    vaultPath: vaultDirectory,
    notesDirectory: "运维",
    dispatchValidated: true,
    apply: true,
  })).rejects.toThrow("Candidate note has an invalid slug and will not be published: 运维/invalid.md.");

  await expect(readFile(join(vaultDirectory, "运维", "first.md"), "utf8")).resolves.not.toContain("published: true");
});

function operationalNote(title: string): string {
  return `---\ntitle: ${title}\ndate: 2026-08-04\ntags: []\n---\n\n${title}\n`;
}
