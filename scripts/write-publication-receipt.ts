import { writePublicationReceipt } from "../src/publication-receipt.js";

const [outputFlag, outputDirectory, vaultShaFlag, vaultSha, contractVersionFlag, contractVersion] = process.argv.slice(2).filter((argument) => argument !== "--");

if (
  outputFlag !== "--out"
  || !outputDirectory
  || vaultShaFlag !== "--vault-sha"
  || !vaultSha
  || contractVersionFlag !== "--contract-version"
  || !contractVersion
) {
  throw new Error("Usage: tsx scripts/write-publication-receipt.ts --out <output-directory> --vault-sha <vault-sha> --contract-version <contract-version>");
}

await writePublicationReceipt(outputDirectory, { vaultSha, contractVersion });
