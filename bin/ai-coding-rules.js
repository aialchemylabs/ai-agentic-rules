#!/usr/bin/env node
/**
 * ai-coding-rules CLI
 * Interactive installer for AI coding rules
 */

import { createWriteStream, createReadStream, mkdirSync, rmSync, cpSync, readFileSync, writeFileSync, existsSync, readdirSync } from 'fs';
import { join } from 'path';
import { pipeline } from 'stream/promises';
import { createGunzip } from 'zlib';
import { extract } from 'tar';
import prompts from 'prompts';

// Configuration
const REPO_OWNER = process.env.AI_CODING_RULES_OWNER || 'aialchemylabs';
const REPO_NAME = process.env.AI_CODING_RULES_REPO || 'ai-agentic-rules';
const REPO_BRANCH = process.env.AI_CODING_RULES_BRANCH || 'main';
const TARGET_DIR = join(process.env.HOME, '.ai-coding-rules');
const TARBALL_URL = `https://github.com/${REPO_OWNER}/${REPO_NAME}/archive/refs/heads/${REPO_BRANCH}.tar.gz`;

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function downloadAndExtract() {
  log('\n📦 Downloading latest rules from GitHub...', 'blue');
  
  const tempDir = join(process.env.TMPDIR || '/tmp', `ai-coding-rules-${Date.now()}`);
  mkdirSync(tempDir, { recursive: true });
  
  try {
    // Download tarball
    const response = await fetch(TARBALL_URL);
    if (!response.ok) {
      throw new Error(`Failed to download: ${response.status} ${response.statusText}`);
    }
    
    // Extract tarball
    const extractPath = join(tempDir, 'repo.tar.gz');
    const writeStream = createWriteStream(extractPath);
    await pipeline(response.body, writeStream);
    
    // Extract tar.gz
    const extractedDir = join(tempDir, 'extracted');
    mkdirSync(extractedDir, { recursive: true });
    
    await pipeline(
      createReadStream(extractPath),
      createGunzip(),
      extract({ cwd: extractedDir })
    );
    
    // Find the extracted repo directory (GitHub tarballs include a root directory)
    const entries = readdirSync(extractedDir, { withFileTypes: true });
    const repoDirEntry = entries.find(e => e.isDirectory() && e.name.startsWith(REPO_NAME));
    
    if (!repoDirEntry) {
      throw new Error('Repository directory not found in downloaded tarball');
    }
    
    const repoDir = join(extractedDir, repoDirEntry.name);
    
    if (!existsSync(join(repoDir, 'packs'))) {
      throw new Error('packs directory not found in downloaded repository');
    }
    
    // Replace ~/.ai-coding-rules completely
    log('📁 Installing to ~/.ai-coding-rules...', 'blue');
    if (existsSync(TARGET_DIR)) {
      rmSync(TARGET_DIR, { recursive: true, force: true });
    }
    mkdirSync(TARGET_DIR, { recursive: true });
    mkdirSync(join(TARGET_DIR, 'packs'), { recursive: true });
    
    // Copy packs
    cpSync(join(repoDir, 'packs'), join(TARGET_DIR, 'packs'), { recursive: true });
    
    log('✅ Rules installed successfully!', 'green');
    return { repoDir, tempDir };
  } catch (error) {
    try {
      rmSync(tempDir, { recursive: true, force: true });
    } catch {}
    throw error;
  }
}


async function promptProfile() {
  const { profile } = await prompts({
    type: 'select',
    name: 'profile',
    message: 'Which stack profile do you want to use?',
    choices: [
      { title: 'Bun Stack (Bun, TypeScript, bun:test)', value: 'bun-stack' },
      { title: 'Node Stack (Node, pnpm, Vite, Jest)', value: 'node-stack' },
      { title: 'Mobile Stack (Android + iOS)', value: 'mobile-stack' },
    ],
    initial: 0,
  });
  
  if (!profile) {
    throw new Error('Setup canceled.');
  }
  
  return profile;
}

async function promptIDEs() {
  const { ides } = await prompts({
    type: 'multiselect',
    name: 'ides',
    message: 'Which AI coding tools do you use? (Space to select, Enter to confirm)',
    choices: [
      { title: 'Cursor', value: 'cursor', selected: false },
      { title: 'VS Code Copilot', value: 'vscode', selected: false },
      { title: 'Kiro', value: 'kiro', selected: false },
      { title: 'Antigravity/Gemini', value: 'gemini', selected: false },
    ],
    min: 1,
  });
  
  if (!ides || ides.length === 0) {
    throw new Error('No tools selected. Setup canceled.');
  }
  
  return ides;
}

function generateAGENTSMD(profile) {
  const profileDescriptions = {
    'bun-stack': {
      packs: [
        '`packs/core` — Universal agent behavior',
        '`packs/bun-first` — Bun toolchain defaults',
        '`packs/typescript` — TypeScript standards',
        '`packs/ai-coding-standards` — Coding standards',
      ],
      toolchain: 'Bun, `bun:sqlite`, `Bun.redis`, `Bun.sql`, `Bun.serve()`, HTML imports',
    },
    'node-stack': {
      packs: [
        '`packs/core` — Universal agent behavior',
        '`packs/typescript` — TypeScript standards',
        '`packs/ai-coding-standards` — Coding standards',
      ],
      toolchain: 'Node.js, pnpm (preferred), Vite, Jest/Vitest, Express',
    },
    'mobile-stack': {
      packs: [
        '`packs/core` — Universal agent behavior',
        '`packs/android` — Android/Kotlin standards',
        '`packs/ios` — iOS/Swift standards',
        '`packs/ai-coding-standards` — Coding standards',
      ],
      toolchain: 'Kotlin, Gradle, Android SDK / Swift, Xcode, SPM/CocoaPods',
    },
  };
  
  const desc = profileDescriptions[profile];
  
  return `# Agent Rules for This Repository

This file is the **canonical entry point** for AI coding agents working in this repo.

## Profile

**Profile**: \`${profile}\`

This means agents should load:
${desc.packs.map(p => `- ${p}`).join('\n')}

## Pack sources (priority order)

1. **Repo-specific rules** (this file and \`.ai-coding-rules/\` directory)
2. **Org-wide rules** (\`~/.ai-coding-rules/packs/\` if installed)
3. **Profile defaults** (from the GitHub repository)

## Toolchain

**Toolchain**: ${desc.toolchain}

## Conflict resolution

When rules conflict:
1. **Enforcement wins**: CI/lint/tests override written guidance
2. **This file** overrides org-wide packs (\`~/.ai-coding-rules/\`)
3. **Profile selection** (\`${profile}\`) decides toolchain
4. **Existing repo patterns** take precedence unless explicitly migrating

## How agents should use this

1. Read this file first
2. Load the selected profile's packs (from \`~/.ai-coding-rules/packs/\` or repo's \`.ai-coding-rules/\` directory)
3. Apply repo-specific overrides from this file
4. Follow domain-specific rules for the current directory
5. When uncertain, choose the option that changes less and matches existing patterns
`;
}

async function configureCursor(repoRoot, sourceRepoRoot) {
  const cursorRulesDir = join(repoRoot, '.cursor', 'rules');
  mkdirSync(cursorRulesDir, { recursive: true });
  
  const adapterSource = join(sourceRepoRoot, 'adapters', 'cursor', 'rules');
  if (existsSync(adapterSource)) {
    cpSync(adapterSource, cursorRulesDir, { recursive: true });
    log('✅ Cursor adapter configured at .cursor/rules/', 'green');
  } else {
    log('⚠️  Cursor adapter files not found', 'yellow');
  }
}

async function configureVSCode(repoRoot) {
  const vscodeDir = join(repoRoot, '.vscode');
  mkdirSync(vscodeDir, { recursive: true });
  
  const settingsPath = join(vscodeDir, 'settings.json');
  const customInstructions = 'Follow the rules defined in AGENTS.md in the repo root. If AGENTS.md references packs, load them from ~/.ai-coding-rules/packs/ or from the repo\'s .ai-coding-rules/ directory.';
  
  let settings = {};
  if (existsSync(settingsPath)) {
    try {
      settings = JSON.parse(readFileSync(settingsPath, 'utf8'));
    } catch (e) {
      log('Warning: .vscode/settings.json is invalid JSON. Overwriting with new settings.', 'yellow');
      settings = {};
    }
  }
  
  settings['github.copilot.editor.enableAutoCompletions'] = true;
  settings['github.copilot.advanced'] = {
    customInstructions: customInstructions,
  };
  
  writeFileSync(settingsPath, JSON.stringify(settings, null, 2) + '\n');
  log('✅ VS Code Copilot configured in .vscode/settings.json', 'green');
}

async function configureKiro(repoRoot, sourceRepoRoot) {
  const kiroDir = join(repoRoot, '.kiro', 'steering');
  mkdirSync(kiroDir, { recursive: true });
  
  const adapterSource = join(sourceRepoRoot, 'adapters', 'kiro', 'project.md');
  if (existsSync(adapterSource)) {
    cpSync(adapterSource, join(kiroDir, 'project.md'));
    log('✅ Kiro adapter configured at .kiro/steering/project.md', 'green');
  } else {
    log('⚠️  Kiro adapter file not found', 'yellow');
  }
}

async function configureGemini(repoRoot, sourceRepoRoot) {
  const adapterSource = join(sourceRepoRoot, 'adapters', 'antigravity-gemini', 'GEMINI.md');
  if (existsSync(adapterSource)) {
    cpSync(adapterSource, join(repoRoot, 'GEMINI.md'));
    log('✅ Gemini adapter configured at GEMINI.md', 'green');
  } else {
    log('⚠️  Gemini adapter file not found', 'yellow');
  }
}

async function main() {
  const command = process.argv[2];
  
  if (command === 'init') {
    log('\n🚀 Welcome to AI Coding Rules Setup!', 'green');
    log('This will install the latest rules and configure your repository.\n', 'blue');
    
    let downloadContext;
    try {
      // Download and install rules
      downloadContext = await downloadAndExtract();
      const sourceRepoRoot = downloadContext.repoDir;
      
      // Get current working directory (repo root)
      const repoRoot = process.cwd();
      
      // Prompt for profile
      const profile = await promptProfile();
      
      // Prompt for IDEs
      const ides = await promptIDEs();
      
      // Write AGENTS.md
      log('\n📝 Creating AGENTS.md...', 'blue');
      const agentsContent = generateAGENTSMD(profile);
      writeFileSync(join(repoRoot, 'AGENTS.md'), agentsContent);
      log('✅ AGENTS.md created', 'green');
      
      // Configure selected tools
      log('\n🔧 Configuring selected tools...', 'blue');
      if (ides.includes('cursor')) {
        await configureCursor(repoRoot, sourceRepoRoot);
      }
      if (ides.includes('vscode')) {
        await configureVSCode(repoRoot);
      }
      if (ides.includes('kiro')) {
        await configureKiro(repoRoot, sourceRepoRoot);
      }
      if (ides.includes('gemini')) {
        await configureGemini(repoRoot, sourceRepoRoot);
      }
      
      // Success message
      log('\n✨ Setup complete!', 'green');
      log('\nYour repository is now configured with AI coding rules.', 'blue');
      log('Agents will read AGENTS.md and load packs from ~/.ai-coding-rules/packs/', 'blue');
      
      // Sponsor CTA
      log('\n💡 Buy us a coffee:', 'yellow');
      log('https://github.com/sponsors/aialchemylabs', 'green');
      
    } catch (error) {
      log(`\n❌ Error: ${error.message}`, 'red');
      process.exitCode = 1;
    } finally {
      if (downloadContext?.tempDir) {
        try {
          rmSync(downloadContext.tempDir, { recursive: true, force: true });
        } catch {}
      }
    }
  } else {
    log('Usage: ai-coding-rules init', 'yellow');
    process.exit(1);
  }
}

main().catch((error) => {
  log(`\n❌ Unexpected error: ${error.message}`, 'red');
  process.exit(1);
});
