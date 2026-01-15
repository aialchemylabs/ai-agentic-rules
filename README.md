# ai-agentic-rules

Universal, tool-agnostic instruction packs for AI coding agents, plus tool-specific adapters.

## What is this?

A modular system for defining how AI coding agents (and humans) should work in your codebase. Rules are organized into **packs** that can be combined via **profiles**, with explicit conflict resolution.

## Philosophy

- **Layered**: Org-wide (`~/.ai-coding-rules/`) → Repo (`AGENTS.md`) → Domain/folder rules
- **Tool-agnostic**: Canonical rules live in packs; adapters are thin pointers
- **Composable**: Mix and match packs via profiles
- **Explicit conflicts**: Clear policy for resolving toolchain and rule conflicts
- **Public-safe**: No secrets, no internal URLs, no client names

## Quick start

### Option 1: Interactive CLI (Recommended)

The easiest way to get started is using the interactive CLI:

```bash
npx ai-coding-rules init
```

This will:
1. Download the latest rules and adapters from GitHub (no bundled files)
2. Silently overwrite `~/.ai-coding-rules/` with the latest packs
3. Prompt you to select a profile (bun-stack, node-stack, or mobile-stack)
4. Prompt you to select which AI tools you use (Cursor, VS Code Copilot, Kiro, Gemini)
5. Create `AGENTS.md` in your current repo (overwrites silently)
6. Configure your selected tools automatically

### Option 2: Remote installer script

Install directly from GitHub without cloning:

```bash
curl -fsSL https://raw.githubusercontent.com/aialchemylabs/ai-agentic-rules/main/install/install-from-remote.sh | bash
```

Then run `npx ai-coding-rules init` in your repo to configure it.

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

## Key decisions

- **Silent overwrite**: No prompts or backups; `~/.ai-coding-rules/` and `AGENTS.md` are replaced.
- **Multi-select IDEs**: Configure multiple tools in one run.
- **Profile selection**: Included in the CLI flow.
- **GitHub as source**: Always downloads from the current repo/branch; no bundled files.
- **Sponsor CTA**: Prints a "Buy us a coffee" message at the end of successful setup.

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
2. **Domain/folder rules**: Directory-specific overrides
3. **Repo rules**: `AGENTS.md` and `.ai-coding-rules/` directory in the repo
4. **Org-wide rules**: `~/.ai-coding-rules/packs/` (if installed)
5. **Profile defaults**: Pack combinations defined in profiles

See `packs/core/RULES.md` for the full conflict resolution policy.

## Conflict resolution

When multiple rule sources apply:

1. **Enforcement wins**: CI/lint/tests override written guidance
2. **Specific beats general**: Folder rules > repo rules > org rules
3. **Repo overrides org**: Repo's `AGENTS.md` and `.ai-coding-rules/` override `~/.ai-coding-rules/`
4. **Profile decides toolchain**: `bun-stack` → Bun, `node-stack` → Node/pnpm/Vite
5. **Match the repo**: If repo already chose a toolchain, follow it

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

## Local validation

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

## How a consuming repo uses this

### Using the CLI (Recommended)

```bash
# In your repo root
npx ai-coding-rules init
```

This automatically:
- Downloads the latest rules and adapters from GitHub (no bundled files)
- Silently overwrites `~/.ai-coding-rules/` and `AGENTS.md`
- Creates `AGENTS.md` with your selected profile
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
   - Apply repo-specific overrides
   - Follow conflict resolution policy

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
