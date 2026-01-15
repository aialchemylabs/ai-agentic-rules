# Mobile Stack Profile

This profile combines core agent behavior with Android and iOS platform standards.

## Included packs

1. **`packs/core`** — Universal agent behavior, conflict resolution, planning, safety
2. **`packs/android`** — Android/Kotlin standards (MVVM, Compose, coroutines, testing)
3. **`packs/ios`** — iOS/Swift standards (MVVM, SwiftUI, concurrency, testing)
4. **`packs/ai-alchemy-standards`** — Coding standards (structure, naming, testing, security)

## Toolchain decisions

When this profile is selected:

- **Android**: Kotlin-first, Gradle, Android SDK
- **iOS**: Swift-first, Xcode, Swift Package Manager / CocoaPods
- **Testing**: Platform-native test frameworks (JUnit/Kotlin Test for Android, XCTest for iOS)

## When to use

Use this profile when:

- The repo contains Android and/or iOS native code
- You want platform-specific conventions and architecture patterns

## Conflict resolution

Follow `packs/core` conflict policy:

- Repo-specific platform conventions override profile defaults.
- Existing architecture patterns (if different from MVVM) should be respected unless explicitly migrating.
