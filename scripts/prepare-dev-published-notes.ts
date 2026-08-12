import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { resolve, join } from "node:path";

import { buildPublishedSite } from "../src/published-site-build.js";

export async function prepareDevPublishedNotes(vaultRevisionPath: string): Promise<void> {
  const outputDirectory = await mkdtemp(join(tmpdir(), "second-brain-site-dev-"));

  await buildPublishedSite({
    outputDirectory,
    preserveGeneratedNotes: true,
    vaultRevisionPath: resolve(vaultRevisionPath),
  });

  console.warn(`Generated dev Published Notes from ${resolve(vaultRevisionPath)}.`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const [vaultFlag, vaultRevisionPath] = process.argv.slice(2).filter((argument) => argument !== "--");

  if (vaultFlag !== "--vault" || !vaultRevisionPath) {
    throw new Error("Usage: pnpm prepare-dev -- --vault <vault-revision-path>");
  }

  await prepareDevPublishedNotes(vaultRevisionPath);
}
