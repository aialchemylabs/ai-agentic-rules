# iOS Rules (Swift/iOS)

This pack defines iOS standards focused on stability, performance, and UX.

## Core principles

- **MUST** prefer Swift-first patterns.
- **MUST** optimize for stability, performance, and user experience.

## Architecture

- **MUST** use a consistent architecture (e.g., MVVM) across the app.
- **MUST** keep UI thin; business logic lives in view models/services.
- **SHOULD** avoid singleton overuse; prefer dependency injection.

## Swift style

- **MUST** prefer value types (`struct`) and immutability.
- **SHOULD** use `enum` + associated values for state.
- **MUST NOT** force unwrap (`!`) except in tests or clearly safe, justified cases.

## Concurrency

- **SHOULD** prefer Swift Concurrency (`async/await`) where supported.
- **MUST** keep UI updates on `MainActor`.
- **MUST** avoid blocking calls on the main thread.
- **SHOULD** make cancellation explicit for long operations.

## SwiftUI (when applicable)

- **SHOULD** keep views small and composable.
- **MUST** hoist state; use observable models intentionally.
- **MUST** avoid heavy work in `body`; use tasks/effects.
- **MUST** meet accessibility basics (labels, traits, Dynamic Type support).

## Performance

- **SHOULD** avoid unnecessary recomputation; be mindful of view updates.
- **MUST** use Instruments when making performance changes.

## Security & privacy

- **MUST NOT** log secrets/PII.
- **SHOULD** use Keychain for sensitive values.
- **SHOULD** handle permissions transparently and minimize data collection.

## Testing

- **MUST** unit test core logic.
- **SHOULD** add snapshot/UI tests for key screens and critical flows.
- **MUST** keep tests deterministic.

## Agent behavior

- **MUST** propose a plan for cross-cutting refactors (networking, state, navigation).
- **MUST** include simulator/device verification steps where applicable.

