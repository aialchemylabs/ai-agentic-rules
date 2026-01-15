# Bun-first Development Rules

This pack defines a **Bun-first** toolchain for TypeScript/JavaScript projects.

If a repo selects the **bun-stack** profile, Bun tooling and Bun-native APIs take priority over Node/pnpm/Vite/Jest/Express equivalents (see `packs/core` for conflict resolution).

## Default toolchain (commands)

- **MUST** use Bun to install dependencies:
  - `bun install` (not `npm install`, `yarn`, or `pnpm`)
- **MUST** use Bun to run scripts:
  - `bun run <script>` (not `npm run` / `pnpm run`)
- **MUST** use Bun to execute TypeScript/JavaScript:
  - `bun <file>` (not `node <file>` / `ts-node`)
- **MUST** use Bun for tests:
  - `bun test` (not Jest/Vitest unless the repo explicitly chose them)
- **SHOULD** use Bun for builds/bundling:
  - `bun build <entry>` (avoid webpack/esbuild/vite unless the repo requires them)
- **SHOULD** use Bun’s dev server features for iteration:
  - `bun --hot <entry>` for reload/HMR where applicable

## Environment variables

- **MUST NOT** add `dotenv` by default.
- **SHOULD** rely on Bun’s automatic `.env` loading unless the repo requires different behavior.

## Server & networking

- **MUST** prefer `Bun.serve()` over Express-style frameworks when building an HTTP server.
- **SHOULD** use Bun’s `routes` for simple routing.
- **SHOULD** use built-in `WebSocket` support (avoid `ws` unless required).

## Data access (preferred primitives)

- **SQLite**: **MUST** prefer `bun:sqlite` (avoid `better-sqlite3` by default).
- **Redis**: **SHOULD** prefer `Bun.redis` (avoid `ioredis` by default).
- **Postgres**: **SHOULD** prefer `Bun.sql` (avoid `pg` / `postgres.js` by default).

## Files, processes, and shelling out

- **SHOULD** prefer `Bun.file(...)` over `node:fs` read/write helpers for common file IO.
- **SHOULD** prefer `Bun.$\`...\`` for shell commands instead of `execa`.

## Testing (bun:test)

- **MUST** write tests using `bun:test` when using `bun test`.

Example:

```ts
import { expect, test } from "bun:test";

test("example", () => {
  expect(1 + 1).toBe(2);
});
```

## Frontend bundling (Bun.serve + HTML imports)

- **SHOULD** prefer Bun’s HTML imports and bundling for small/medium web apps.
- **MUST NOT** introduce Vite by default when Bun can serve and bundle the app.

Minimal pattern:

```ts
import indexHtml from "./index.html";

Bun.serve({
  routes: {
    "/": indexHtml,
    "/api/health": new Response("ok"),
  },
  development: { hmr: true },
});
```

```html
<!doctype html>
<html>
  <body>
    <div id="app"></div>
    <script type="module" src="./frontend.tsx"></script>
  </body>
</html>
```

## When to ignore this pack

- If the repo selects **node-stack**, follow the Node toolchain (pnpm/Vite/Jest/Express or the repo’s existing choices).
- If the target runtime cannot be Bun (platform constraints, hosting requirements), follow the repo’s documented runtime.

