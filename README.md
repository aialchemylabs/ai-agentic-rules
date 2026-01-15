# ai-agentic-rules

Universal, tool-agnostic instruction packs for AI coding agents, plus tool-specific adapters.

## What is this?

A modular system for defining how AI coding agents (and humans) should work in your codebase. Rules are organized into **packs** that can be combined via **profiles**, with explicit conflict resolution.

## Philosophy

- **Layered**: Org-wide (`~/.aialchemylabs/`) → Repo (`AGENTS.md`) → Domain/folder rules
- **Tool-agnostic**: Canonical rules live in packs; adapters are thin pointers
- **Composable**: Mix and match packs via profiles
- **Explicit conflicts**: Clear policy for resolving toolchain and rule conflicts
- **Public-safe**: No secrets, no internal URLs, no client names

## Quick start

### 1. Install packs (optional)

Install packs to `~/.aialchemylabs/` for org-wide use:

```bash
./install/install-to-home.sh
```

### 2. Choose a profile

Select a profile that matches your stack:

- **`bun-stack`**: Bun-first tooling + TypeScript + coding standards
- **`node-stack`**: Node/pnpm/Vite/Jest + TypeScript + coding standards
- **`mobile-stack`**: Android + iOS + coding standards

### 3. Create `AGENTS.md` in your repo

Create an `AGENTS.md` file in your repo root:

```markdown
# Agent Rules for This Repository

Profile: bun-stack

# Repo-specific overrides
- Use Next.js App Router
- Prefer shadcn/ui components
```

See `examples/sample-repo/AGENTS.md` for a complete example.

### 4. Configure your tool adapter

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
│   ├── ai-alchemy-standards/ # Coding standards
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
│   └── update.sh
└── examples/                # Example usage
    └── sample-repo/
        └── AGENTS.md
```

## Layering

Rules are applied in this order (highest to lowest priority):

1. **Enforcement**: CI checks, linters, typecheck, tests, build pipelines
2. **Domain/folder rules**: Directory-specific overrides
3. **Repo rules**: `AGENTS.md` and `.aialchemylabs/` directory in the repo
4. **Org-wide rules**: `~/.aialchemylabs/packs/` (if installed)
5. **Profile defaults**: Pack combinations defined in profiles

See `packs/core/RULES.md` for the full conflict resolution policy.

## Conflict resolution

When multiple rule sources apply:

1. **Enforcement wins**: CI/lint/tests override written guidance
2. **Specific beats general**: Folder rules > repo rules > org rules
3. **Repo overrides org**: Repo's `AGENTS.md` and `.aialchemylabs/` override `~/.aialchemylabs/`
4. **Profile decides toolchain**: `bun-stack` → Bun, `node-stack` → Node/pnpm/Vite
5. **Match the repo**: If repo already chose a toolchain, follow it

## Profiles

### bun-stack

- `packs/core` — Universal agent behavior
- `packs/bun-first` — Bun toolchain (bun install/test/build/serve)
- `packs/typescript` — TypeScript strictness
- `packs/ai-alchemy-standards` — Coding standards

**Toolchain**: Bun, `bun:sqlite`, `Bun.redis`, `Bun.sql`, `Bun.serve()`, HTML imports

### node-stack

- `packs/core` — Universal agent behavior
- `packs/typescript` — TypeScript strictness
- `packs/ai-alchemy-standards` — Coding standards

**Toolchain**: Node.js, pnpm (preferred), Vite, Jest/Vitest, Express

### mobile-stack

- `packs/core` — Universal agent behavior
- `packs/android` — Android/Kotlin standards
- `packs/ios` — iOS/Swift standards
- `packs/ai-alchemy-standards` — Coding standards

**Toolchain**: Kotlin, Gradle, Android SDK / Swift, Xcode, SPM/CocoaPods

## Tool adapters

### Cursor

From your consuming repo, copy adapter files from your `ai-agentic-rules` clone:

```bash
mkdir -p .cursor/rules
cp /path/to/ai-agentic-rules/adapters/cursor/rules/*.mdc .cursor/rules/
```

The adapters point to `AGENTS.md` and installed packs.

### VS Code Copilot

See `adapters/vscode-copilot/copilot-instructions.md` for setup instructions.

### Kiro

See `adapters/kiro/project.md` for configuration.

### Gemini/Antigravity

See `adapters/antigravity-gemini/GEMINI.md` for `@include` usage.

## Legacy single-file rules

For tools that can only accept a single rule file, use these legacy summaries:

- `bun-first.md` — Bun-first toolchain guidance
- `coding-standards.md` — AI Alchemy coding standards

Prefer the pack versions under `packs/` for new setups.

## Local validation

### Test install script

```bash
# Dry run (check what would be installed)
./install/install-to-home.sh --dry-run

# Install packs
./install/install-to-home.sh

# Verify packs are installed
ls -la ~/.aialchemylabs/packs/

# Check backups (if any files were overwritten)
ls -la ~/.aialchemylabs/.backup-*/
```

### Verify structure

```bash
# Check all required files exist
find packs adapters install examples -type f | sort

# Verify scripts are executable
test -x install/install-to-home.sh && echo "✓ install script is executable"
test -x install/update.sh && echo "✓ update script is executable"
```

## How a consuming repo uses this

1. **Install packs** (optional, for org-wide use):
   ```bash
   git clone https://github.com/your-org/ai-agentic-rules.git
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
   - Load profile packs from `~/.aialchemylabs/packs/` or repo's `.aialchemylabs/`
   - Apply repo-specific overrides
   - Follow conflict resolution policy

## License

MIT License — see `LICENSE` file.

## Contributing

This repository provides public-safe, tool-agnostic rule packs. Contributions should:

- Be explicit, testable, and short
- Avoid tool lock-in
- Include conflict resolution notes when introducing new packs
- Keep each `RULES.md` under ~200-300 lines
