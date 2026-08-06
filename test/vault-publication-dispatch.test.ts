import { readFile } from "node:fs/promises";

import { expect, test } from "vitest";

test("the Vault dispatch template sends the triggering immutable tag revision to the Site Repository", async () => {
  const workflow = await readFile(
    new URL("../docs/templates/vault-dispatch-published-site.yml", import.meta.url),
    "utf8",
  );

  expect(workflow).toContain("push:");
  expect(workflow).toContain("tags: ['*']");
  expect(workflow).not.toContain("branches:");
  expect(workflow).toContain("workflow_dispatch:");
  expect(workflow).toContain("VAULT_SHA: ${{ github.sha }}");
  expect(workflow).toContain("CONTRACT_VERSION:");
  expect(workflow).toContain("SITE_REPOSITORY_DISPATCH_TOKEN: ${{ secrets.SITE_REPOSITORY_DISPATCH_TOKEN }}");
  expect(workflow).toContain("https://api.github.com/repos/picasuo/second-brain-site/dispatches");
  expect(workflow).toContain('"event_type":"publish-vault-revision"');
  expect(workflow).toMatch(/"vault_sha":"[^}]*VAULT_SHA/);
  expect(workflow).toMatch(/"contract_version":"[^}]*CONTRACT_VERSION/);
  expect(workflow).not.toContain("secrets.GITHUB_TOKEN");
});
