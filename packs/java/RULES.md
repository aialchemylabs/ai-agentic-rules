# Java Rules

This pack defines Java standards for maintainable, production-grade systems.

## Core principles

- **MUST** prefer simple, explicit code.
- **MUST** keep classes small, cohesive, and single-purpose.
- **SHOULD** avoid premature optimization; measure before tuning.

## Language & API usage

- **MUST** target the repo’s agreed Java version (e.g., 17+) and avoid outdated patterns.
- **SHOULD** use `final` for locals/fields when it improves clarity and safety.
- **SHOULD** use `Optional` for return values (not fields); avoid `Optional` parameters.
- **SHOULD** use streams for transformations, but avoid overly complex stream chains.

## Architecture & packaging

- **SHOULD** package by feature/domain where practical.
- **MUST** encapsulate implementation details and expose minimal public APIs.
- **SHOULD** introduce interfaces at boundaries; avoid needless abstraction.

## Error handling & resources

- **MUST** not swallow exceptions; wrap with context when rethrowing.
- **SHOULD** prefer domain-specific runtime exceptions over broad, generic exceptions.
- **MUST** close resources reliably (use try-with-resources).

## Concurrency

- **SHOULD** prefer higher-level concurrency utilities over manual thread handling.
- **MUST** be explicit about timeouts and retries.
- **SHOULD** avoid shared mutable state; prefer immutability.

## Performance & memory

- **SHOULD** avoid unnecessary allocations in hot paths.
- **MUST** profile before making performance claims.

## Testing

- **MUST** test behavior:
  - unit tests for pure logic
  - integration tests for IO boundaries
- **SHOULD** avoid brittle tests tied to implementation details.
- **SHOULD** use builders/factories for test data clarity.

## Logging & observability

- **SHOULD** use structured logging where possible.
- **MUST NOT** log secrets/PII.
- **SHOULD** include correlation IDs for request flows when available.

## Agent behavior

- **MUST** propose safe refactor steps for large changes.
- **MUST** include how changes were verified (commands + outcomes).

