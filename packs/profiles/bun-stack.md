# Bun Stack Profile

This profile combines core agent behavior with Bun-first tooling and TypeScript standards.

## Included packs

1. **`packs/core`** — Universal agent behavior, conflict resolution, planning, safety
2. **`packs/bun-first`** — Bun toolchain defaults (bun install/test/build/serve, Bun-native APIs)
3. **`packs/typescript`** — TypeScript strictness, type safety, boundaries
4. **`packs/ai-coding-standards`** — Coding standards (structure, naming, testing, security)

## Toolchain decisions

When this profile is selected:

- **Package manager**: `bun install` (not npm/pnpm/yarn)
- **Test runner**: `bun test` (not Jest/Vitest unless repo explicitly chose them)
- **Bundler**: `bun build` or Bun.serve HTML imports (not Vite/webpack/esbuild by default)
- **Runtime**: Bun (Bun.serve, bun:sqlite, Bun.redis, Bun.sql, Bun.file, Bun.$)
- **Server framework**: `Bun.serve()` (not Express by default)

## When to use

Use this profile when:

- The repo targets Bun as the primary runtime
- You want Bun-native APIs and tooling
- You prefer Bun's built-in bundling and dev server over Vite/webpack

## Conflict resolution

If the repo already uses Node/pnpm/Vite/Jest/Express, see `packs/core` conflict policy:

- If the repo explicitly chose a different toolchain, follow the repo's choice.
- If the profile is selected but conflicts with existing tooling, prefer the repo's existing setup unless explicitly migrating.
