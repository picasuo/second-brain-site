import { randomUUID } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import { extname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { parse } from "yaml";

export const publicationContractVersion = "0.1.0";

export interface PublicationContractValidationInput {
  vaultRoot: URL | string;
  proposeMissingSlugs?: boolean;
}

export interface PublicationContractDiagnostic {
  code: string;
  message: string;
  sourcePath: string;
}

export interface MissingSlugProposal {
  slug: string;
  sourcePath: string;
}

export interface PublicationContractResult {
  blockingErrors: PublicationContractDiagnostic[];
  contractVersion: string;
  diagnostics: PublicationContractDiagnostic[];
  missingSlugProposals?: MissingSlugProposal[];
}

export async function validatePublicationContract({
  vaultRoot: vaultRootInput,
  proposeMissingSlugs = false,
}: PublicationContractValidationInput): Promise<PublicationContractResult> {
  const vaultRoot = resolve(toPath(vaultRootInput));
  const blockingErrors: PublicationContractDiagnostic[] = [];
  const diagnostics: PublicationContractDiagnostic[] = [];
  const missingSlugProposals: MissingSlugProposal[] = [];
  let notePaths: string[];
  try {
    notePaths = await markdownFilesIn(vaultRoot);
  } catch {
    blockingErrors.push({
      code: "unreadable-vault-root",
      message: "Vault root cannot be read.",
      sourcePath: ".",
    });
    return {
      blockingErrors,
      contractVersion: publicationContractVersion,
      diagnostics,
      ...(proposeMissingSlugs ? { missingSlugProposals } : {}),
    };
  }

  for (const absolutePath of notePaths) {
    const sourcePath = relative(vaultRoot, absolutePath).replaceAll("\\", "/");
    let source: string;
    try {
      source = await readFile(absolutePath, "utf8");
    } catch {
      blockingErrors.push({
        code: "unreadable-vault-note",
        message: `Vault note ${sourcePath} cannot be read.`,
        sourcePath,
      });
      continue;
    }
    const frontmatter = parseFrontmatter(source, sourcePath, blockingErrors);
    if (frontmatter?.published !== true) continue;
    validatePublishedNoteDate(frontmatter.date, sourcePath, blockingErrors);
    validatePublishedNoteTags(frontmatter.tags, sourcePath, blockingErrors);
    if (frontmatter.slug === undefined && proposeMissingSlugs) {
      missingSlugProposals.push({ sourcePath, slug: `n-${randomUUID()}` });
    }
  }

  return {
    blockingErrors,
    contractVersion: publicationContractVersion,
    diagnostics,
    ...(proposeMissingSlugs ? { missingSlugProposals } : {}),
  };
}

function toPath(vaultRoot: URL | string): string {
  return vaultRoot instanceof URL ? fileURLToPath(vaultRoot) : vaultRoot;
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

function parseFrontmatter(
  source: string,
  sourcePath: string,
  blockingErrors: PublicationContractDiagnostic[],
): Record<string, unknown> | undefined {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) return {};

  try {
    const frontmatter = parse(match[1]);
    if (frontmatter === null || typeof frontmatter !== "object" || Array.isArray(frontmatter)) {
      blockingErrors.push({
        code: "invalid-frontmatter",
        message: `Invalid Frontmatter in Published Note ${sourcePath}.`,
        sourcePath,
      });
      return undefined;
    }
    return frontmatter as Record<string, unknown>;
  } catch {
    blockingErrors.push({
      code: "invalid-frontmatter",
      message: `Invalid Frontmatter in Published Note ${sourcePath}.`,
      sourcePath,
    });
    return undefined;
  }
}

function validatePublishedNoteDate(
  value: unknown,
  sourcePath: string,
  blockingErrors: PublicationContractDiagnostic[],
): void {
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split("-").map(Number);
    const candidate = new Date(Date.UTC(year, month - 1, day));
    if (candidate.getUTCFullYear() === year && candidate.getUTCMonth() === month - 1 && candidate.getUTCDate() === day) return;
  }
  blockingErrors.push({
    code: "invalid-published-note-date",
    message: `Published Note ${sourcePath} requires a valid date in YYYY-MM-DD format.`,
    sourcePath,
  });
}

function validatePublishedNoteTags(
  value: unknown,
  sourcePath: string,
  blockingErrors: PublicationContractDiagnostic[],
): void {
  if (value === undefined || (Array.isArray(value) && value.every((tag) => typeof tag === "string"))) return;
  blockingErrors.push({
    code: "invalid-published-note-tags",
    message: `Published Note ${sourcePath} must provide tags as a YAML list of strings.`,
    sourcePath,
  });
}
