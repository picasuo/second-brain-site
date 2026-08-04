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
  "vault_sha": "<full-40-character-vault-commit-sha>"
}
```

Before enabling the workflow, set the Site Repository GitHub Actions variable
`VAULT_REPOSITORY` to the Vault's `owner/repository` name and set
`VAULT_READ_TOKEN` to a token that can read that Vault. The workflow checks out
the supplied `vault_sha` into `.vault-revision`, verifies the checked-out commit,
prints the Vault Revision in the run summary and build diagnostics, and names the
Published Site artifact with that SHA.

All dispatched builds share the `published-site-build` concurrency group and are
queued without cancelling an in-progress build. This deliberately serializes
releases so a future shared deployment target cannot receive mixed Vault
Revisions.

The Vault-side dispatch template, credential ownership checklist, and the
re-scan-first Publish Set migration command are documented in
[docs/vault-publication.md](docs/vault-publication.md). The migration tool refuses
to write `published: true` until the operator explicitly acknowledges a validated
dispatch.

Run the build acceptance test and type checker:

```sh
pnpm test
pnpm typecheck
```
