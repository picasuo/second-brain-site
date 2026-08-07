import process from "node:process";

import {
  publicationContractVersion,
  validatePublicationContract,
} from "@picasuo/publish-set-contract";

const expectedContractVersion = "0.2.1";
const result = await validatePublicationContract({ vaultRoot: process.cwd() });

if (publicationContractVersion !== expectedContractVersion || result.contractVersion !== expectedContractVersion) {
  console.error(`Release Preflight requires Publication Contract ${expectedContractVersion}.`);
  process.exitCode = 1;
} else if (result.blockingErrors.length > 0) {
  for (const diagnostic of result.blockingErrors) {
    console.error(`${diagnostic.sourcePath}: ${diagnostic.code}: ${diagnostic.message}`);
  }
  process.exitCode = 1;
} else {
  for (const diagnostic of result.diagnostics) {
    console.warn(`${diagnostic.sourcePath}: ${diagnostic.code}: ${diagnostic.message}`);
  }
  console.log(`Release Preflight passed with Publication Contract ${result.contractVersion}.`);
}
