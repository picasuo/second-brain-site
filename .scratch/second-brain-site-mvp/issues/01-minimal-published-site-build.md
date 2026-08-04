# 01 — Minimal Published Site Build

**What to build:** Given a fixture Vault Revision containing one Published Note, build a static Published Site with a working Notes Index entry and the corresponding Note URL. This establishes the single Published Site Build seam through which subsequent tickets are verified.

**Blocked by:** None — can start immediately.

**Status:** ready-for-agent

- [ ] A fixture Vault Revision with one valid Published Note produces a static Notes Index and that note's public page.
- [ ] The build accepts an explicit Vault Revision input rather than reading an ambient or default content source.
- [ ] A high-level test invokes Published Site Build and asserts the public routes and rendered note content.
- [ ] The project can run the build and its acceptance test from a clean checkout.
