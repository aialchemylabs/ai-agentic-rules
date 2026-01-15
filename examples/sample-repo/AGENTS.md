# Agent Rules for This Repository

This file is the **canonical entry point** for AI coding agents working in this repo.

## Profile

**Profile**: `bun-stack`

This means agents should load:
- `packs/core` — Universal agent behavior
- `packs/bun-first` — Bun toolchain defaults
- `packs/typescript` — TypeScript standards
- `packs/ai-alchemy-standards` — Coding standards

## Pack sources (priority order)

1. **Repo-specific rules** (this file and `.aialchemylabs/` directory)
2. **Org-wide rules** (`~/.aialchemylabs/packs/` if installed)
3. **Profile defaults** (from `ai-agentic-rules` repository)

## Repo-specific overrides

### Frontend
- Use Next.js App Router (even with Bun-first profile)
- Prefer shadcn/ui components
- Use Tailwind CSS for styling

### Backend
- Use `Bun.serve()` for HTTP servers
- Prefer `bun:sqlite` for SQLite databases
- Use Zod for runtime validation

### Testing
- Use `bun test` for all tests
- Aim for >80% coverage on new features

## Conflict resolution

When rules conflict:
1. **Enforcement wins**: CI/lint/tests override written guidance
2. **This file** overrides org-wide packs (`~/.aialchemylabs/`)
3. **Profile selection** (`bun-stack`) decides toolchain (Bun over Node/pnpm/Vite)
4. **Existing repo patterns** take precedence unless explicitly migrating

## Domain-specific rules

### `frontend/` directory
- All components must be TypeScript
- Use React Server Components where possible
- Accessibility is mandatory (WCAG 2.1 AA minimum)

### `api/` directory
- All endpoints must validate input with Zod schemas
- Errors must be structured and include correlation IDs
- Rate limiting required for public endpoints

## How agents should use this

1. Read this file first
2. Load the selected profile's packs (from `~/.aialchemylabs/packs/` or repo's `.aialchemylabs/` directory)
3. Apply repo-specific overrides from this file
4. Follow domain-specific rules for the current directory
5. When uncertain, choose the option that changes less and matches existing patterns
