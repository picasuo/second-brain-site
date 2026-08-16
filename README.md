# Second Brain Site

Build a static Published Site from an explicit Vault Revision directory:

```sh
pnpm install
pnpm build -- --vault path/to/vault-revision --out path/to/site-output
```

## Vault Revision dispatch

`.github/workflows/publish-vault-revision.yml` accepts the `publish-vault-revision`
repository dispatch event with this payload:

```json
{
  "vault_sha": "<full-40-character-vault-commit-sha>",
  "contract_version": "<exact-publication-contract-package-version>"
}
```

Before enabling the workflow, set the Site Repository GitHub Actions variable
`VAULT_REPOSITORY` to the Vault's `owner/repository` name and set
`VAULT_READ_TOKEN` to a token that can read that Vault. The workflow checks out
the supplied `vault_sha` into `.vault-revision` only after the declared
`contract_version` matches the Site's exact installed Contract Package version. It verifies the
checked-out commit, records both values in the run summary and build diagnostics,
and includes `publication-receipt.json` with both values in the Published Site
artifact named with that SHA.

All dispatched builds share the `published-site-build` concurrency group and are
queued without cancelling an in-progress build. This deliberately serializes
releases so a future shared deployment target cannot receive mixed Vault
Revisions.

## GitHub Pages deployment

Every successful `publish-vault-revision` dispatch builds the supplied Vault
Revision, uploads an artifact named `published-site-<vault-sha>`, then deploys
that exact artifact to GitHub Pages. In the Site Repository's **Settings →
Pages**, select **GitHub Actions** as the publishing source.

The intended custom domain is `picasuo.qzz.io`. Set that value in the Site
Repository's **Settings → Pages → Custom domain**, then create a Cloudflare DNS
`CNAME` record for `picasuo` pointing directly to `picasuo.github.io` (without
`second-brain-site`). Verify the domain in GitHub before adding the record and
enable HTTPS after GitHub finishes issuing its certificate. Vault Repository
settings and secrets remain unrelated to Pages hosting.

The Vault-side dispatch template and credential ownership checklist are documented
in [docs/vault-publication.md](docs/vault-publication.md).

Run the style-token lint, build acceptance test, and type checker:

```sh
pnpm lint:styles
pnpm test
pnpm typecheck
```

## Local Vault preview

Generate local development data from a Vault Revision without hand-editing
`src/generated/published-notes.ts`:

```sh
pnpm prepare-dev -- --vault path/to/vault-revision
pnpm dev
```

Or generate the data and start Astro dev in one command:

```sh
pnpm dev:vault -- --vault path/to/vault-revision
```

To allow other devices on the local network to access the preview, bind the
server to all interfaces:

```sh
pnpm dev:vault -- --vault path/to/vault-revision --host 0.0.0.0
```
