export interface PublicationReceiptInput {
  contractVersion: string;
  vaultSha: string;
}

export interface PublicationReceipt {
  contract_version: string;
  vault_sha: string;
}

export function createPublicationReceipt({ vaultSha, contractVersion }: PublicationReceiptInput): PublicationReceipt {
  return { vault_sha: vaultSha, contract_version: contractVersion };
}

export async function writePublicationReceipt(outputDirectory: string, input: PublicationReceiptInput): Promise<void> {
  const resolvedOutputDirectory = resolve(outputDirectory);
  await mkdir(resolvedOutputDirectory, { recursive: true });
  await writeFile(
    resolve(resolvedOutputDirectory, "publication-receipt.json"),
    `${JSON.stringify(createPublicationReceipt(input), null, 2)}\n`,
  );
}
import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
