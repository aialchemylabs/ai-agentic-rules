# Node Stack Profile

This profile combines core agent behavior with Node-compatible tooling and TypeScript standards.

## Included packs

1. **`packs/core`** — Universal agent behavior, conflict resolution, planning, safety
2. **`packs/typescript`** — TypeScript strictness, type safety, boundaries
3. **`packs/ai-alchemy-standards`** — Coding standards (structure, naming, testing, security)

## Toolchain decisions

When this profile is selected:

- **Package manager**: pnpm (preferred) or npm/yarn (if repo already uses them)
- **Test runner**: Jest or Vitest (follow repo's choice)
- **Bundler**: Vite (preferred for frontend) or webpack/esbuild (if repo already uses them)
- **Runtime**: Node.js
- **Server framework**: Express (or the repo's chosen framework)

## When to use

Use this profile when:

- The repo targets Node.js as the runtime
- You need compatibility with existing Node tooling
- The repo already uses pnpm/Vite/Jest/Express or similar

## Conflict resolution

If the repo already uses Bun, see `packs/core` conflict policy:

- If the repo explicitly chose Bun, follow the repo's choice (consider `bun-stack` profile instead).
- If the profile is selected but conflicts with existing tooling, prefer the repo's existing setup.
