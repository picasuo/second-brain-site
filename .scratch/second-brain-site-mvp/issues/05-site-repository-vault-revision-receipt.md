# 05 — Site Repository Vault Revision Receipt

**What to build:** Let the Site Repository receive a Vault dispatch containing `vault_sha` and build from that exact Vault Revision. Each resulting Published Site can be traced to the immutable Vault Revision that caused it, rather than to a moving default branch.

**Blocked by:** 03 — Safe Linked Published Note Rendering

**Status:** ready-for-agent

- [ ] The Site Repository workflow accepts the agreed repository dispatch payload containing `vault_sha`.
- [ ] The workflow checks out the supplied Vault Revision before forming the Publish Set and running Published Site Build.
- [ ] Build output and diagnostics identify the Vault Revision used for that build.
- [ ] A workflow-level test or reproducible fixture proves that a dispatched Vault Revision is used even when the Vault default branch changes afterward.
- [ ] The workflow has a documented concurrency policy so multiple dispatches do not silently mix Vault Revisions.
