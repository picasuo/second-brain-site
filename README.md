# Second Brain Site

Build a static Published Site from an explicit Vault Revision directory:

```sh
pnpm install
pnpm build -- --vault path/to/vault-revision --out path/to/site-output
```

Run the build acceptance test and type checker:

```sh
pnpm test
pnpm typecheck
```
