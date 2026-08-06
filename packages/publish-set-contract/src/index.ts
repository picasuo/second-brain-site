import { randomUUID } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import { dirname, extname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import GithubSlugger from "github-slugger";
import MarkdownIt from "markdown-it";
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

export interface PublicationContractNote {
  absolutePath: string;
  body: string;
  frontmatter: Record<string, unknown>;
  noteUrl?: string;
  sourcePath: string;
}

export interface PublicationContractContentLink {
  href: string;
  kind: "resolved" | "unresolved";
  resolvedHref?: string;
  sourcePath: string;
}

export interface PublicationContractResult {
  blockingErrors: PublicationContractDiagnostic[];
  contentLinks: PublicationContractContentLink[];
  contractVersion: string;
  diagnostics: PublicationContractDiagnostic[];
  missingSlugProposals?: MissingSlugProposal[];
  notes: PublicationContractNote[];
}

export async function validatePublicationContract({
  vaultRoot: vaultRootInput,
  proposeMissingSlugs = false,
}: PublicationContractValidationInput): Promise<PublicationContractResult> {
  const vaultRoot = resolve(toPath(vaultRootInput));
  const blockingErrors: PublicationContractDiagnostic[] = [];
  const contentLinks: PublicationContractContentLink[] = [];
  const diagnostics: PublicationContractDiagnostic[] = [];
  const missingSlugProposals: MissingSlugProposal[] = [];
  const notes: PublicationContractNote[] = [];
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
      contentLinks,
      contractVersion: publicationContractVersion,
      diagnostics,
      ...(proposeMissingSlugs ? { missingSlugProposals } : {}),
      notes,
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
    const parsedNote = parseFrontmatter(source, sourcePath, blockingErrors);
    if (!parsedNote) continue;
    const { body, frontmatter } = parsedNote;
    const noteUrl = validateStableNoteSlug(frontmatter.slug, frontmatter.published === true, sourcePath, blockingErrors);
    notes.push({ absolutePath, body, frontmatter, noteUrl, sourcePath });
    if (frontmatter?.published !== true) continue;
    validatePublishedNoteDate(frontmatter.date, sourcePath, blockingErrors);
    validatePublishedNoteTags(frontmatter.tags, sourcePath, blockingErrors);
    if (frontmatter.slug === undefined && proposeMissingSlugs) {
      missingSlugProposals.push({ sourcePath, slug: `n-${randomUUID()}` });
    }
  }
  validateUniquePublishedNoteUrls(notes, blockingErrors);
  validateContentLinks(notes, diagnostics, contentLinks);

  return {
    blockingErrors,
    contentLinks,
    contractVersion: publicationContractVersion,
    diagnostics,
    ...(proposeMissingSlugs ? { missingSlugProposals } : {}),
    notes,
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
): { body: string; frontmatter: Record<string, unknown> } | undefined {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) return { body: source, frontmatter: {} };

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
    return { body: match[2], frontmatter: frontmatter as Record<string, unknown> };
  } catch {
    blockingErrors.push({
      code: "invalid-frontmatter",
      message: `Invalid Frontmatter in Published Note ${sourcePath}.`,
      sourcePath,
    });
    return undefined;
  }
}

function validateStableNoteSlug(
  value: unknown,
  published: boolean,
  sourcePath: string,
  blockingErrors: PublicationContractDiagnostic[],
): string | undefined {
  if (value === undefined) {
    if (published) {
      blockingErrors.push({
        code: "missing-published-note-slug",
        message: `Published Note ${sourcePath} requires a Stable Note Slug.`,
        sourcePath,
      });
    }
    return undefined;
  }
  if (typeof value !== "string" || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)) {
    if (published) {
      blockingErrors.push({
        code: "invalid-published-note-slug",
        message: `Published Note ${sourcePath} has an invalid slug: ${String(value)}.`,
        sourcePath,
      });
    }
    return undefined;
  }
  return `/notes/${value}/`;
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

function validateUniquePublishedNoteUrls(
  notes: PublicationContractNote[],
  blockingErrors: PublicationContractDiagnostic[],
): void {
  const notesByUrl = new Map<string, PublicationContractNote>();
  for (const note of notes) {
    if (note.frontmatter.published !== true || !note.noteUrl) continue;
    const existing = notesByUrl.get(note.noteUrl);
    if (existing) {
      blockingErrors.push({
        code: "note-url-conflict",
        message: `Note URL Conflict: ${existing.sourcePath} and ${note.sourcePath} both resolve to ${note.noteUrl}.`,
        sourcePath: note.sourcePath,
      });
      continue;
    }
    notesByUrl.set(note.noteUrl, note);
  }
}

function validateContentLinks(
  notes: PublicationContractNote[],
  diagnostics: PublicationContractDiagnostic[],
  contentLinks: PublicationContractContentLink[],
): void {
  const notesByAbsolutePath = new Map(notes.map((note) => [note.absolutePath, note]));
  const headingIdsByAbsolutePath = new Map(notes.map((note) => [note.absolutePath, headingIdsFor(note.body)]));

  for (const note of notes) {
    if (note.frontmatter.published !== true) continue;
    for (const href of markdownLinksIn(note.body)) {
      if (isExternalOrAbsoluteUrl(href)) continue;
      const { anchor, path } = splitHref(href);
      if (path === "") {
        if (anchor === "" || headingIdsByAbsolutePath.get(note.absolutePath)?.has(decodePath(anchor))) {
          contentLinks.push({ href, kind: "resolved", resolvedHref: href, sourcePath: note.sourcePath });
        } else {
          diagnostics.push(unresolvedContentLink(note.sourcePath, href));
          contentLinks.push({ href, kind: "unresolved", sourcePath: note.sourcePath });
        }
        continue;
      }
      if (!path.toLowerCase().endsWith(".md")) continue;

      const target = notesByAbsolutePath.get(resolve(dirname(note.absolutePath), decodePath(path)));
      if (!target) {
        diagnostics.push(unresolvedContentLink(note.sourcePath, href));
        contentLinks.push({ href, kind: "unresolved", sourcePath: note.sourcePath });
        continue;
      }
      if (!target.noteUrl) {
        diagnostics.push({
          code: "unresolved-content-link-missing-slug",
          message: `Unresolved Content Link in ${note.sourcePath}: target note does not have a Stable Note Slug.`,
          sourcePath: note.sourcePath,
        });
        contentLinks.push({ href, kind: "unresolved", sourcePath: note.sourcePath });
        continue;
      }
      if (anchor !== "" && !headingIdsByAbsolutePath.get(target.absolutePath)?.has(decodePath(anchor))) {
        diagnostics.push(unresolvedContentLink(note.sourcePath, href));
        contentLinks.push({ href, kind: "unresolved", sourcePath: note.sourcePath });
        continue;
      }
      contentLinks.push({
        href,
        kind: "resolved",
        resolvedHref: `${target.noteUrl}${anchor === "" ? "" : `#${anchor}`}`,
        sourcePath: note.sourcePath,
      });
    }
  }
}

function markdownLinksIn(source: string): string[] {
  const markdown = new MarkdownIt({ html: false, linkify: false, typographer: false });
  const links: string[] = [];
  for (const token of markdown.parse(source, {})) {
    if (token.type !== "inline" || !token.children) continue;
    for (const child of token.children) {
      if (child.type === "link_open") links.push(child.attrGet("href") ?? "");
    }
  }
  return links;
}

function headingIdsFor(source: string): Set<string> {
  const markdown = new MarkdownIt({ html: false, linkify: false, typographer: false });
  const slugger = new GithubSlugger();
  const ids = new Set<string>();
  const tokens = markdown.parse(source, {});
  for (let index = 0; index < tokens.length; index += 1) {
    if (tokens[index].type !== "heading_open") continue;
    const inline = tokens[index + 1];
    const text = inline.children?.map((child) => child.content).join("") ?? inline.content;
    ids.add(slugger.slug(text));
  }
  return ids;
}

function unresolvedContentLink(sourcePath: string, href: string): PublicationContractDiagnostic {
  return {
    code: "unresolved-content-link",
    message: `Unresolved Content Link in ${sourcePath}: ${href}.`,
    sourcePath,
  };
}

function isExternalOrAbsoluteUrl(href: string): boolean {
  return href.startsWith("/") || /^https?:\/\//i.test(href);
}

function splitHref(href: string): { anchor: string; path: string } {
  const hashIndex = href.indexOf("#");
  return hashIndex === -1 ? { anchor: "", path: href } : { anchor: href.slice(hashIndex + 1), path: href.slice(0, hashIndex) };
}

function decodePath(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}
