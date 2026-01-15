# Kiro Project Rules

This adapter provides instructions for using `ai-agentic-rules` with Kiro.

## Setup

1. **Install packs** (optional): Run `install/install-to-home.sh` to copy packs to `~/.aialchemylabs/`
2. **Create repo-level `AGENTS.md`**: Add an `AGENTS.md` file in your repo root

## Usage

Kiro should follow the rules defined in:

1. **Primary**: `AGENTS.md` in the repo root (if present)
2. **Fallback**: Packs installed in `~/.aialchemylabs/packs/` or the repo's `.aialchemylabs/` directory

## Profile selection

If `AGENTS.md` specifies a profile (bun-stack, node-stack, mobile-stack), load the corresponding packs from `packs/profiles/<profile>.md`.

## Conflict resolution

Follow the conflict resolution policy in `packs/core/RULES.md`:

- Enforcement (CI/lint/tests) > repo rules > org/user-global rules
- Profile selection decides toolchain (bun-stack vs node-stack)
- Match the repo's existing tooling when uncertain

## Example AGENTS.md

```markdown
# Agent Rules for This Repo

Profile: bun-stack

Additional rules:
- Use Next.js App Router for frontend
- Prefer shadcn/ui components
```

Kiro should load:
- `packs/core/RULES.md`
- `packs/bun-first/RULES.md`
- `packs/typescript/RULES.md`
- `packs/ai-alchemy-standards/RULES.md`
- Plus any repo-specific rules from this file
