import { readdir, readFile } from "node:fs/promises";
import { extname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = resolve(fileURLToPath(new URL("..", import.meta.url)));
const sourceDirectory = join(repositoryRoot, "src");
const stylesheetExtensions = new Set([".astro", ".css", ".scss", ".sass", ".less"]);
const rawColorPattern = /#[0-9a-f]{3,8}\b|(?:rgb|hsl)a?\([^)]*\)/giu;

type StyleBlock = {
  css: string;
  startOffset: number;
};

async function collectStylesheetFiles(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const nestedFiles = await Promise.all(entries.map(async (entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return collectStylesheetFiles(path);
    return stylesheetExtensions.has(extname(entry.name)) ? [path] : [];
  }));

  return nestedFiles.flat();
}

function extractStyleBlocks(source: string, extension: string): StyleBlock[] {
  if (extension !== ".astro") return [{ css: source, startOffset: 0 }];

  const blocks: StyleBlock[] = [];
  const styleTagPattern = /<style\b[^>]*>([\s\S]*?)<\/style>/giu;
  let match: RegExpExecArray | null;
  while ((match = styleTagPattern.exec(source)) !== null) {
    const css = match[1] ?? "";
    blocks.push({ css, startOffset: match.index + match[0].indexOf(css) });
  }
  return blocks;
}

function rootDeclarationRanges(css: string): Array<[number, number]> {
  const ranges: Array<[number, number]> = [];
  const scopes: Array<{ isRoot: boolean; start: number }> = [];
  let ruleStart = 0;

  for (let index = 0; index < css.length; index += 1) {
    if (css[index] === "{") {
      scopes.push({ isRoot: /:root\b/u.test(css.slice(ruleStart, index)), start: index + 1 });
      ruleStart = index + 1;
    } else if (css[index] === "}") {
      const scope = scopes.pop();
      if (scope?.isRoot) ranges.push([scope.start, index]);
      ruleStart = index + 1;
    }
  }

  return ranges;
}

function isInRootDeclaration(index: number, ranges: Array<[number, number]>): boolean {
  return ranges.some(([start, end]) => index >= start && index < end);
}

function lineNumber(source: string, offset: number): number {
  return source.slice(0, offset).split("\n").length;
}

const violations: string[] = [];
for (const file of await collectStylesheetFiles(sourceDirectory)) {
  const source = await readFile(file, "utf8");
  for (const block of extractStyleBlocks(source, extname(file))) {
    const cssWithoutComments = block.css.replace(/\/\*[\s\S]*?\*\//gu, (comment) => comment.replace(/[^\n]/gu, " "));
    const rootRanges = rootDeclarationRanges(cssWithoutComments);
    rawColorPattern.lastIndex = 0;

    let color: RegExpExecArray | null;
    while ((color = rawColorPattern.exec(cssWithoutComments)) !== null) {
      if (isInRootDeclaration(color.index, rootRanges)) continue;
      const offset = block.startOffset + color.index;
      violations.push(`${relative(repositoryRoot, file)}:${lineNumber(source, offset)} uses raw color ${color[0]}`);
    }
  }
}

if (violations.length > 0) {
  console.error(`Style token lint failed: found ${violations.length} raw color ${violations.length === 1 ? "value" : "values"}.`);
  console.error("Define a semantic token in :root and reference it with var(...):");
  for (const violation of violations) console.error(`- ${violation}`);
  process.exitCode = 1;
} else {
  console.log("Style token lint passed — tokens are tidy and the CSS gremlins found nothing to nibble. ✨");
}
