import { spawn } from "node:child_process";

import { prepareDevPublishedNotes } from "./prepare-dev-published-notes.js";

type DevWithVaultOptions = {
  host: string;
  vaultRevisionPath: string;
};

function parseOptions(arguments_: string[]): DevWithVaultOptions {
  let host = "127.0.0.1";
  let vaultRevisionPath: string | undefined;

  for (let index = 0; index < arguments_.length; index += 1) {
    const argument = arguments_[index];
    if (argument === "--") continue;

    const value = arguments_[index + 1];
    if (argument === "--vault" && value) {
      vaultRevisionPath = value;
      index += 1;
      continue;
    }

    if (argument === "--host" && value) {
      host = value;
      index += 1;
      continue;
    }

    throw new Error("Usage: pnpm dev:vault -- --vault <vault-revision-path> [--host <host>]");
  }

  if (!vaultRevisionPath) {
    throw new Error("Usage: pnpm dev:vault -- --vault <vault-revision-path> [--host <host>]");
  }

  return { host, vaultRevisionPath };
}

const { host, vaultRevisionPath } = parseOptions(process.argv.slice(2));

await prepareDevPublishedNotes(vaultRevisionPath);

const dev = spawn("pnpm", ["dev", "--host", host, "--port", process.env.DEV_PORT ?? "4173"], {
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
