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
