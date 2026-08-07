import process from "node:process";

import {
  publicationContractVersion,
  validatePublicationContract,
} from "@picasuo/publish-set-contract";

const result = await validatePublicationContract({ vaultRoot: process.cwd() });

if (result.blockingErrors.length > 0) {
  for (const diagnostic of result.blockingErrors) {
    console.error(`${diagnostic.sourcePath}: ${diagnostic.code}: ${diagnostic.message}`);
  }
  process.exitCode = 1;
} else {
  for (const diagnostic of result.diagnostics) {
    console.warn(`${diagnostic.sourcePath}: ${diagnostic.code}: ${diagnostic.message}`);
  }
  console.log(`Release Preflight passed with Publication Contract ${publicationContractVersion}.`);
}
