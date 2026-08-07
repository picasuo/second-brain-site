import { readFile } from "node:fs/promises";

import { expect, test } from "vitest";

test("the Vault dispatch template sends the triggering immutable tag revision to the Site Repository", async () => {
  const workflow = await readFile(
    new URL("../docs/templates/vault-dispatch-published-site.yml", import.meta.url),
    "utf8",
  );

  expect(workflow).toContain("push:");
  expect(workflow).toContain("tags: ['vault-release-*']");
  expect(workflow).not.toContain("branches:");
  expect(workflow).not.toContain("workflow_dispatch:");
  expect(workflow).toContain("VAULT_SHA: ${{ github.sha }}");
  expect(workflow).toContain("CONTRACT_VERSION: ${{ vars.PUBLICATION_CONTRACT_VERSION }}");
  expect(workflow).toContain('EXPECTED_CONTRACT_VERSION: "0.2.1"');
  expect(workflow).toContain('[[ "$CONTRACT_VERSION" != "$EXPECTED_CONTRACT_VERSION" ]]');
  expect(workflow).toContain("npm ci --ignore-scripts");
  expect(workflow).toContain("npm run release:preflight");
  expect(workflow.indexOf("npm run release:preflight")).toBeLessThan(workflow.indexOf("curl --fail"));
  expect(workflow).toContain("SITE_REPOSITORY_DISPATCH_TOKEN: ${{ secrets.SITE_REPOSITORY_DISPATCH_TOKEN }}");
  expect(workflow).toContain("https://api.github.com/repos/picasuo/second-brain-site/dispatches");
  expect(workflow).toContain('"event_type":"publish-vault-revision"');
  expect(workflow).toMatch(/"vault_sha":"[^}]*VAULT_SHA/);
  expect(workflow).toMatch(/"contract_version":"[^}]*CONTRACT_VERSION/);
  expect(workflow).not.toContain("secrets.GITHUB_TOKEN");
});

test("the Vault release preflight fixes the same Contract version and never writes Vault notes", async () => {
  const [packageTemplate, preflight] = await Promise.all([
    readFile(new URL("../docs/templates/vault-release-package.json", import.meta.url), "utf8"),
    readFile(new URL("../docs/templates/vault-release-preflight.mjs", import.meta.url), "utf8"),
  ]);

  expect(packageTemplate).toContain('"@picasuo/publish-set-contract": "0.2.1"');
  expect(packageTemplate).not.toMatch(/[~^]|latest/);
  expect(preflight).toContain('const expectedContractVersion = "0.2.1"');
  expect(preflight).toContain("validatePublicationContract");
  expect(preflight).toContain("result.blockingErrors.length > 0");
  expect(preflight).not.toContain("proposeMissingSlugs: true");
  expect(preflight).not.toMatch(/writeFile|appendFile|mkdir|rm\(/);
});
