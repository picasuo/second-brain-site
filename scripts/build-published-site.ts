import { resolve } from "node:path";

import { buildPublishedSite } from "../src/published-site-build.js";

const [vaultFlag, vaultRevisionPath, outputFlag, outputDirectory] = process.argv.slice(2).filter((argument) => argument !== "--");

if (vaultFlag !== "--vault" || outputFlag !== "--out" || !vaultRevisionPath || !outputDirectory) {
  throw new Error("Usage: pnpm build -- --vault <vault-revision-path> --out <output-directory>");
}

await buildPublishedSite({
  vaultRevisionPath: resolve(vaultRevisionPath),
  outputDirectory: resolve(outputDirectory),
});
