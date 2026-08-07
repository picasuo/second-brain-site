export interface DispatchReceiptInput {
  contractVersion: string | undefined;
  vaultSha: string | undefined;
  installedContractVersion: string;
}

export interface DispatchReceipt {
  contractVersion: string;
  vaultSha: string;
}

export function validateDispatchReceipt({
  vaultSha,
  contractVersion,
  installedContractVersion,
}: DispatchReceiptInput): DispatchReceipt {
  if (!vaultSha || !/^[0-9a-f]{40}$/.test(vaultSha)) {
    throw new Error("repository_dispatch client_payload.vault_sha must be a full 40-character Git commit SHA.");
  }
  if (!contractVersion) {
    throw new Error("repository_dispatch client_payload.contract_version is required.");
  }
  if (contractVersion !== installedContractVersion) {
    throw new Error(
      `repository_dispatch declared contract_version ${contractVersion} does not match Site installed Contract version ${installedContractVersion}.`,
    );
  }

  return { vaultSha, contractVersion };
}
