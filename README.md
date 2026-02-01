# ai-agentic-rules

Universal, tool-agnostic instruction packs for AI coding agents, plus tool-specific adapters.

**CLI package**: `@aialchemy/ai-coding-rules` (bin: `ai-coding-rules`)

## What is this?

A modular system for defining how AI coding agents (and humans) should work in your codebase. Rules are organized into **packs** that can be combined via **profiles**, with explicit conflict resolution.

## Philosophy

- **Layered**: Org-wide (`~/.ai-coding-rules/`) → Repo (`AGENTS.md`) → Domain/folder rules
- **Tool-agnostic**: Canonical rules live in packs; adapters are thin pointers
- **Composable**: Mix and match packs via profiles
- **Explicit conflicts**: Clear policy for resolving toolchain and rule conflicts
- **Public-safe**: No secrets, no internal URLs, no client names
- **Human-owned**: Your project context is never overwritten

## Quick Start (Minimum Useful Setup)

Get started with a single command (npm v11+ requires an explicit binary):

```bash
# Option A (npx with explicit binary)
npx --yes --package=@aialchemy/ai-coding-rules ai-coding-rules init

# Option B (npm exec)
npm exec --yes --package=@aialchemy/ai-coding-rules -- ai-coding-rules init
```

That's it! This will:
1. Download the latest rules and adapters from GitHub
2. Prompt you to select a profile (bun-stack, node-stack, or mobile-stack)
3. Prompt you to select which AI tools you use (Cursor, VS Code Copilot, Kiro, Gemini)
4. Create a composed file structure that preserves your context
5. Configure your selected tools automatically

**Outcome**: Governance rules active, tool configured, human context preserved.

## What This Tool Does (and Doesn't Do)

### ✅ What it does:
- Governs **how** work happens (coding standards, conflict resolution, planning)
- Provides toolchain guidance (Bun vs Node, testing frameworks, etc.)
- Ensures consistency across your codebase
- Helps AI agents understand your project conventions

### ❌ What it doesn't do:
- Replace developers
- Write business logic
- Make architectural decisions for you
- Run code or deploy applications

## CLI Modes

The CLI supports three modes for different use cases:

### Compose Mode (Default)

```bash
ai-coding-rules init --mode=compose
```

**Behavior**:
- Creates or updates `AGENTS.rules.md` (system-managed)
- Creates `AGENTS.md` only if missing (shared entry point)
- Creates `AGENTS.local.md` only if missing (human-managed, never overwritten)
- Never deletes or overwrites human content

**Use case**: Default setup for new and existing projects.

### Replace Mode (Advanced)

```bash
ai-coding-rules init --mode=replace
```

**Behavior**:
- Fully regenerates `AGENTS.md`
- Requires explicit confirmation
- Displays a warning before proceeding

**Use case**: When you want to start fresh with a completely new configuration.

### Check Mode (CI/Validation)

```bash
ai-coding-rules init --mode=check
```

**Behavior**:
- Does not write files
- Validates rule resolution
- Returns non-zero exit code on conflicts
- Validates pack availability and adapter configuration

**Use case**: CI/CD pipelines, validation before deployment.

## Plan Command

Preview what would change without writing any files:

```bash
ai-coding-rules plan
```

**Output includes**:
- Files to be created
- Files to be modified
- Files untouched
- Rule packs applied
- Conflict resolution decisions

**Use case**: High-trust feature for understanding impact before running.

## Non-interactive options (CI-friendly)

You can skip prompts by providing explicit flags:

```bash
ai-coding-rules init --mode=compose --profile=bun-stack --tools=cursor,vscode
ai-coding-rules plan --profile=node-stack --tools=cursor,kiro,gemini
ai-coding-rules check --profile=mobile-stack
```

## File Ownership

The CLI creates a composed file structure with clear ownership:

| File            | Owner  | Overwritten by CLI |
| --------------- | ------ | ------------------ |
| AGENTS.md       | Shared | Only if missing    |
| AGENTS.rules.md | System | Yes                |
| AGENTS.local.md | Human  | Never              |

### File Structure

```
AGENTS.md              # Entry point (human-readable, references other files)
AGENTS.rules.md        # System-managed (auto-generated, contains governance rules)
AGENTS.local.md        # Human-managed (never overwritten, your project context)
```

### AGENTS.md (Entry Point)

```markdown
# Agent Context

This file is the **canonical entry point** for AI coding agents working in this repo.

## Governance Rules (Auto-generated)

<!-- DO NOT EDIT -->
See: ./AGENTS.rules.md

## Project Context (Human-maintained)

See: ./AGENTS.local.md
```

### AGENTS.local.md (Your Space)

Edit this file to add:
- Project overview and goals
- Architecture decisions
- Team-specific guidelines
- Domain-specific rules
- Any other project context

**Important**: This file is never overwritten by AI Agentic Rules.

## Installation Options

### Option 1: Interactive CLI (Recommended)

```bash
# Option A (npx with explicit binary)
npx --yes --package=@aialchemy/ai-coding-rules ai-coding-rules init

# Option B (npm exec)
npm exec --yes --package=@aialchemy/ai-coding-rules -- ai-coding-rules init
```

If you install the CLI globally, you can run `ai-coding-rules init` directly.

### Option 2: Remote installer script

```bash
curl -fsSL https://raw.githubusercontent.com/aialchemylabs/ai-agentic-rules/main/install/install-from-remote.sh | bash
```

Then run one of the commands above in your repo to configure it.

### Option 3: Manual installation

1. **Clone and install packs**:
   ```bash
   git clone https://github.com/aialchemylabs/ai-agentic-rules.git
   cd ai-agentic-rules
   ./install/install-to-home.sh
   ```

2. **Choose a profile**:
   - **`bun-stack`**: Bun-first tooling + TypeScript + coding standards
   - **`node-stack`**: Node/pnpm/Vite/Jest + TypeScript + coding standards
   - **`mobile-stack`**: Android + iOS + coding standards

3. **Create `AGENTS.md`** in your repo root:
   ```markdown
   # Agent Rules for This Repository
   
   Profile: bun-stack
   
   # Repo-specific overrides
   - Use Next.js App Router
   - Prefer shadcn/ui components
   ```
   See `examples/sample-repo/AGENTS.md` for a complete example.

4. **Configure your tool adapter**:
   - **Cursor**: Copy `adapters/cursor/rules/*.mdc` to `.cursor/rules/` (create the folder if needed)
   - **VS Code Copilot**: See `adapters/vscode-copilot/copilot-instructions.md`
   - **Kiro**: See `adapters/kiro/project.md`
   - **Gemini/Antigravity**: See `adapters/antigravity-gemini/GEMINI.md`

## Structure

```
ai-agentic-rules/
├── packs/                    # Canonical rule packs
│   ├── core/                # Universal agent behavior
│   ├── bun-first/           # Bun toolchain defaults
│   ├── typescript/          # TypeScript standards
│   ├── java/                # Java standards
│   ├── android/             # Android/Kotlin standards
│   ├── ios/                 # iOS/Swift standards
│   ├── ai-coding-standards/ # Coding standards
│   └── profiles/            # Profile definitions
│       ├── bun-stack.md
│       ├── node-stack.md
│       └── mobile-stack.md
├── adapters/                # Tool-specific adapters
│   ├── cursor/
│   ├── vscode-copilot/
│   ├── kiro/
│   └── antigravity-gemini/
├── install/                 # Installation scripts
│   ├── install-to-home.sh
│   ├── install-from-remote.sh
│   └── update.sh
└── examples/                # Example usage
    └── sample-repo/
        └── AGENTS.md
```

## Layering

Rules are applied in this order (highest to lowest priority):

1. **Enforcement**: CI checks, linters, typecheck, tests, build pipelines
2. **Org-wide rules**: `~/.ai-coding-rules/packs/` (if installed)
3. **Repo rules**: `.ai-coding-rules/` directory in the repo
4. **Domain/folder rules**: Directory-specific overrides (if present)
5. **Local context**: `AGENTS.local.md`
6. **Profile defaults**: Pack combinations defined in profiles

See `packs/core/RULES.md` for the full conflict resolution policy.

## Conflict Resolution

When multiple rule sources apply:

1. **Enforcement wins**: CI/lint/tests override written guidance
2. **Specific beats general**: Folder rules > repo rules
3. **Explicit precedence**: `org > repo > folder > local`
4. **Profile decides toolchain**: `bun-stack` → Bun, `node-stack` → Node/pnpm/Vite
5. **Match the repo**: If repo already chose a toolchain, follow it

## Pack Editing Guidance

- **Core packs**: canonical, do not edit directly.
- **Org packs**: fork and own for your company’s rules.
- **Local overrides**: use `AGENTS.local.md` or repo-level packs for project-specific context.

**Precedence rule**: `org > repo > folder > local`

## Rule Pack Maturity

Each pack declares a maturity level in its `metadata.json`:

### Pack Types

- **`core`** — Canonical, rarely changed (e.g., `core`, `typescript`, `ai-coding-standards`)
- **`opinionated`** — Stack-specific (e.g., `bun-first`, `android`, `ios`)
- **`org`** — Company-owned (for org-specific packs)
- **`experimental`** — Evolving (for experimental features)

### Editing Guidance

- **Core packs** should not be edited directly
- **Org packs** are expected to be forked
- **Local overrides** are supported and encouraged (via `AGENTS.local.md`)

## Profiles

### bun-stack

- `packs/core` — Universal agent behavior
- `packs/bun-first` — Bun toolchain (bun install/test/build/serve)
- `packs/typescript` — TypeScript strictness
- `packs/ai-coding-standards` — Coding standards

**Toolchain**: Bun, `bun:sqlite`, `Bun.redis`, `Bun.sql`, `Bun.serve()`, HTML imports

### node-stack

- `packs/core` — Universal agent behavior
- `packs/typescript` — TypeScript strictness
- `packs/ai-coding-standards` — Coding standards

**Toolchain**: Node.js, pnpm (preferred), Vite, Jest/Vitest, Express

### mobile-stack

- `packs/core` — Universal agent behavior
- `packs/android` — Android/Kotlin standards
- `packs/ios` — iOS/Swift standards
- `packs/ai-coding-standards` — Coding standards

**Toolchain**: Kotlin, Gradle, Android SDK / Swift, Xcode, SPM/CocoaPods

## Tool Adapters

### Cursor

From your consuming repo, copy adapter files from your `ai-agentic-rules` clone:

```bash
mkdir -p .cursor/rules
cp /path/to/ai-agentic-rules/adapters/cursor/rules/*.mdc .cursor/rules/
```

The adapters point to `AGENTS.md` and installed packs.

**CLI output**: `✔ Cursor adapter applied → .cursor/rules/`

### VS Code Copilot

See `adapters/vscode-copilot/copilot-instructions.md` for setup instructions.

**CLI output**: `✔ VS Code Copilot adapter applied → .vscode/settings.json`

### Kiro

See `adapters/kiro/project.md` for configuration.

**CLI output**: `✔ Kiro adapter applied → .kiro/steering/project.md`

### Gemini/Antigravity

See `adapters/antigravity-gemini/GEMINI.md` for `@include` usage.

**CLI output**: `✔ Gemini adapter applied → GEMINI.md`

## Local Validation

### Test install script

```bash
# Dry run (check what would be installed)
./install/install-to-home.sh --dry-run

# Install packs
./install/install-to-home.sh

# Verify packs are installed
ls -la ~/.ai-coding-rules/packs/
```

### Verify structure

```bash
# Check all required files exist
find packs adapters install examples -type f | sort

# Verify scripts are executable
test -x install/install-to-home.sh && echo "✓ install script is executable"
test -x install/update.sh && echo "✓ update script is executable"
```

## How a Consuming Repo Uses This

### Using the CLI (Recommended)

```bash
# In your repo root (choose one)
npx --yes --package=@aialchemy/ai-coding-rules ai-coding-rules init
npm exec --yes --package=@aialchemy/ai-coding-rules -- ai-coding-rules init

# Or with explicit mode
npx --yes --package=@aialchemy/ai-coding-rules ai-coding-rules init --mode=compose
npx --yes --package=@aialchemy/ai-coding-rules ai-coding-rules init --mode=replace
npx --yes --package=@aialchemy/ai-coding-rules ai-coding-rules init --mode=check

# Plan what would change
npx --yes --package=@aialchemy/ai-coding-rules ai-coding-rules plan
```

This automatically:
- Downloads the latest rules and adapters from GitHub
- Creates a composed file structure that preserves your context
- Creates `AGENTS.md`, `AGENTS.rules.md`, and `AGENTS.local.md`
- Configures your selected IDE tools

### Manual setup

1. **Install packs** (optional, for org-wide use):
   ```bash
   # Option A: Remote installer
   curl -fsSL https://raw.githubusercontent.com/aialchemylabs/ai-agentic-rules/main/install/install-from-remote.sh | bash
   
   # Option B: Clone and install
   git clone https://github.com/aialchemylabs/ai-agentic-rules.git
   cd ai-agentic-rules
   ./install/install-to-home.sh
   ```

2. **Create `AGENTS.md`** in your repo:
   ```markdown
   # Agent Rules
   
   Profile: bun-stack
   
   # Repo-specific rules
   - Use Next.js App Router
   - Prefer shadcn/ui
   ```

3. **Configure your tool** (e.g., Cursor):
   ```bash
   mkdir -p .cursor/rules
   cp /path/to/ai-agentic-rules/adapters/cursor/rules/*.mdc .cursor/rules/
   ```

4. **Agents will**:
   - Read `AGENTS.md` first
   - Load profile packs from `~/.ai-coding-rules/packs/` or repo's `.ai-coding-rules/`
   - Apply repo-specific overrides from `AGENTS.local.md`
   - Follow conflict resolution policy

## Non-Functional Requirements

- **Deterministic**: All file writes are deterministic
- **Idempotent**: CLI can be run multiple times safely
- **No silent destruction**: Clear logs for every action
- **Safe defaults**: Safety over power
- **Transparent**: Every action is logged and explained

## Support

If this project saved you time or helped improve your development workflow, consider supporting our work:

**[Sponsor us on GitHub](https://github.com/sponsors/aialchemylabs)** — Buy us a coffee and help us continue building open-source tools for the AI coding community.

## License

MIT License — see `LICENSE` file.

## Contributing

This repository provides public-safe, tool-agnostic rule packs. Contributions should:

- Be explicit, testable, and short
- Avoid tool lock-in
- Include conflict resolution notes when introducing new packs
- Keep each `RULES.md` under ~200-300 lines
- Include `metadata.json` for new packs with appropriate maturity level

## Guiding Principle

> AI Agentic Rules should feel like guardrails, not handcuffs.

Speed with safety. Governance with respect.
