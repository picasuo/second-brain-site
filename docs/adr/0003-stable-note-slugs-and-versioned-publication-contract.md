# Stable Note Slugs and a Versioned Publication Contract

Published Note URLs use a required, persistent Frontmatter `slug`, never a Vault file path fallback. The independent public Contract Repository publishes the side-effect-free Publication Contract as an npm package; the private Vault and Site Repository each install that exact package version, and the Site Repository rejects a dispatch whose declared contract version differs from its installed package. This preserves Vault privacy while making the authored release and the deployed release enforce the same rules.

## Considered Options

- **Path fallback:** rejected because encoded non-ASCII paths produced deploy-time 404s and expose Vault structure in public URLs.
- **Random slug at build time:** rejected because the same Vault Revision would not reproduce the same Published Site.
- **Monorepo or Git submodule:** rejected because Vault must remain private while the GitHub Pages Site Repository is public; a submodule would retain the cross-repository credential and version-coordination costs.
