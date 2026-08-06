# @picasuo/publish-set-contract

`@picasuo/publish-set-contract` validates a Vault's Publish Set without writing
Vault files, making network calls, or depending on Astro, GitHub Actions, or
credentials.

## Published release for external consumers

Release `0.1.0` as the initial public version. After `npm publish` succeeds,
external consumers must pin that exact released version rather than a range:

```sh
pnpm add @picasuo/publish-set-contract@0.1.0
```

Before making that release, run the package checks from the workspace root:

```sh
pnpm --filter @picasuo/publish-set-contract build
pnpm --filter @picasuo/publish-set-contract typecheck
pnpm --filter @picasuo/publish-set-contract test
```

Then publish from this package directory with an npm account authorized for the
`@picasuo` scope:

```sh
npm publish
```

Each later release must update this section to its exact released npm version.
