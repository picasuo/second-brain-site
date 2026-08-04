import { resolve } from "node:path";

import { buildPublishedSite } from "../src/published-site-build.js";

const arguments_ = process.argv.slice(2).filter((argument) => argument !== "--");
const [vaultFlag, vaultRevisionPath, outputFlag, outputDirectory, vaultShaFlag, vaultSha] = arguments_;

if (
  vaultFlag !== "--vault"
  || outputFlag !== "--out"
  || !vaultRevisionPath
  || !outputDirectory
  || (vaultShaFlag !== undefined && (vaultShaFlag !== "--vault-sha" || vaultSha === undefined))
  || (vaultShaFlag === undefined && arguments_.length !== 4)
  || (vaultShaFlag !== undefined && arguments_.length !== 6)
) {
  throw new Error("Usage: pnpm build -- --vault <vault-revision-path> --out <output-directory> [--vault-sha <vault-sha>]");
}

const result = await buildPublishedSite({
  vaultRevisionPath: resolve(vaultRevisionPath),
  outputDirectory: resolve(outputDirectory),
  vaultSha,
});

for (const diagnostic of result.diagnostics) console.warn(diagnostic);
