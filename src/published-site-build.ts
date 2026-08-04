import { mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { basename, dirname, extname, join, relative, resolve } from "node:path";
import { spawn } from "node:child_process";
import { parse } from "yaml";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const generatedNotesPath = join(projectRoot, "src", "generated", "published-notes.ts");

export interface PublishedSiteBuildInput {
  vaultRevisionPath: URL | string;
  outputDirectory: string;
}

type PublishedNote = {
  sourcePath: string;
  title: string;
  date: string;
  tags: string[];
  noteUrl: string;
  renderedContent: string;
};

export async function buildPublishedSite({ vaultRevisionPath, outputDirectory }: PublishedSiteBuildInput): Promise<void> {
  const vaultRoot = resolve(toPath(vaultRevisionPath));
  const publishedNotes = await readPublishedNotes(vaultRoot);
  const previousGeneratedNotes = await readFile(generatedNotesPath, "utf8");

  await writeFile(generatedNotesPath, renderGeneratedNotesModule(publishedNotes));
  try {
    await rm(outputDirectory, { recursive: true, force: true });
    await mkdir(outputDirectory, { recursive: true });
    await runAstroBuild(outputDirectory);
  } finally {
    await writeFile(generatedNotesPath, previousGeneratedNotes);
  }
}

function toPath(vaultRevisionPath: URL | string): string {
  return vaultRevisionPath instanceof URL ? fileURLToPath(vaultRevisionPath) : vaultRevisionPath;
}

async function readPublishedNotes(vaultRoot: string): Promise<PublishedNote[]> {
  const notePaths = await markdownFilesIn(vaultRoot);
  const notes = await Promise.all(notePaths.map(async (notePath) => {
    const source = await readFile(notePath, "utf8");
    const { frontmatter, body } = parseFrontmatter(source, notePath);
    if (frontmatter.published !== true) return undefined;

    const sourcePath = relative(vaultRoot, notePath).replaceAll("\\", "/");
    const title = stringValue(frontmatter.title) ?? basename(notePath, extname(notePath));
    const date = validDate(frontmatter.date, sourcePath);
    const tags = canonicalTags(frontmatter.tags, sourcePath);
    const noteUrl = noteUrlFor(frontmatter.slug, sourcePath);
    return { sourcePath, title, date, tags, noteUrl, renderedContent: renderMarkdown(body) };
  }));

  const publishedNotes = notes.filter((note): note is PublishedNote => note !== undefined);
  assertUniqueNoteUrls(publishedNotes);
  return publishedNotes.sort((left, right) => right.date.localeCompare(left.date) || left.title.localeCompare(right.title, "zh-CN"));
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

function noteUrlFor(slug: unknown, sourcePath: string): string {
  if (slug === undefined) {
    const pathWithoutExtension = sourcePath.replace(/\.md$/, "");
    return `/notes/${pathWithoutExtension.split("/").map(encodeURIComponent).join("/")}/`;
  }
  if (typeof slug !== "string" || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    throw new Error(`Published Note ${sourcePath} has an invalid slug: ${String(slug)}.`);
  }
  return `/notes/${slug}/`;
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

function renderMarkdown(markdown: string): string {
  return markdown.trim().split(/\r?\n\s*\r?\n/).filter(Boolean).map((paragraph) => `<p>${escapeHtml(paragraph.replace(/\r?\n/g, " "))}</p>`).join("\n");
}

function escapeHtml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\"/g, "&quot;").replace(/'/g, "&#039;");
}

function renderGeneratedNotesModule(notes: PublishedNote[]): string {
  const publicNotes = notes.map(({ sourcePath: _sourcePath, ...note }) => note);
  return `export type PublishedNote = { title: string; date: string; tags: string[]; noteUrl: string; renderedContent: string };\n\nexport const publishedNotes: PublishedNote[] = ${JSON.stringify(publicNotes, null, 2)};\n`;
}

function runAstroBuild(outputDirectory: string): Promise<void> {
  return new Promise((resolveBuild, rejectBuild) => {
    const astroCli = join(projectRoot, "node_modules", "astro", "astro.js");
    const child = spawn(process.execPath, [astroCli, "build"], {
      cwd: projectRoot,
      env: {
        ...process.env,
        ASTRO_TELEMETRY_DISABLED: "1",
        PUBLISHED_SITE_OUT_DIR: outputDirectory,
      },
      stdio: "inherit",
    });
    child.once("error", rejectBuild);
    child.once("exit", (code) => code === 0 ? resolveBuild() : rejectBuild(new Error(`Astro build failed with exit code ${code}`)));
  });
}
