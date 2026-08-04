import { mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { basename, dirname, extname, join, relative, resolve } from "node:path";
import { spawn } from "node:child_process";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const generatedNotesPath = join(projectRoot, "src", "generated", "published-notes.ts");

export interface PublishedSiteBuildInput {
  vaultRevisionPath: URL | string;
  outputDirectory: string;
}

type PublishedNote = {
  title: string;
  date: string;
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
    const { frontmatter, body } = splitFrontmatter(source);
    if (frontmatter.published !== "true") return undefined;

    const title = frontmatter.title ?? basename(notePath, extname(notePath));
    const date = frontmatter.date ?? "";
    const relativePath = relative(vaultRoot, notePath).replace(/\.md$/, "");
    const noteUrl = `/notes/${relativePath.split("/").map(slugify).join("/")}/`;
    return { title, date, noteUrl, renderedContent: renderMarkdown(body) };
  }));

  return notes.filter((note): note is PublishedNote => note !== undefined);
}

async function markdownFilesIn(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const paths = await Promise.all(entries.map(async (entry) => {
    const entryPath = join(directory, entry.name);
    if (entry.isDirectory()) return markdownFilesIn(entryPath);
    return entry.isFile() && extname(entry.name) === ".md" ? [entryPath] : [];
  }));
  return paths.flat();
}

function splitFrontmatter(source: string): { frontmatter: Record<string, string>; body: string } {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) return { frontmatter: {}, body: source };
  const frontmatter = Object.fromEntries(match[1].split(/\r?\n/).flatMap((line) => {
    const separator = line.indexOf(":");
    return separator === -1 ? [] : [[line.slice(0, separator).trim(), line.slice(separator + 1).trim().replace(/^['\"]|['\"]$/g, "")]];
  }));
  return { frontmatter, body: match[2] };
}

function slugify(segment: string): string {
  return segment.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "note";
}

function renderMarkdown(markdown: string): string {
  return markdown.trim().split(/\r?\n\s*\r?\n/).filter(Boolean).map((paragraph) => `<p>${escapeHtml(paragraph.replace(/\r?\n/g, " "))}</p>`).join("\n");
}

function escapeHtml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\"/g, "&quot;").replace(/'/g, "&#039;");
}

function renderGeneratedNotesModule(notes: PublishedNote[]): string {
  return `export type PublishedNote = { title: string; date: string; noteUrl: string; renderedContent: string };\n\nexport const publishedNotes: PublishedNote[] = ${JSON.stringify(notes, null, 2)};\n`;
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
