import { resolve } from "node:path";

import { migrateVaultPublishSet } from "../src/vault-publish-set-migration.js";

const arguments_ = process.argv.slice(2).filter((argument) => argument !== "--");
const vaultIndex = arguments_.indexOf("--vault");
const notesDirectoryIndex = arguments_.indexOf("--notes-dir");
const apply = arguments_.includes("--apply");
const dispatchValidated = arguments_.includes("--dispatch-validated");
const vaultPath = vaultIndex === -1 ? undefined : arguments_[vaultIndex + 1];
const notesDirectory = notesDirectoryIndex === -1 ? undefined : arguments_[notesDirectoryIndex + 1];

if (
  !vaultPath
  || !notesDirectory
  || arguments_.some((argument, index) => argument.startsWith("--") && !["--vault", "--notes-dir", "--apply", "--dispatch-validated"].includes(argument) && index !== vaultIndex + 1 && index !== notesDirectoryIndex + 1)
) {
  throw new Error("Usage: pnpm tsx scripts/migrate-vault-publish-set.ts --vault <vault-path> --notes-dir <relative-operations-directory> [--dispatch-validated --apply]");
}

const result = await migrateVaultPublishSet({
  apply,
  dispatchValidated,
  notesDirectory,
  vaultPath: resolve(vaultPath),
});

console.log(`发现 ${result.candidatePaths.length} 篇候选运营笔记：`);
for (const path of result.candidatePaths) console.log(`- ${path}`);
console.log(apply ? `已添加 published: true：${result.updatedPaths.length} 篇。` : "这是预览；未修改任何笔记。");
