import { expect, test } from "vitest";

import { publicationContractVersion } from "../src/publication-contract.js";

test("the Site application consumes the Publication Contract from the workspace", () => {
  expect(publicationContractVersion).toBe("0.1.0");
});
