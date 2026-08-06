import { appendFile, readFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { validateDispatchReceipt } from "../src/dispatch-receipt.js";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const packageJson = JSON.parse(
  await readFile(join(projectRoot, "packages", "publish-set-contract", "package.json"), "utf8"),
) as { version?: unknown };

if (typeof packageJson.version !== "string") {
  throw new Error("The Site workspace Publication Contract package must declare a version.");
}

const receipt = validateDispatchReceipt({
  vaultSha: process.env.VAULT_SHA,
  contractVersion: process.env.CONTRACT_VERSION,
  workspaceContractVersion: packageJson.version,
});

await appendGitHubFile(process.env.GITHUB_OUTPUT, `vault_sha=${receipt.vaultSha}\ncontract_version=${receipt.contractVersion}\n`);
await appendGitHubFile(
  process.env.GITHUB_STEP_SUMMARY,
  `Vault Revision: ${receipt.vaultSha}\n\nPublication Contract Version: ${receipt.contractVersion}\n`,
);

async function appendGitHubFile(path: string | undefined, content: string): Promise<void> {
  if (path === undefined) return;
  await appendFile(path, content);
}
