import { execFile } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";
import { afterEach, expect, test } from "vitest";

import { buildPublishedSite } from "../src/published-site-build.js";

const execFileAsync = promisify(execFile);
const temporaryDirectories: string[] = [];

afterEach(async () => {
  await Promise.all(temporaryDirectories.splice(0).map((directory) => rm(directory, { recursive: true, force: true })));
});

test("the repository dispatch workflow checks out and builds the supplied Vault Revision", async () => {
  const workflow = await readFile(new URL("../.github/workflows/publish-vault-revision.yml", import.meta.url), "utf8");

  expect(workflow).toContain("repository_dispatch:");
  expect(workflow).toContain("publish-vault-revision");
  expect(workflow).toContain("VAULT_SHA: ${{ github.event.client_payload.vault_sha }}");
  expect(workflow).toContain("repository: ${{ vars.VAULT_REPOSITORY }}");
  expect(workflow).toContain("ref: ${{ github.event.client_payload.vault_sha }}");
  expect(workflow).toContain("path: .vault-revision");
  expect(workflow).toContain("--vault .vault-revision --out dist --vault-sha \"$VAULT_SHA\"");
  expect(workflow).toMatch(/concurrency:\n  group: published-site-build\n  cancel-in-progress: false/);
});

test("the repository dispatch workflow uses the pnpm version declared by the project", async () => {
  const workflow = await readFile(new URL("../.github/workflows/publish-vault-revision.yml", import.meta.url), "utf8");
  const packageJson = JSON.parse(await readFile(new URL("../package.json", import.meta.url), "utf8")) as { packageManager?: string };

  expect(packageJson.packageManager).toBe("pnpm@10.24.0");
  expect(workflow).toContain("uses: pnpm/action-setup@0ebf47130e4866e96fce0953f49152a61190b271");
  expect(workflow).toContain("version: 10.24.0");
  expect(workflow).toContain("cache: pnpm");
  expect(workflow).not.toContain("corepack enable");
});

test("a dispatched Vault Revision is built after the Vault default branch advances", async () => {
  const vaultRepository = await mkdtemp(join(tmpdir(), "second-brain-site-vault-repository-"));
  const checkoutDirectory = await mkdtemp(join(tmpdir(), "second-brain-site-vault-checkout-"));
  const outputDirectory = await mkdtemp(join(tmpdir(), "second-brain-site-receipt-"));
  temporaryDirectories.push(vaultRepository, checkoutDirectory, outputDirectory);

  await git(vaultRepository, "init", "--initial-branch=main");
  await git(vaultRepository, "config", "user.email", "tests@example.com");
  await git(vaultRepository, "config", "user.name", "Second Brain Site Tests");
  await writeFile(join(vaultRepository, "release.md"), publishedNote("Dispatched Vault Revision"));
  await git(vaultRepository, "add", "release.md");
  await git(vaultRepository, "commit", "-m", "Create dispatched revision");
  const vaultSha = (await git(vaultRepository, "rev-parse", "HEAD")).trim();

  await writeFile(join(vaultRepository, "release.md"), publishedNote("Advanced default branch"));
  await git(vaultRepository, "commit", "-am", "Advance default branch");
  expect((await git(vaultRepository, "rev-parse", "HEAD")).trim()).not.toBe(vaultSha);

  await rm(checkoutDirectory, { recursive: true, force: true });
  await git(vaultRepository, "worktree", "add", "--detach", checkoutDirectory, vaultSha);

  const result = await buildPublishedSite({
    vaultRevisionPath: checkoutDirectory,
    outputDirectory,
    vaultSha,
  });
  const notePage = await readFile(join(outputDirectory, "notes", "release", "index.html"), "utf8");

  expect(notePage).toContain("Dispatched Vault Revision");
  expect(notePage).not.toContain("Advanced default branch");
  expect(result.diagnostics).toContain(`Vault Revision: ${vaultSha}`);
});

function publishedNote(body: string): string {
  return `---\npublished: true\ntitle: Revision Receipt\ndate: 2026-08-04\ntags: []\n---\n\n${body}\n`;
}

async function git(cwd: string, ...arguments_: string[]): Promise<string> {
  const { stdout } = await execFileAsync("git", arguments_, { cwd });
  return stdout;
}
