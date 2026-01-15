# Core Agent Rules (Universal)

This pack defines **tool-agnostic, cross-language** behavior for AI coding agents and human collaborators.

It is intentionally short and strict. Tool-specific behavior belongs in adapters, and toolchain choices belong in profiles.

## Authority & conflict resolution (MUST follow)

When multiple rule sources apply, resolve conflicts in this order:

1. **Enforcement wins**: CI checks, linters, typecheck, tests, build pipelines, and security scanners **override** written guidance.
2. **Specific beats general**:
   - Folder/domain rules override repo-root rules.
   - Repo-root rules override org/user-global packs.
3. **Repo overrides user-global**: a consuming repo’s `AGENTS.md` and `.ai-coding-rules/` override `~/.ai-coding-rules/`.
4. **Profile decides toolchain**:
   - If the selected profile is **bun-stack**, prefer Bun tooling and Bun-native APIs (see `packs/bun-first`).
   - If the selected profile is **node-stack**, prefer Node/pnpm/Vite/Jest/Express (or the repo’s existing equivalents).
   - If the selected profile is **mobile-stack**, prefer Android/iOS platform conventions.
5. **Match the repo**: if the repo already chose a toolchain, follow it even if it differs from a profile default.

If you are uncertain which rule applies, **choose the option that changes less** and aligns with the repo’s current tooling.

## Planning & scope control

- **MUST plan first** when the change is non-trivial:
  - Roughly **>30 LOC**, **multi-file**, **new dependency**, **API change**, **migration**, **security-sensitive**, or **performance-critical**.
  - The plan MUST include: intended files/modules, risk points, and verification commands.
- **MUST keep changes reviewable**:
  - One concern per PR/commit series.
  - Avoid drive-by refactors that are not required for the requested change.
  - Prefer incremental steps with checkpoints over “big bang” rewrites.

## Safety, secrets, and public-readiness

- **MUST NOT** introduce secrets (tokens, private keys, credentials) into code, docs, examples, tests, or logs.
- **MUST NOT** add internal-only URLs, client names, or non-public identifiers.
- **MUST** redact sensitive data in examples (use placeholders like `EXAMPLE_TOKEN`).
- **SHOULD** avoid logging PII; if logging is necessary, log **intent + context**, not raw payloads.

## Dependencies & third-party code

- **MUST** avoid new dependencies unless there is a clear benefit and no simpler option.
- **MUST** justify any new dependency in the PR/summary (what problem it solves, why built-ins aren’t sufficient).
- **SHOULD** prefer standard library / platform primitives over external packages.
- **MUST** use the repo’s package manager and lockfile conventions.

## Implementation quality (cross-language)

- **MUST** follow existing patterns and conventions in the repo (structure, naming, error handling, logging).
- **MUST** keep module boundaries clean:
  - Validate and sanitize inputs at system boundaries (HTTP, CLI, events, env, storage).
  - Do not trust data that crosses a boundary.
- **SHOULD** prefer explicit, readable code over cleverness.
- **SHOULD** add/adjust documentation when behavior changes (README, ADRs, docstrings, usage examples).

## Testing & verification

- **MUST** add tests for:
  - New features (coverage of expected behavior).
  - Bug fixes (regression test reproducing the bug).
- **MUST** run the repo’s verification steps before finalizing:
  - Format/lint
  - Typecheck (if applicable)
  - Tests
  - Build (if applicable)
- **MUST** report the exact commands run and outcomes.
  - If you cannot run commands, you MUST state what to run and why it’s relevant.

## Error handling & observability

- **MUST** fail fast and loudly on programmer errors and invalid inputs.
- **MUST NOT** swallow errors silently.
- **SHOULD** use structured error shapes for APIs and structured logs where practical.
- **SHOULD** avoid logging secrets/PII; include correlation/request IDs when available.

## Output contract (what “done” looks like)

When completing a task, include:

- **What changed**: brief, high-signal summary
- **Files touched**: list of key files
- **Verification**: commands executed + results
- **Notes**: assumptions, follow-ups, or known gaps

