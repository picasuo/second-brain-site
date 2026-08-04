import { copyFile, mkdir, readdir, readFile, realpath, rm, stat, writeFile } from "node:fs/promises";
import { spawn } from "node:child_process";
import { basename, dirname, extname, isAbsolute, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import GithubSlugger from "github-slugger";
import MarkdownIt from "markdown-it";
import { parse } from "yaml";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const generatedNotesPath = join(projectRoot, "src", "generated", "published-notes.ts");

export interface PublishedSiteBuildInput {
  vaultRevisionPath: URL | string;
  outputDirectory: string;
  vaultSha?: string;
}

export interface PublishedSiteBuildResult {
  diagnostics: string[];
}

type TableOfContentsItem = {
  depth: 2 | 3;
  id: string;
  text: string;
};

type VaultNote = {
  absolutePath: string;
  body: string;
  frontmatter: Record<string, unknown>;
  headingIds: Set<string>;
  noteUrl: string;
  sourcePath: string;
};

type PublishedNote = VaultNote & {
  date: string;
  renderedContent: string;
  tableOfContents: TableOfContentsItem[];
  tags: string[];
  title: string;
};

type Attachment = {
  outputRelativePath: string;
  resolvedPath: string;
  sourcePath: string;
  target: string;
};

type RenderingContext = {
  attachments: Map<string, Attachment>;
  diagnostics: string[];
  noteByAbsolutePath: Map<string, VaultNote>;
  vaultRoot: string;
  vaultRootRealPath: string;
};

export async function buildPublishedSite({ vaultRevisionPath, outputDirectory, vaultSha }: PublishedSiteBuildInput): Promise<PublishedSiteBuildResult> {
  const vaultRoot = resolve(toPath(vaultRevisionPath));
  const vaultRootRealPath = await realpath(vaultRoot);
  const diagnostics = vaultSha === undefined ? [] : [`Vault Revision: ${vaultSha}`];
  const vaultNotes = await readVaultNotes(vaultRoot);
  const publishedNotes = toPublishedNotes(vaultNotes);
  assertUniqueNoteUrls(publishedNotes);
  publishedNotes.sort((left, right) => right.date.localeCompare(left.date) || left.title.localeCompare(right.title, "zh-CN"));

  const renderingContext: RenderingContext = {
    attachments: new Map(),
    diagnostics,
    noteByAbsolutePath: new Map(vaultNotes.map((note) => [note.absolutePath, note])),
    vaultRoot,
    vaultRootRealPath,
  };
  for (const note of publishedNotes) {
    const rendered = await renderPublishedNote(note, renderingContext);
    note.renderedContent = rendered.html;
    note.tableOfContents = rendered.tableOfContents;
  }

  const previousGeneratedNotes = await readFile(generatedNotesPath, "utf8");
  await writeFile(generatedNotesPath, renderGeneratedNotesModule(publishedNotes));
  try {
    await rm(outputDirectory, { recursive: true, force: true });
    await mkdir(outputDirectory, { recursive: true });
    await runAstroBuild(outputDirectory);
    await copyAttachments(outputDirectory, renderingContext.attachments.values());
  } finally {
    await writeFile(generatedNotesPath, previousGeneratedNotes);
  }

  return { diagnostics };
}

function toPath(vaultRevisionPath: URL | string): string {
  return vaultRevisionPath instanceof URL ? fileURLToPath(vaultRevisionPath) : vaultRevisionPath;
}

async function readVaultNotes(vaultRoot: string): Promise<VaultNote[]> {
  const notePaths = await markdownFilesIn(vaultRoot);
  return Promise.all(notePaths.map(async (absolutePath) => {
    const source = await readFile(absolutePath, "utf8");
    const { frontmatter, body } = parseFrontmatter(source, absolutePath);
    const sourcePath = relative(vaultRoot, absolutePath).replaceAll("\\", "/");
    return {
      absolutePath,
      body,
      frontmatter,
      headingIds: headingIdsFor(body),
      noteUrl: noteUrlFor(frontmatter.slug, sourcePath, frontmatter.published === true),
      sourcePath,
    };
  }));
}

function toPublishedNotes(vaultNotes: VaultNote[]): PublishedNote[] {
  return vaultNotes.flatMap((note) => {
    if (note.frontmatter.published !== true) return [];
    return [{
      ...note,
      date: validDate(note.frontmatter.date, note.sourcePath),
      renderedContent: "",
      tableOfContents: [],
      tags: canonicalTags(note.frontmatter.tags, note.sourcePath),
      title: stringValue(note.frontmatter.title) ?? basename(note.sourcePath, extname(note.sourcePath)),
    }];
  });
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

function parseFrontmatter(source: string, notePath: string): { frontmatter: Record<string, unknown>; body: string } {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) return { frontmatter: {}, body: source };
  const frontmatter = parse(match[1]);
  if (frontmatter === null || typeof frontmatter !== "object" || Array.isArray(frontmatter)) {
    throw new Error(`Invalid Frontmatter in Published Note ${notePath}.`);
  }
  return { frontmatter: frontmatter as Record<string, unknown>, body: match[2] };
}

function stringValue(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() !== "" ? value : undefined;
}

function validDate(value: unknown, sourcePath: string): string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new Error(`Published Note ${sourcePath} requires a valid date in YYYY-MM-DD format.`);
  }
  const [year, month, day] = value.split("-").map(Number);
  const candidate = new Date(Date.UTC(year, month - 1, day));
  if (candidate.getUTCFullYear() !== year || candidate.getUTCMonth() !== month - 1 || candidate.getUTCDate() !== day) {
    throw new Error(`Published Note ${sourcePath} requires a valid date in YYYY-MM-DD format.`);
  }
  return value;
}

function canonicalTags(value: unknown, sourcePath: string): string[] {
  if (value === undefined) return [];
  if (!Array.isArray(value) || value.some((tag) => typeof tag !== "string")) {
    throw new Error(`Published Note ${sourcePath} must provide tags as a YAML list of strings.`);
  }
  const tags = new Map<string, string>();
  for (const tag of value) {
    const canonical = tag.normalize("NFKC").trim().toLowerCase();
    if (canonical) tags.set(canonical, canonical);
  }
  return [...tags.values()];
}

function noteUrlFor(slug: unknown, sourcePath: string, validateSlug: boolean): string {
  if (slug === undefined || (!validateSlug && (typeof slug !== "string" || !validSlug(slug)))) {
    const pathWithoutExtension = sourcePath.replace(/\.md$/, "");
    return `/notes/${pathWithoutExtension.split("/").map(encodeURIComponent).join("/")}/`;
  }
  if (typeof slug !== "string" || !validSlug(slug)) {
    throw new Error(`Published Note ${sourcePath} has an invalid slug: ${String(slug)}.`);
  }
  return `/notes/${slug}/`;
}

function validSlug(slug: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
}

function assertUniqueNoteUrls(notes: PublishedNote[]): void {
  const notesByUrl = new Map<string, PublishedNote>();
  for (const note of notes) {
    const existing = notesByUrl.get(note.noteUrl);
    if (existing) {
      throw new Error(`Note URL Conflict: ${existing.sourcePath} and ${note.sourcePath} both resolve to ${note.noteUrl}.`);
    }
    notesByUrl.set(note.noteUrl, note);
  }
}

function createMarkdownRenderer(): MarkdownIt {
  const markdown = new MarkdownIt({ html: false, linkify: false, typographer: false });
  markdown.renderer.rules.link_open = (tokens, index, options, _environment, renderer) => (
    tokens[index].meta?.unresolved ? "<span>" : renderer.renderToken(tokens, index, options)
  );
  markdown.renderer.rules.link_close = (tokens, index, options, _environment, renderer) => (
    tokens[index].meta?.unresolved ? "</span>" : renderer.renderToken(tokens, index, options)
  );
  return markdown;
}

function headingIdsFor(markdownSource: string): Set<string> {
  const markdown = createMarkdownRenderer();
  const tokens = markdown.parse(markdownSource, {});
  return new Set(assignHeadingIds(tokens).map((heading) => heading.id));
}

async function renderPublishedNote(note: PublishedNote, context: RenderingContext): Promise<{ html: string; tableOfContents: TableOfContentsItem[] }> {
  const markdown = createMarkdownRenderer();
  const tokens = markdown.parse(note.body, {});
  const headings = assignHeadingIds(tokens);
  await transformMarkdownTokens(tokens, note, context);
  return {
    html: markdown.renderer.render(tokens, markdown.options, {}),
    tableOfContents: headings.filter((heading): heading is TableOfContentsItem => heading.depth === 2 || heading.depth === 3),
  };
}

function assignHeadingIds(tokens: ReturnType<MarkdownIt["parse"]>): Array<{ depth: number; id: string; text: string }> {
  const slugger = new GithubSlugger();
  const headings: Array<{ depth: number; id: string; text: string }> = [];
  for (let index = 0; index < tokens.length; index += 1) {
    const token = tokens[index];
    if (token.type !== "heading_open") continue;
    const inline = tokens[index + 1];
    const text = inline.children?.map((child) => child.content).join("") ?? inline.content;
    const depth = Number(token.tag.slice(1));
    const id = slugger.slug(text);
    token.attrSet("id", id);
    headings.push({ depth, id, text });
  }
  return headings;
}

async function transformMarkdownTokens(tokens: ReturnType<MarkdownIt["parse"]>, note: PublishedNote, context: RenderingContext): Promise<void> {
  for (const token of tokens) {
    if (token.type === "inline" && token.children) {
      await transformInlineTokens(token.children, note, context);
    }
  }
}

async function transformInlineTokens(tokens: NonNullable<ReturnType<MarkdownIt["parse"]>[number]["children"]>, note: PublishedNote, context: RenderingContext): Promise<void> {
  for (let index = 0; index < tokens.length; index += 1) {
    const token = tokens[index];
    if (token.type === "link_open") {
      const href = token.attrGet("href") ?? "";
      const result = await resolveLink(href, note, context);
      if (result.kind === "unresolved") {
        token.meta = { unresolved: true };
        const closingIndex = tokens.findIndex((candidate, candidateIndex) => candidateIndex > index && candidate.type === "link_close");
        if (closingIndex !== -1) tokens[closingIndex].meta = { unresolved: true };
      } else {
        token.attrSet("href", result.href);
      }
    }
    if (token.type === "image") {
      const source = token.attrGet("src") ?? "";
      token.attrSet("src", await resolveAttachmentUrl(source, note, context));
    }
  }
}

async function resolveLink(href: string, note: PublishedNote, context: RenderingContext): Promise<{ href: string; kind: "resolved" } | { kind: "unresolved" }> {
  if (isExternalOrAbsoluteUrl(href)) return { href, kind: "resolved" };
  const { anchor, path } = splitHref(href);
  if (path === "") {
    if (anchor === "" || note.headingIds.has(decodePath(anchor))) return { href, kind: "resolved" };
    context.diagnostics.push(`Unresolved Content Link in ${note.sourcePath}: ${href}.`);
    return { kind: "unresolved" };
  }
  if (path.toLowerCase().endsWith(".md")) {
    const target = context.noteByAbsolutePath.get(resolve(dirname(note.absolutePath), decodePath(path)));
    if (!target || (anchor !== "" && !target.headingIds.has(decodePath(anchor)))) {
      context.diagnostics.push(`Unresolved Content Link in ${note.sourcePath}: ${href}.`);
      return { kind: "unresolved" };
    }
    return { href: `${target.noteUrl}${anchor === "" ? "" : `#${anchor}`}`, kind: "resolved" };
  }
  return { href: await resolveAttachmentUrl(href, note, context), kind: "resolved" };
}

async function resolveAttachmentUrl(href: string, note: PublishedNote, context: RenderingContext): Promise<string> {
  if (isExternalOrAbsoluteUrl(href)) return href;
  const { anchor, path } = splitHref(href);
  const decodedPath = decodePath(path);
  const candidatePath = resolve(dirname(note.absolutePath), decodedPath);
  const outputRelativePath = relative(context.vaultRoot, candidatePath);
  if (!isVaultLocal(outputRelativePath)) {
    throw new Error(`Vault-local Attachment violation in ${note.sourcePath}: ${href}.`);
  }

  let resolvedPath: string;
  try {
    resolvedPath = await realpath(candidatePath);
  } catch {
    throw new Error(`Unresolved Attachment in ${note.sourcePath}: ${href}.`);
  }
  if (!isVaultLocal(relative(context.vaultRootRealPath, resolvedPath))) {
    throw new Error(`Vault-local Attachment violation in ${note.sourcePath}: ${href}.`);
  }
  if (!(await stat(resolvedPath)).isFile()) {
    throw new Error(`Unresolved Attachment in ${note.sourcePath}: ${href}.`);
  }

  const normalizedOutputPath = outputRelativePath.replaceAll("\\", "/");
  context.attachments.set(normalizedOutputPath, { outputRelativePath: normalizedOutputPath, resolvedPath, sourcePath: note.sourcePath, target: href });
  const attachmentUrl = `/${normalizedOutputPath.split("/").map(encodeURIComponent).join("/")}`;
  return `${attachmentUrl}${anchor === "" ? "" : `#${anchor}`}`;
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

function isVaultLocal(path: string): boolean {
  return path !== "" && path !== ".." && !path.startsWith(`..${sep}`) && !isAbsolute(path);
}

async function copyAttachments(outputDirectory: string, attachments: Iterable<Attachment>): Promise<void> {
  for (const attachment of attachments) {
    const outputPath = join(outputDirectory, attachment.outputRelativePath);
    try {
      await stat(outputPath).then(() => {
        throw new Error("Attachment output conflicts with a static route.");
      }).catch((error: unknown) => {
        if (error instanceof Error && "code" in error && error.code === "ENOENT") return;
        throw error;
      });
      await mkdir(dirname(outputPath), { recursive: true });
      await copyFile(attachment.resolvedPath, outputPath);
    } catch {
      throw new Error(`Unresolved Attachment in ${attachment.sourcePath}: ${attachment.target}.`);
    }
  }
}

function renderGeneratedNotesModule(notes: PublishedNote[]): string {
  const publicNotes = notes.map(({ absolutePath: _absolutePath, body: _body, frontmatter: _frontmatter, headingIds: _headingIds, sourcePath: _sourcePath, ...note }) => note);
  return `export type TableOfContentsItem = { depth: 2 | 3; id: string; text: string };\n\nexport type PublishedNote = { title: string; date: string; tags: string[]; noteUrl: string; renderedContent: string; tableOfContents: TableOfContentsItem[] };\n\nexport const publishedNotes: PublishedNote[] = ${JSON.stringify(publicNotes, null, 2)};\n`;
}

function runAstroBuild(outputDirectory: string): Promise<void> {
  return new Promise((resolveBuild, rejectBuild) => {
    const astroCli = join(projectRoot, "node_modules", "astro", "astro.js");
    const child = spawn(process.execPath, [astroCli, "build"], {
      cwd: projectRoot,
      env: { ...process.env, ASTRO_TELEMETRY_DISABLED: "1", PUBLISHED_SITE_OUT_DIR: outputDirectory },
      stdio: "inherit",
    });
    child.once("error", rejectBuild);
    child.once("exit", (code) => code === 0 ? resolveBuild() : rejectBuild(new Error(`Astro build failed with exit code ${code}`)));
  });
}
