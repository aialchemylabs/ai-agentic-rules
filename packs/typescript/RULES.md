# TypeScript Rules

This pack defines TypeScript standards for production code and AI-assisted changes.

It is toolchain-agnostic: use the repo’s selected profile (bun-stack vs node-stack) to decide package manager, test runner, and bundler.

## Type safety (strict by default)

- **MUST** use `strict: true`.
- **MUST NOT** use `any`.
  - If unavoidable, **MUST** constrain scope and justify with a comment.
  - Prefer `unknown` + narrowing over `any`.
- **SHOULD** add explicit types at module boundaries (exports, public APIs, IO edges).
- **SHOULD** rely on inference inside functions when it improves readability.

## Boundaries & runtime validation

At any system boundary (HTTP, storage, env vars, events, user input):

- **MUST** validate at runtime.
- **SHOULD** use schema-first validation (e.g., Zod/Valibot/io-ts) and derive TS types from the schema.
- **MUST** treat all external data as untrusted until validated.

## Types: `type` vs `interface`

- **SHOULD** prefer `type` for unions/intersections and compositional types.
- **SHOULD** use `interface` when you need declaration merging or an intentionally extensible public contract.

## IDs and “mixup-proofing”

- **SHOULD** use branded types for identifiers where mixups are costly (e.g., `UserId`, `OrderId`).
- **SHOULD** avoid passing plain `string` IDs through multiple layers without intent.

## Project structure

- **MUST** organize by feature/domain first.
- **MUST** colocate schemas/types with the feature that owns them.
- **MUST** keep generated code isolated and **MUST NOT** edit it manually.
- **SHOULD** avoid a generic “utils” dumping ground; promote shared code intentionally.

## Style & readability

- **MUST** follow repo naming conventions:
  - files/folders: kebab-case
  - variables/functions: camelCase
  - types/classes: PascalCase
  - constants: SCREAMING_SNAKE_CASE
- **SHOULD** prefer early returns over deep nesting.
- **SHOULD** keep functions small; extract helpers when branching grows.

## Async, promises, and errors

- **SHOULD** prefer `async/await` over raw promise chains.
- **MUST NOT** ignore promises.
  - Use `void` only with explicit intent and an explanatory comment.
- **MUST** define consistent error shapes at API boundaries.
- **MUST NOT** log secrets/PII.

## React / Next.js (when applicable)

- **SHOULD** keep state local; elevate only when necessary.
- **SHOULD** avoid prop drilling; prefer composition, or context used intentionally.
- **MUST** meet accessibility basics (semantic HTML, keyboard nav, focus).
- **SHOULD** keep client-only code minimal when frameworks support server-rendering patterns.

## Testing

- **MUST** add tests for new features and bug fixes (regression).
- **SHOULD** prefer integration tests at boundaries; avoid excessive mocking.
- **MUST** keep tests deterministic and timing-robust.

## Tooling & enforcement

- **MUST** run the repo’s formatter/linter/typecheck/test steps before finalizing changes.
- **MUST NOT** disable lint rules to “make it pass”. Fix the underlying issue.

## Agent behavior

- **MUST** propose a plan before multi-file changes or refactors (> ~30 LOC).
- **MUST** report verification commands run and results.

