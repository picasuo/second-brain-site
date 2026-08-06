# Stable Published Note Identity and Release Preflight

Status: resolved

## Problem Statement

The former Note URL fallback encoded a Vault-relative file path and then passed that encoded value to Astro as a static route parameter. The resulting GitHub Pages artifact contained literal percent-encoded directories, while ordinary HTTP requests resolve to decoded paths; the affected Published Note returned 404. More broadly, a public URL must not depend on a mutable Vault location or be created randomly during a build.

The private Vault must validate a candidate release before tagging it, while the public Site Repository must independently enforce the same publication rules on the exact dispatched Vault Revision. The two repositories must not copy their validation implementation, and the Site Repository must never write Vault content.

## Decision

- Every Published Note requires a valid Frontmatter `slug`; its Note URL is always `/notes/<slug>/`. Path-derived Note URLs are removed.
- Existing valid, human-authored slugs remain valid. When an explicit Vault repair command encounters a missing slug, it proposes and writes one stable value in the form `n-<lowercase-uuid>` exactly once. It never changes an existing slug.
- A private, unpublished note with a valid slug may remain the target of an Unpublished Link and return 404. A Markdown link to a note without a slug is an Unresolved Content Link: it is non-blocking, reported, rendered as text, and does not expose a Vault path.
- The public Site Repository becomes a pnpm workspace containing `@picasuo/publish-set-contract`. That package has no credentials, Vault content, network calls, deployment code, or write operations. It is published publicly to npm.
- The package exposes a small interface that reads a Vault root and returns structured blocking errors, non-blocking diagnostics, and optional missing-slug proposals. The package does not apply proposals.
- The private Vault's Release Preflight pins an exact package version. Its repository dispatch includes both the immutable `vault_sha` and `contract_version`.
- The Site workflow checks the declared `contract_version` against the workspace package version before it builds. A mismatch is a blocking receipt error. A successful artifact and job summary record both values.

## Release Flow

```text
Vault make release
  → run exact Publication Contract version
  → blocking diagnostics stop the release
  → optional --write-missing-slugs applies only proposed missing values
  → rerun validation; author reviews, commits and tags
  → dispatch { vault_sha, contract_version }

Site Repository
  → validate receipt and contract version
  → check out the supplied Vault Revision
  → rerun the same Publication Contract version
  → build, upload named artifact and deploy only on success
```

## Validation Rules

Blocking errors include a Published Note missing/invalid `slug` or `date`, duplicate Note URL, invalid Published Note Metadata, Unresolved Attachment, Vault-local Attachment violation, and a dispatch contract-version mismatch.

Unresolved Content Link remains non-blocking. It must identify the source note and target; it renders its text without a clickable URL. External links remain unverified. No release operation auto-fills dates, rewrites invalid/duplicate slugs, changes `published`, or repairs attachments/links.

## Migration

1. Add persistent slugs to every current Published Note, including the v0.0.5 Oracle multi-node note that exposed the path-fallback defect.
2. Add a slug to any unpublished note that a Published Note must retain as an Unpublished Link target; otherwise accept its non-blocking unresolved diagnostic.
3. Release a new Vault tag only after the Release Preflight passes, then verify the deployed URLs and artifact evidence.

## Non-goals

- Moving the private Vault into the public Site Repository.
- A Git submodule or copied validation scripts.
- Site Repository writes to Vault, implicit Frontmatter changes, or release tags created by the Site Repository.
- Redirects for path-derived or changed Note URLs.
