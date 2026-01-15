# Antigravity/Gemini Rules

This adapter provides instructions for using `ai-agentic-rules` with Antigravity-style Gemini rule files.

## Setup

1. **Install packs** (optional): Run `install/install-to-home.sh` to copy packs to `~/.ai-coding-rules/`
2. **Create repo-level `AGENTS.md`**: Add an `AGENTS.md` file in your repo root

## Usage with @include

If your Gemini/Antigravity setup supports `@include` directives, you can reference packs:

```markdown
# Agent Rules

@include ~/.ai-coding-rules/packs/core/RULES.md
@include ~/.ai-coding-rules/packs/bun-first/RULES.md
@include ~/.ai-coding-rules/packs/typescript/RULES.md
@include ~/.ai-coding-rules/packs/ai-coding-standards/RULES.md

# Repo-specific overrides
- Use Next.js App Router
- Prefer shadcn/ui components
```

## Manual inclusion

If `@include` is not supported, copy the relevant pack contents or reference them in your rule file:

```markdown
# Agent Rules

Follow the rules defined in:
1. AGENTS.md in this repo (if present)
2. ~/.ai-coding-rules/packs/core/RULES.md - Universal agent behavior
3. ~/.ai-coding-rules/packs/bun-first/RULES.md - Bun toolchain (if bun-stack profile)
4. ~/.ai-coding-rules/packs/typescript/RULES.md - TypeScript standards
5. ~/.ai-coding-rules/packs/ai-coding-standards/RULES.md - Coding standards

Conflict resolution: See packs/core/RULES.md
Profile: bun-stack (loads core + bun-first + typescript + ai-coding-standards)
```

## Profiles

- **bun-stack**: core + bun-first + typescript + ai-coding-standards
- **node-stack**: core + typescript + ai-coding-standards
- **mobile-stack**: core + android + ios + ai-coding-standards

See `packs/profiles/` for profile definitions.
