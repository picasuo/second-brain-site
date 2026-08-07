import { appendFile } from "node:fs/promises";

import { publicationContractVersion } from "@picasuo/publish-set-contract";
import { validateDispatchReceipt } from "../src/dispatch-receipt.js";

const receipt = validateDispatchReceipt({
  vaultSha: process.env.VAULT_SHA,
  contractVersion: process.env.CONTRACT_VERSION,
  installedContractVersion: publicationContractVersion,
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
