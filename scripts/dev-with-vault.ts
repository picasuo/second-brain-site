import { spawn } from "node:child_process";

import { prepareDevPublishedNotes } from "./prepare-dev-published-notes.js";

const [vaultFlag, vaultRevisionPath] = process.argv.slice(2).filter((argument) => argument !== "--");

if (vaultFlag !== "--vault" || !vaultRevisionPath) {
  throw new Error("Usage: pnpm dev:vault -- --vault <vault-revision-path>");
}

await prepareDevPublishedNotes(vaultRevisionPath);

const dev = spawn("pnpm", ["dev", "--host", "127.0.0.1", "--port", process.env.DEV_PORT ?? "4173"], {
  cwd: process.cwd(),
  env: process.env,
  stdio: "inherit",
});

dev.once("error", (error) => {
  throw error;
});

dev.once("exit", (code) => {
  process.exitCode = code ?? 1;
});
