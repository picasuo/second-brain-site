# 01 — Minimal Published Site Build

**What to build:** Given a fixture Vault Revision containing one Published Note, build a static Published Site with a working Notes Index entry and the corresponding Note URL. This establishes the single Published Site Build seam through which subsequent tickets are verified.

**Blocked by:** None — can start immediately.

**Status:** resolved

- [x] A fixture Vault Revision with one valid Published Note produces a static Notes Index and that note's public page.
- [x] The build accepts an explicit Vault Revision input rather than reading an ambient or default content source.
- [x] A high-level test invokes Published Site Build and asserts the public routes and rendered note content.
- [x] The project can run the build and its acceptance test from a clean checkout.

## Comments

- 2026-08-06：验收完成。`test/published-site-build.test.ts` 的 fixture Vault Revision 测试验证了指定 Vault 输入生成静态 Notes Index、Published Note 路由及渲染内容；测试不读取环境默认内容源。全量 `pnpm test`（33/33）与 `pnpm typecheck`（0 errors、0 warnings）通过。
