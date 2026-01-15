# Android Rules (Kotlin/Android)

This pack defines Android standards focused on stability, battery efficiency, and UX.

## Core principles

- **MUST** prefer Kotlin-first patterns; keep Java interop minimal.
- **MUST** optimize for stability, battery, and user experience.

## Architecture

- **MUST** use a consistent architecture (e.g., MVVM) and clear layering:
  - UI (Compose/Views)
  - state holders (ViewModel)
  - domain/use-cases (optional)
  - data (repositories, sources)
- **MUST** keep UI “dumb”: business logic does not live in Activities/Fragments/Composables.

## Kotlin style

- **MUST** prefer immutability (`val`) and data classes for state.
- **SHOULD** avoid nullable types where possible; model absence explicitly.
- **SHOULD** use sealed classes for UI state and events.

## Coroutines & Flow

- **MUST** use structured concurrency.
- **MUST NOT** use `GlobalScope`.
- **MUST** use `viewModelScope` (or equivalent) for UI lifecycle work.
- **SHOULD** use `StateFlow` for state and `SharedFlow` for events.
- **MUST** be explicit about dispatchers for IO/CPU work.

## Compose (when applicable)

- **SHOULD** keep composables small, stable, and previewable.
- **MUST** hoist state and pass events down.
- **MUST** avoid side effects during composition; use `LaunchedEffect`/`remember` correctly.
- **MUST** meet accessibility basics (content descriptions, semantics).

## Performance

- **MUST** avoid heavy work on the main thread.
- **SHOULD** use paging/caching for large lists.
- **SHOULD** watch recomposition; avoid unstable parameters.

## Security & privacy

- **MUST NOT** log tokens/PII.
- **SHOULD** use Android Keystore for sensitive data.
- **SHOULD** use encrypted storage where required.

## Testing

- **MUST** write unit tests for reducers/use-cases and state logic.
- **SHOULD** write UI tests for critical flows.
- **MUST** keep tests deterministic; avoid sleep-based assertions.

## Agent behavior

- **MUST** propose a plan before changing navigation/state architecture.
- **MUST** include emulator/device verification steps where applicable.

