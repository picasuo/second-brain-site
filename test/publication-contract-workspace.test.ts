import { expect, test } from "vitest";

import { publicationContractVersion } from "../src/publication-contract.js";

test("the Site application consumes the exact released Publication Contract version", () => {
  expect(publicationContractVersion).toBe("0.2.1");
});
