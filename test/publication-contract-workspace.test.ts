import { readFile } from "node:fs/promises";

import { expect, test } from "vitest";

import { publicationContractVersion } from "../src/publication-contract.js";

test("the Site application consumes the Publication Contract version declared by the workspace package", async () => {
  const packageJson = JSON.parse(
    await readFile(new URL("../packages/publish-set-contract/package.json", import.meta.url), "utf8"),
  ) as { version?: string };

  expect(publicationContractVersion).toBe(packageJson.version);
});
