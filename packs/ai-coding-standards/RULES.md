# AI Coding Standards (Public)

These standards define how code should be written, structured, tested, and reviewed when working with AI-assisted development.

They are opinionated by design: the goal is **predictable, maintainable, production-grade systems**.

This pack is **toolchain-agnostic**. Toolchain decisions belong in a selected profile (e.g., bun-stack vs node-stack).

## Core principles

- **MUST** prefer correctness over cleverness.
- **MUST** treat maintainability as a feature (code is for the next developer, human or AI).
- **MUST** make small, verifiable changes (scope work to reviewable steps).
- **MUST** treat enforcement as truth: linters, formatters, tests, and CI gates override guidance.

## Type safety & boundaries

- **MUST** validate all external inputs (API payloads, user input, env vars, events, storage reads).
- **SHOULD** prefer schema-based runtime validation (Zod/Valibot/etc.) and derive types from schemas where possible.
- **MUST** assume any cross-boundary data is untrusted until validated.

## Project structure

- **MUST** organize code **feature/domain-first**, not “by file type”.
- **MUST** keep feature code cohesive: logic, types/schemas, and tests live together.
- **SHOULD** avoid shared “utils dumping grounds”.
  - If a helper becomes truly generic, promote it intentionally with clear ownership.

Example:

```text
features/
  auth/
    auth.service.ts
    auth.schema.ts
    auth.test.ts
```

## Naming conventions

- **Files/folders**: kebab-case
- **Variables/functions**: camelCase
- **Types/interfaces/classes**: PascalCase
- **Constants**: SCREAMING_SNAKE_CASE

Names **MUST** describe intent and avoid unclear abbreviations.

## Frontend (when applicable)

- **MUST** keep components small and composable; prefer composition over configuration.
- **SHOULD** keep styling colocated with components; avoid inline styles except for truly dynamic values.
- **MUST** meet accessibility basics:
  - semantic HTML first
  - keyboard navigation + focus states
  - ARIA only when semantic HTML is insufficient

## Backend & APIs (when applicable)

- **MUST** keep API contracts explicit and documented.
- **MUST** provide migration/versioning paths for breaking changes.
- **MUST** handle errors intentionally:
  - fail fast and loudly
  - never swallow errors silently
  - prefer structured, actionable error responses
- **SHOULD** log intent, not noise.
- **MUST NOT** log secrets or sensitive user data.

## Testing standards

- **MUST** add tests for new features.
- **MUST** add regression tests for bug fixes.
- **SHOULD** prefer integration tests at boundaries; avoid excessive mocking.
- **MUST** keep tests deterministic and non-flaky.
- **SHOULD** name tests by behavior, not implementation.

## Performance & reliability

- **SHOULD** avoid premature optimization; measure first.
- **MUST** clean up resources (connections, listeners, timers).
- **SHOULD** prefer simple, predictable performance characteristics.

## Security basics

- **MUST NOT** hard-code secrets.
- **MUST** use least-privilege access patterns.
- **MUST** validate and sanitize untrusted input.

## Documentation

- **MUST** document public APIs and non-obvious behaviors.
- **SHOULD** add inline explanation for complex logic (why, not what).
- **SHOULD** keep docs close to the code they describe.

## Version control & reviews

- **MUST** keep commits logical and self-contained.
- **SHOULD** write commit/PR descriptions that explain **why**, not just **what**.
- **MUST** keep PRs focused: one concern per PR.

## Working with AI coding agents

AI agents working under these standards:

- **MUST** follow `packs/core` for planning, verification, and conflict resolution.
- **MUST** follow existing repo patterns and tooling.
- **MUST** run (or clearly specify) lint/typecheck/test steps before final output.
- **MUST** state assumptions explicitly when they affect correctness.
