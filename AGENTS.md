## Agent skills

### Issue tracker

Issues and specs live as Markdown files under `.scratch/`. See `docs/agents/issue-tracker.md`.

### Triage labels

Uses the default five canonical triage labels. See `docs/agents/triage-labels.md`.

### Domain docs

Uses a single-context layout: root `CONTEXT.md` and `docs/adr/`. See `docs/agents/domain.md`.

## Language

The user’s native language is Chinese.

- Write all user-facing progress updates, explanations, questions, and final task summaries in Simplified Chinese.
- Keep source code, identifiers, shell commands, file paths, error output, and existing project text in their original language unless translation is explicitly requested.
- When reasoning needs to be communicated, provide a concise Chinese rationale rather than exposing private chain-of-thought.

## Styles and design tokens

Before changing a visual style, inspect the design tokens in the `:root` block of `src/layouts/BaseLayout.astro`.

- Reuse existing semantic tokens before introducing a new value. Common groups include `--font-*`, `--accent-*`, `--surface-*`, `--effect-*`, and `--window-control-*`.
- Do not introduce raw CSS color values (`#...`, `rgb(...)`, `rgba(...)`, `hsl(...)`, or `hsla(...)`) outside a `:root` token declaration. Add a semantic root token first when no suitable token exists.
- Name tokens for their visual role, not their literal value. Use names such as `--effect-popover-shadow`; do not use names such as `--green-20` or `--black-alpha-75`.
- Do not create component-local aliases that merely rename an existing root token. Component-local tokens are appropriate only for a genuinely component-specific state or behaviour.
- Use `--font-sans` and `--font-mono` instead of hard-coding font stacks in components.
- Use the shared spacing scale (`--space-1` through `--space-7`) and radius scale (`--radius-sm`, `--radius-md`, `--radius-lg`, and `--radius-pill`) for repeated layout values or shared visual roles. One-off optical adjustments, breakpoint-specific geometry, and calculated values may remain local when a token would not improve reuse.
- Preserve existing visual output unless a visual change is explicitly requested. When extracting a token, keep the original computed value unchanged.

After style changes, run `pnpm lint:styles`, `pnpm typecheck`, `pnpm test`, and `git diff --check`. In the final summary, state which tokens were reused or added and whether any visual change was intentional.
