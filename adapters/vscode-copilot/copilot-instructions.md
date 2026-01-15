# VS Code Copilot Instructions

This adapter provides instructions for using `ai-agentic-rules` with GitHub Copilot in VS Code.

## Setup

1. **Install packs** (optional): Run `install/install-to-home.sh` to copy packs to `~/.ai-coding-rules/`
2. **Create repo-level `AGENTS.md`**: Add an `AGENTS.md` file in your repo root that references the packs you want to use

## Usage

### Option 1: Reference `AGENTS.md` in your repo

Add this to your `.vscode/settings.json` or workspace settings:

```json
{
  "github.copilot.editor.enableAutoCompletions": true,
  "github.copilot.advanced": {
    "customInstructions": "Follow the rules defined in AGENTS.md in the repo root. If AGENTS.md references packs, load them from ~/.ai-coding-rules/packs/ or from the repo's .ai-coding-rules/ directory."
  }
}
```

### Option 2: Direct pack references

If you don't want an `AGENTS.md`, you can reference packs directly in Copilot's custom instructions:

```
Follow these rule packs (in order of precedence):
1. Repo-specific rules in AGENTS.md (if present)
2. ~/.ai-coding-rules/packs/core/RULES.md - Universal agent behavior
3. ~/.ai-coding-rules/packs/bun-first/RULES.md - Bun toolchain (if bun-stack profile)
4. ~/.ai-coding-rules/packs/typescript/RULES.md - TypeScript standards
5. ~/.ai-coding-rules/packs/ai-coding-standards/RULES.md - Coding standards

Conflict resolution: Enforcement (CI/lint/tests) > repo rules > org/user-global rules.
Profile selection (bun-stack vs node-stack) decides toolchain.
```

## Profiles

- **bun-stack**: core + bun-first + typescript + ai-coding-standards
- **node-stack**: core + typescript + ai-coding-standards
- **mobile-stack**: core + android + ios + ai-coding-standards

See `packs/profiles/` for profile definitions.
