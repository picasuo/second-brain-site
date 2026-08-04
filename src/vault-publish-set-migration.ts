import { readdir, readFile, realpath, writeFile } from "node:fs/promises";
import { extname, join, relative, resolve, sep } from "node:path";
import { parse } from "yaml";

export interface VaultPublishSetMigrationInput {
  apply?: boolean;
  dispatchValidated?: boolean;
  notesDirectory: string;
  vaultPath: string;
}

export interface VaultPublishSetMigrationResult {
  candidatePaths: string[];
  updatedPaths: string[];
}

export async function migrateVaultPublishSet({
  apply = false,
  dispatchValidated = false,
  notesDirectory,
  vaultPath,
}: VaultPublishSetMigrationInput): Promise<VaultPublishSetMigrationResult> {
  if (apply && !dispatchValidated) {
    throw new Error("--apply requires --dispatch-validated so publication only follows a confirmed dispatch.");
  }

  const vaultRoot = await realpath(resolve(vaultPath));
  const notesRoot = await realpath(resolve(vaultRoot, notesDirectory));
  if (!isWithin(vaultRoot, notesRoot)) {
    throw new Error(`Notes directory must be inside the Vault: ${notesDirectory}.`);
  }

  const candidates = await markdownFilesIn(notesRoot);
  const candidatePaths = candidates.map((path) => relative(vaultRoot, path).replaceAll("\\", "/"));
  const updates = await Promise.all(candidates.map(async (path, index) => {
    const sourcePath = candidatePaths[index];
    const source = await readFile(path, "utf8");
    const update = addPublishedFrontmatter(source, sourcePath, apply);
    return { path, sourcePath, update, needsUpdate: update !== source };
  }));

  const pendingPaths = updates.filter((update) => update.needsUpdate).map((update) => update.sourcePath);
  if (apply) await Promise.all(updates.filter((update) => update.needsUpdate).map(({ path, update }) => writeFile(path, update)));

  return { candidatePaths, updatedPaths: apply ? pendingPaths : [] };
}

async function markdownFilesIn(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const paths = await Promise.all(entries.map(async (entry) => {
    const entryPath = join(directory, entry.name);
    if (entry.isDirectory()) return markdownFilesIn(entryPath);
    return entry.isFile() && extname(entry.name) === ".md" ? [entryPath] : [];
  }));
  return paths.flat().sort((left, right) => left.localeCompare(right, "en"));
}

function addPublishedFrontmatter(source: string, sourcePath: string, validateSlug: boolean): string {
  const match = source.match(/^(---)(\r?\n)([\s\S]*?)(\r?\n---\r?\n?[\s\S]*)$/);
  if (!match) throw new Error(`Candidate note requires YAML frontmatter: ${sourcePath}.`);

  const [, openingMarker, lineEnding, frontmatter, remainder] = match;
  if (validateSlug) assertValidSlug(frontmatter, sourcePath);
  const published = frontmatter.match(/^published:\s*(.*?)\s*$/m);
  if (published) {
    if (published[1] === "true") return source;
    throw new Error(`Candidate note already declares published metadata and will not be overwritten: ${sourcePath}.`);
  }
  return `${openingMarker}${lineEnding}published: true${lineEnding}${frontmatter}${remainder}`;
}

function assertValidSlug(frontmatter: string, sourcePath: string): void {
  const metadata = parse(frontmatter);
  if (metadata === null || typeof metadata !== "object" || Array.isArray(metadata)) {
    throw new Error(`Candidate note requires YAML frontmatter: ${sourcePath}.`);
  }
  const slug = (metadata as Record<string, unknown>).slug;
  if (slug !== undefined && (typeof slug !== "string" || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug))) {
    throw new Error(`Candidate note has an invalid slug and will not be published: ${sourcePath}.`);
  }
}

function isWithin(root: string, candidate: string): boolean {
  const pathFromRoot = relative(root, candidate);
  return pathFromRoot === "" || (!pathFromRoot.startsWith(`..${sep}`) && pathFromRoot !== "..");
}
