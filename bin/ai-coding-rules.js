#!/usr/bin/env node
/**
 * ai-coding-rules CLI
 * Interactive installer for AI coding rules with composition, modes, and planning
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
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✔ ${message}`, 'green');
}

function logWarning(message) {
  log(`⚠ ${message}`, 'yellow');
}

function logError(message) {
  log(`✖ ${message}`, 'red');
}

function logInfo(message) {
  log(`ℹ ${message}`, 'cyan');
}

// Parse CLI arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const command = args[0];
  const options = {};
  
  for (let i = 1; i < args.length; i++) {
    const arg = args[i];
    if (arg.startsWith('--')) {
      const [key, value] = arg.slice(2).split('=');
      options[key] = value || true;
    }
  }
  
  return { command, options };
}

function parseToolsOption(toolsOption) {
  if (!toolsOption || typeof toolsOption !== 'string') {
    return [];
  }
  return toolsOption
    .split(',')
    .map(tool => tool.trim())
    .filter(Boolean);
}

// Rule pack metadata types
const PACK_TYPES = {
  core: 'core',
  opinionated: 'opinionated',
  org: 'org',
  experimental: 'experimental',
};

// Load pack metadata
function loadPackMetadata(sourceRepoRoot, packName) {
  const metadataPath = join(sourceRepoRoot, 'packs', packName, 'metadata.json');
  if (existsSync(metadataPath)) {
    try {
      return JSON.parse(readFileSync(metadataPath, 'utf8'));
    } catch (e) {
      logWarning(`Could not load metadata for pack: ${packName}`);
    }
  }
  return { name: packName, type: 'core', mutable: false };
}

function loadPackMetadataFromDir(packsDir, packName) {
  const metadataPath = join(packsDir, packName, 'metadata.json');
  if (existsSync(metadataPath)) {
    try {
      return JSON.parse(readFileSync(metadataPath, 'utf8'));
    } catch (e) {
      logWarning(`Could not load metadata for pack: ${packName}`);
    }
  }
  return { name: packName, type: 'core', mutable: false };
}

// Profile definitions with pack lists
const PROFILES = {
  'bun-stack': {
    packs: ['core', 'bun-first', 'typescript', 'ai-coding-standards'],
    toolchain: 'Bun, `bun:sqlite`, `Bun.redis`, `Bun.sql`, `Bun.serve()`, HTML imports',
  },
  'node-stack': {
    packs: ['core', 'typescript', 'ai-coding-standards'],
    toolchain: 'Node.js, pnpm (preferred), Vite, Jest/Vitest, Express',
  },
  'mobile-stack': {
    packs: ['core', 'android', 'ios', 'ai-coding-standards'],
    toolchain: 'Kotlin, Gradle, Android SDK / Swift, Xcode, SPM/CocoaPods',
  },
};

function listPacksFromDir(packsDir) {
  if (!existsSync(packsDir)) {
    return [];
  }
  return readdirSync(packsDir, { withFileTypes: true })
    .filter(entry => entry.isDirectory())
    .map(entry => entry.name);
}

function resolveRuleModel({ repoRoot, sourceRepoRoot, profile }) {
  const precedence = {
    org: 4,
    repo: 3,
    folder: 2,
    local: 1,
    profile: 0,
  };

  const sources = [];
  const orgPacksDir = join(process.env.HOME || '', '.ai-coding-rules', 'packs');
  const repoPacksDir = join(repoRoot, '.ai-coding-rules', 'packs');
  const localContextExists = existsSync(join(repoRoot, 'AGENTS.local.md'));

  if (existsSync(orgPacksDir)) {
    sources.push({ id: 'org', packsDir: orgPacksDir, precedence: precedence.org });
  }
  if (existsSync(repoPacksDir)) {
    sources.push({ id: 'repo', packsDir: repoPacksDir, precedence: precedence.repo });
  }

  const profilePacks = PROFILES[profile]?.packs || [];

  const packIndex = new Map();
  sources.forEach(source => {
    const packNames = listPacksFromDir(source.packsDir);
    packNames.forEach(packName => {
      if (!packIndex.has(packName)) {
        packIndex.set(packName, []);
      }
      packIndex.get(packName).push({
        source: source.id,
        packsDir: source.packsDir,
        precedence: source.precedence,
      });
    });
  });

  profilePacks.forEach(packName => {
    if (!packIndex.has(packName)) {
      packIndex.set(packName, []);
    }
    packIndex.get(packName).push({
      source: 'profile',
      packsDir: join(sourceRepoRoot, 'packs'),
      precedence: precedence.profile,
    });
  });

  const resolvedPacks = [];
  const conflicts = [];

  packIndex.forEach((entries, packName) => {
    const sorted = [...entries].sort((a, b) => b.precedence - a.precedence);
    const winner = sorted[0];
    const metadata = loadPackMetadataFromDir(winner.packsDir, packName);
    resolvedPacks.push({
      name: packName,
      source: winner.source,
      type: metadata.type || 'core',
      mutable: metadata.mutable ?? false,
      description: metadata.description || packName,
    });

    if (entries.length > 1) {
      const sourcesList = entries.map(entry => entry.source).join(' > ');
      conflicts.push({
        packName,
        sources: entries.map(entry => entry.source),
        winner: winner.source,
        reason: `Resolved by precedence (${sourcesList})`,
      });
    }
  });

  resolvedPacks.sort((a, b) => a.name.localeCompare(b.name));

  return {
    resolvedPacks,
    conflicts,
    sourcesUsed: sources.map(source => source.id),
    localContextExists,
    precedence,
  };
}

async function downloadAndExtract({ installToHome = true } = {}) {
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
    
    if (installToHome) {
      // Replace ~/.ai-coding-rules completely
      log('📁 Installing to ~/.ai-coding-rules...', 'blue');
      if (existsSync(TARGET_DIR)) {
        rmSync(TARGET_DIR, { recursive: true, force: true });
      }
      mkdirSync(TARGET_DIR, { recursive: true });
      mkdirSync(join(TARGET_DIR, 'packs'), { recursive: true });
      
      // Copy packs
      cpSync(join(repoDir, 'packs'), join(TARGET_DIR, 'packs'), { recursive: true });
      
      logSuccess('Rules installed successfully!');
    } else {
      logInfo('Skipping installation to ~/.ai-coding-rules (no-write mode)');
    }
    return { repoDir, tempDir };
  } catch (error) {
    try {
      rmSync(tempDir, { recursive: true, force: true });
    } catch {}
    throw error;
  }
}

async function promptProfile(presetProfile) {
  if (presetProfile) {
    if (!PROFILES[presetProfile]) {
      throw new Error(`Invalid profile: ${presetProfile}`);
    }
    return presetProfile;
  }
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

async function promptIDEs(presetIdes) {
  if (presetIdes && presetIdes.length > 0) {
    return presetIdes;
  }
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

// Generate AGENTS.rules.md (system-managed)
function generateAGENTSRulesMD(profile, sourceRepoRoot, ruleModel) {
  const profileData = PROFILES[profile];
  const resolvedPacks = ruleModel?.resolvedPacks?.length
    ? ruleModel.resolvedPacks
    : profileData.packs.map(packName => {
      const metadata = loadPackMetadata(sourceRepoRoot, packName);
      return {
        name: packName,
        source: 'profile',
        type: metadata.type || 'core',
        mutable: metadata.mutable ?? false,
        description: metadata.description || packName,
      };
    });

  const packs = resolvedPacks.map(pack => {
    return `- \`packs/${pack.name}\` — ${pack.description} (${pack.source})`;
  }).join('\n');

  const conflictsSection = ruleModel?.conflicts?.length
    ? ruleModel.conflicts.map(conflict => `- ${conflict.packName}: ${conflict.reason} → ${conflict.winner}`)
        .join('\n')
    : '- No conflicts detected.';
  
  return `# Governance Rules (Auto-generated)

<!-- DO NOT EDIT THIS FILE -->
<!-- This file is managed by AI Agentic Rules and will be overwritten on updates -->
<!-- For project-specific context, edit AGENTS.local.md -->

## Profile

**Profile**: \`${profile}\`

This profile loads the following rule packs:

${packs}

## Toolchain

**Toolchain**: ${profileData.toolchain}

## Pack Sources (Priority Order)

1. **Org-wide rules** (\`~/.ai-coding-rules/packs/\` if installed)
2. **Repo-specific rules** (\`.ai-coding-rules/\` directory)
3. **Folder-specific rules** (if present)
4. **Local context** (\`AGENTS.local.md\`)
5. **Profile defaults** (from the GitHub repository)

## Conflict Resolution

When rules conflict, the system resolves them in this order:

1. **Enforcement wins**: CI checks, linters, typecheck, tests, build pipelines, and security scanners **override** written guidance.
2. **Specific beats general**:
  - Folder/domain rules override repo-root rules.
3. **Org overrides repo overrides folder overrides local**:
  - Org/global packs take precedence over repo packs.
  - Repo packs take precedence over folder rules.
  - Folder rules take precedence over local context.
4. **Profile decides toolchain**:
   - If the selected profile is **bun-stack**, prefer Bun tooling and Bun-native APIs.
   - If the selected profile is **node-stack**, prefer Node/pnpm/Vite/Jest/Express.
   - If the selected profile is **mobile-stack**, prefer Android/iOS platform conventions.
5. **Match the repo**: if the repo already chose a toolchain, follow it even if it differs from a profile default.

**Precedence rule**: \`org > repo > folder > local\`

## Resolved Packs (Effective)

${packs}

## Conflict Decisions

${conflictsSection}

## How Agents Should Use This

1. Read AGENTS.md (the entry point)
2. Load the selected profile's packs (from \`~/.ai-coding-rules/packs/\` or repo's \`.ai-coding-rules/\` directory)
3. Apply repo-specific overrides from AGENTS.local.md
4. Follow domain-specific rules for the current directory
5. When uncertain, choose the option that changes less and matches existing patterns

---

*Generated by AI Agentic Rules. Last updated: ${new Date().toISOString()}*
`;
}

// Generate AGENTS.local.md (human-managed)
function generateAGENTSLocalMD() {
  return `# Project Context (Human-maintained)

<!-- This file is never overwritten by AI Agentic Rules -->
<!-- Add your project-specific context, guidance, and rules here -->

## Project Overview

Describe your project here:
- What does this project do?
- What are the key features?
- Who is the target audience?

## Project-Specific Rules

Add any rules that are specific to this project:
- Architecture decisions
- Coding conventions specific to this project
- Third-party libraries and their usage patterns
- Deployment considerations

## Domain-Specific Rules

Add rules for specific domains or directories:
- \`frontend/\` — frontend-specific rules
- \`backend/\` — backend-specific rules
- \`tests/\` — testing conventions

## Team Guidelines

Add team-specific guidelines:
- Code review process
- Release process
- Communication channels

---

*Edit this file to add project-specific context. AI Agentic Rules will never overwrite it.*
`;
}

// Generate AGENTS.md (entry point)
function generateAGENTSMD() {
  return `# Agent Context

This file is the **canonical entry point** for AI coding agents working in this repo.

## Governance Rules (Auto-generated)

<!-- DO NOT EDIT -->
See: ./AGENTS.rules.md

## Project Context (Human-maintained)

See: ./AGENTS.local.md

---

## File Ownership

| File | Owner | Overwritten by CLI |
|------|-------|-------------------|
| AGENTS.md | Shared | Only if missing |
| AGENTS.rules.md | System | Yes |
| AGENTS.local.md | Human | Never |

**Note**: AGENTS.local.md is your space for project-specific context. It will never be overwritten.
`;
}

// Check what files exist and what would be done
function checkFileState(repoRoot) {
  const agentsMD = existsSync(join(repoRoot, 'AGENTS.md'));
  const agentsRulesMD = existsSync(join(repoRoot, 'AGENTS.rules.md'));
  const agentsLocalMD = existsSync(join(repoRoot, 'AGENTS.local.md'));
  
  return {
    agentsMD,
    agentsRulesMD,
    agentsLocalMD,
  };
}

// Plan mode: show what would happen without making changes
async function planMode(repoRoot, sourceRepoRoot, profile, ides) {
  log('\n📋 Plan Mode: Showing what would change (no writes)\n', 'cyan');
  
  const fileState = checkFileState(repoRoot);
  const toCreate = [];
  const toUpdate = [];
  const untouched = [];
  const warnings = [];
  const ruleModel = resolveRuleModel({ repoRoot, sourceRepoRoot, profile });
  
  // Check AGENTS.md
  if (!fileState.agentsMD) {
    toCreate.push('AGENTS.md (entry point)');
  } else {
    untouched.push('AGENTS.md (already exists)');
  }
  
  // Check AGENTS.rules.md
  if (!fileState.agentsRulesMD) {
    toCreate.push('AGENTS.rules.md (governance rules)');
  } else {
    toUpdate.push('AGENTS.rules.md (governance rules)');
  }
  
  // Check AGENTS.local.md
  if (!fileState.agentsLocalMD) {
    toCreate.push('AGENTS.local.md (project context)');
  } else {
    untouched.push('AGENTS.local.md (never overwritten)');
  }
  
  // Check adapters
  if (ides.includes('cursor')) {
    const cursorDir = join(repoRoot, '.cursor', 'rules');
    if (existsSync(cursorDir)) {
      toUpdate.push('.cursor/rules/');
    } else {
      toCreate.push('.cursor/rules/');
    }
  }
  
  if (ides.includes('vscode')) {
    const vscodeSettings = join(repoRoot, '.vscode', 'settings.json');
    if (existsSync(vscodeSettings)) {
      toUpdate.push('.vscode/settings.json');
    } else {
      toCreate.push('.vscode/settings.json');
    }
  }
  
  if (ides.includes('kiro')) {
    const kiroDir = join(repoRoot, '.kiro', 'steering');
    if (existsSync(kiroDir)) {
      toUpdate.push('.kiro/steering/project.md');
    } else {
      toCreate.push('.kiro/steering/project.md');
    }
  }
  
  if (ides.includes('gemini')) {
    const geminiMD = join(repoRoot, 'GEMINI.md');
    if (existsSync(geminiMD)) {
      toUpdate.push('GEMINI.md');
    } else {
      toCreate.push('GEMINI.md');
    }
  }
  
  // Display plan
  log('\nPlanned Changes:', 'cyan');
  if (toCreate.length > 0) {
    log('Files to be created:', 'blue');
    toCreate.forEach(item => logSuccess(`Will create: ${item}`));
  }
  if (toUpdate.length > 0) {
    log('Files to be modified:', 'blue');
    toUpdate.forEach(item => logSuccess(`Will update: ${item}`));
  }
  if (untouched.length > 0) {
    log('Files untouched:', 'blue');
    untouched.forEach(item => logSuccess(`No changes to: ${item}`));
  }
  
  // Display rule packs to be applied
  log('\nRule Packs to Apply:', 'cyan');
  ruleModel.resolvedPacks.forEach(pack => {
    const typeLabel = pack.type === 'core' ? 'core' : pack.type;
    log(`  • ${pack.name} (${typeLabel}) — ${pack.source}`, 'blue');
  });

  // Display conflict resolution decisions
  log('\nConflict Resolution Decisions:', 'cyan');
  if (ruleModel.conflicts.length === 0) {
    logSuccess('No conflicts detected');
  } else {
    ruleModel.conflicts.forEach(conflict => {
      logWarning(`${conflict.packName}: ${conflict.reason} → ${conflict.winner}`);
    });
  }
  
  // Display warnings
  if (warnings.length > 0) {
    log('\nWarnings:', 'yellow');
    warnings.forEach(warning => {
      logWarning(warning);
    });
  }
  
  // Display file ownership
  log('\nFile Ownership:', 'cyan');
  log('  AGENTS.md       → Shared (only created if missing)', 'blue');
  log('  AGENTS.rules.md → System (will be overwritten)', 'blue');
  log('  AGENTS.local.md → Human (never overwritten)', 'blue');
  
  log('\n✓ Plan complete. No files were written.\n', 'green');
}

// Check mode: validate without making changes
async function checkMode(repoRoot, sourceRepoRoot, profile, ides) {
  log('\n🔍 Check Mode: Validating rule resolution\n', 'cyan');
  
  const fileState = checkFileState(repoRoot);
  let hasErrors = false;
  const ruleModel = resolveRuleModel({ repoRoot, sourceRepoRoot, profile });
  
  // Check for conflicts
  if (fileState.agentsMD && fileState.agentsRulesMD) {
    logInfo('Both AGENTS.md and AGENTS.rules.md exist - composition mode active');
  }
  
  // Validate profile
  if (!PROFILES[profile]) {
    logError(`Invalid profile: ${profile}`);
    hasErrors = true;
  } else {
    logSuccess(`Profile valid: ${profile}`);
  }
  
  // Check pack availability
  const profileData = PROFILES[profile];
  log('\nChecking pack availability:', 'cyan');
  if (profileData?.packs?.length) {
    profileData.packs.forEach(packName => {
      const packPath = join(sourceRepoRoot, 'packs', packName, 'RULES.md');
      if (existsSync(packPath)) {
        logSuccess(`  ${packName} - available`);
      } else {
        logError(`  ${packName} - not found`);
        hasErrors = true;
      }
    });
  } else {
    logWarning('  No packs resolved (invalid profile)');
  }
  
  // Check adapter availability
  log('\nChecking adapter availability:', 'cyan');
  if (ides.includes('cursor')) {
    const adapterPath = join(sourceRepoRoot, 'adapters', 'cursor', 'rules');
    if (existsSync(adapterPath)) {
      logSuccess('  Cursor adapter - available');
    } else {
      logWarning('  Cursor adapter - not found');
    }
  }
  
  if (ides.includes('vscode')) {
    logSuccess('  VS Code Copilot adapter - available (generated)');
  }
  
  if (ides.includes('kiro')) {
    const adapterPath = join(sourceRepoRoot, 'adapters', 'kiro', 'project.md');
    if (existsSync(adapterPath)) {
      logSuccess('  Kiro adapter - available');
    } else {
      logWarning('  Kiro adapter - not found');
    }
  }
  
  if (ides.includes('gemini')) {
    const adapterPath = join(sourceRepoRoot, 'adapters', 'antigravity-gemini', 'GEMINI.md');
    if (existsSync(adapterPath)) {
      logSuccess('  Gemini adapter - available');
    } else {
      logWarning('  Gemini adapter - not found');
    }
  }
  
  // Display conflict resolution
  log('\nConflict Resolution Order:', 'cyan');
  log('  1. org > repo > folder > local', 'blue');
  log('  2. Enforcement wins (CI/lint/tests)', 'blue');
  log('  3. Specific beats general', 'blue');
  log('  4. Profile defaults (lowest priority)', 'blue');

  log('\nConflict Resolution Decisions:', 'cyan');
  if (ruleModel.conflicts.length === 0) {
    logSuccess('No conflicts detected');
  } else {
    ruleModel.conflicts.forEach(conflict => {
      logWarning(`${conflict.packName}: ${conflict.reason} → ${conflict.winner}`);
    });
    hasErrors = true;
  }
  
  if (hasErrors) {
    log('\n✖ Validation failed with errors\n', 'red');
    process.exit(1);
  } else {
    log('\n✓ Validation passed\n', 'green');
  }
}

// Compose mode: create/update files without overwriting human content
async function composeMode(repoRoot, sourceRepoRoot, profile, ides) {
  log('\n🔧 Compose Mode: Creating/updating files\n', 'cyan');
  
  const fileState = checkFileState(repoRoot);
  const ruleModel = resolveRuleModel({ repoRoot, sourceRepoRoot, profile });
  
  // Create AGENTS.md only if missing
  if (!fileState.agentsMD) {
    log('\n📝 Creating AGENTS.md...', 'blue');
    const agentsContent = generateAGENTSMD();
    writeFileSync(join(repoRoot, 'AGENTS.md'), agentsContent);
    logSuccess('AGENTS.md created');
  } else {
    log('\n📝 AGENTS.md already exists, preserving it...', 'blue');
    logSuccess('AGENTS.md preserved');
  }
  
  // Create/update AGENTS.rules.md
  log('\n📝 Creating/updating AGENTS.rules.md...', 'blue');
  const agentsRulesContent = generateAGENTSRulesMD(profile, sourceRepoRoot, ruleModel);
  writeFileSync(join(repoRoot, 'AGENTS.rules.md'), agentsRulesContent);
  logSuccess('AGENTS.rules.md updated');
  
  // Create AGENTS.local.md only if missing
  if (!fileState.agentsLocalMD) {
    log('\n📝 Creating AGENTS.local.md...', 'blue');
    const agentsLocalContent = generateAGENTSLocalMD();
    writeFileSync(join(repoRoot, 'AGENTS.local.md'), agentsLocalContent);
    logSuccess('AGENTS.local.md created');
  } else {
    log('\n📝 AGENTS.local.md already exists, preserving it...', 'blue');
    logSuccess('AGENTS.local.md preserved');
  }
  
  // Configure adapters
  log('\n🔧 Configuring selected tools...', 'blue');
  if (ides.includes('cursor')) {
    await configureCursor(repoRoot, sourceRepoRoot, ruleModel);
  }
  if (ides.includes('vscode')) {
    await configureVSCode(repoRoot, ruleModel);
  }
  if (ides.includes('kiro')) {
    await configureKiro(repoRoot, sourceRepoRoot, ruleModel);
  }
  if (ides.includes('gemini')) {
    await configureGemini(repoRoot, sourceRepoRoot, ruleModel);
  }
  
  // Display summary
  log('\n✨ Setup complete!', 'green');
  log('\nFile Ownership Summary:', 'cyan');
  log('  AGENTS.md       → Shared (only created if missing)', 'blue');
  log('  AGENTS.rules.md → System (will be overwritten on updates)', 'blue');
  log('  AGENTS.local.md → Human (never overwritten)', 'blue');
  
  log('\n💡 Tip: Edit AGENTS.local.md to add project-specific context.', 'yellow');
  log('   It will never be overwritten by AI Agentic Rules.\n', 'yellow');
}

// Replace mode: fully regenerate AGENTS.md (requires confirmation)
async function replaceMode(repoRoot, sourceRepoRoot, profile, ides) {
  log('\n⚠️  Replace Mode: Will regenerate AGENTS.md\n', 'yellow');
  
  const fileState = checkFileState(repoRoot);
  const ruleModel = resolveRuleModel({ repoRoot, sourceRepoRoot, profile });
  
  if (fileState.agentsMD) {
    logWarning('AGENTS.md already exists and will be overwritten!');
    logWarning('Any custom content in AGENTS.md will be lost.');
    
    const { confirm } = await prompts({
      type: 'confirm',
      name: 'confirm',
      message: 'Are you sure you want to overwrite AGENTS.md?',
      initial: false,
    });
    
    if (!confirm) {
      log('\n❌ Replace mode canceled.\n', 'red');
      process.exit(0);
    }
  }
  
  // Create AGENTS.md (full version with all content)
  log('\n📝 Creating AGENTS.md...', 'blue');
  const agentsContent = generateAGENTSMD();
  writeFileSync(join(repoRoot, 'AGENTS.md'), agentsContent);
  logSuccess('AGENTS.md created');
  
  // Create/update AGENTS.rules.md
  log('\n📝 Creating/updating AGENTS.rules.md...', 'blue');
  const agentsRulesContent = generateAGENTSRulesMD(profile, sourceRepoRoot, ruleModel);
  writeFileSync(join(repoRoot, 'AGENTS.rules.md'), agentsRulesContent);
  logSuccess('AGENTS.rules.md updated');
  
  // Create AGENTS.local.md only if missing
  if (!fileState.agentsLocalMD) {
    log('\n📝 Creating AGENTS.local.md...', 'blue');
    const agentsLocalContent = generateAGENTSLocalMD();
    writeFileSync(join(repoRoot, 'AGENTS.local.md'), agentsLocalContent);
    logSuccess('AGENTS.local.md created');
  } else {
    log('\n📝 AGENTS.local.md already exists, preserving it...', 'blue');
    logSuccess('AGENTS.local.md preserved');
  }
  
  // Configure adapters
  log('\n🔧 Configuring selected tools...', 'blue');
  if (ides.includes('cursor')) {
    await configureCursor(repoRoot, sourceRepoRoot, ruleModel);
  }
  if (ides.includes('vscode')) {
    await configureVSCode(repoRoot, ruleModel);
  }
  if (ides.includes('kiro')) {
    await configureKiro(repoRoot, sourceRepoRoot, ruleModel);
  }
  if (ides.includes('gemini')) {
    await configureGemini(repoRoot, sourceRepoRoot, ruleModel);
  }
  
  // Display summary
  log('\n✨ Setup complete!', 'green');
  log('\nFile Ownership Summary:', 'cyan');
  log('  AGENTS.md       → System (regenerated)', 'blue');
  log('  AGENTS.rules.md → System (will be overwritten on updates)', 'blue');
  log('  AGENTS.local.md → Human (never overwritten)', 'blue');
}

async function configureCursor(repoRoot, sourceRepoRoot, ruleModel) {
  const cursorRulesDir = join(repoRoot, '.cursor', 'rules');
  mkdirSync(cursorRulesDir, { recursive: true });
  
  const adapterSource = join(sourceRepoRoot, 'adapters', 'cursor', 'rules');
  if (existsSync(adapterSource)) {
    cpSync(adapterSource, cursorRulesDir, { recursive: true });
    logSuccess('Cursor adapter applied → .cursor/rules/');
  } else {
    logWarning('Cursor adapter files not found');
  }
}

async function configureVSCode(repoRoot, ruleModel) {
  const vscodeDir = join(repoRoot, '.vscode');
  mkdirSync(vscodeDir, { recursive: true });
  
  const settingsPath = join(vscodeDir, 'settings.json');
  const packSummary = ruleModel?.resolvedPacks?.length
    ? `Resolved packs: ${ruleModel.resolvedPacks.map(pack => `${pack.name} (${pack.source})`).join(', ')}`
    : 'Resolved packs: (profile defaults only)';
  const customInstructions = `Follow the rules defined in AGENTS.md in the repo root. If AGENTS.md references packs, load them from ~/.ai-coding-rules/packs/ or from the repo's .ai-coding-rules/ directory. ${packSummary}`;
  
  let settings = {};
  if (existsSync(settingsPath)) {
    try {
      settings = JSON.parse(readFileSync(settingsPath, 'utf8'));
    } catch (e) {
      logWarning('.vscode/settings.json is invalid JSON. Merging with new settings.');
      settings = {};
    }
  }
  
  settings['github.copilot.editor.enableAutoCompletions'] = true;
  settings['github.copilot.advanced'] = {
    customInstructions: customInstructions,
  };
  
  writeFileSync(settingsPath, JSON.stringify(settings, null, 2) + '\n');
  logSuccess('VS Code Copilot adapter applied → .vscode/settings.json');
}

async function configureKiro(repoRoot, sourceRepoRoot, ruleModel) {
  const kiroDir = join(repoRoot, '.kiro', 'steering');
  mkdirSync(kiroDir, { recursive: true });
  
  const adapterSource = join(sourceRepoRoot, 'adapters', 'kiro', 'project.md');
  if (existsSync(adapterSource)) {
    cpSync(adapterSource, join(kiroDir, 'project.md'));
    logSuccess('Kiro adapter applied → .kiro/steering/project.md');
  } else {
    logWarning('Kiro adapter file not found');
  }
}

async function configureGemini(repoRoot, sourceRepoRoot, ruleModel) {
  const adapterSource = join(sourceRepoRoot, 'adapters', 'antigravity-gemini', 'GEMINI.md');
  if (existsSync(adapterSource)) {
    cpSync(adapterSource, join(repoRoot, 'GEMINI.md'));
    logSuccess('Gemini adapter applied → GEMINI.md');
  } else {
    logWarning('Gemini adapter file not found');
  }
}

// Main CLI logic
async function main() {
  const { command, options } = parseArgs();
  
  if (command === 'init') {
    log('\n🚀 Welcome to AI Coding Rules Setup!', 'green');
    log('This will install the latest rules and configure your repository.\n', 'blue');
    
    // Get mode from options or default to compose
    const mode = options.mode || 'compose';
    
    // Validate mode
    if (!['compose', 'replace', 'check'].includes(mode)) {
      logError(`Invalid mode: ${mode}`);
      log('Valid modes are: compose, replace, check', 'yellow');
      process.exit(1);
    }
    
    logInfo(`Mode: ${mode}\n`);
    
    let downloadContext;
    try {
      // Download and install rules
      const installToHome = mode !== 'check';
      downloadContext = await downloadAndExtract({ installToHome });
      const sourceRepoRoot = downloadContext.repoDir;
      
      // Get current working directory (repo root)
      const repoRoot = process.cwd();
      
      // Resolve profile (optionally from CLI)
      const profile = await promptProfile(options.profile);
      
      // Prompt for IDEs (skip for check mode)
      let ides = [];
      if (mode !== 'check') {
        const presetIdes = parseToolsOption(options.tools);
        ides = await promptIDEs(presetIdes);
      }
      
      // Execute based on mode
      if (mode === 'check') {
        await checkMode(repoRoot, sourceRepoRoot, profile, ides);
      } else if (mode === 'compose') {
        await composeMode(repoRoot, sourceRepoRoot, profile, ides);
      } else if (mode === 'replace') {
        await replaceMode(repoRoot, sourceRepoRoot, profile, ides);
      }
      
      // Success message
      if (mode !== 'check') {
        log('\n✨ Setup complete!', 'green');
        log('\nYour repository is now configured with AI coding rules.', 'blue');
        log('Agents will read AGENTS.md and load packs from ~/.ai-coding-rules/packs/', 'blue');
        
        // Sponsor CTA
        log('\n💡 Buy us a coffee:', 'yellow');
        log('https://github.com/sponsors/aialchemylabs', 'green');
      }
      
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
  } else if (command === 'plan') {
    log('\n📋 Plan Mode: Showing what would change (no writes)\n', 'cyan');
    
    let downloadContext;
    try {
      // Download and install rules
      downloadContext = await downloadAndExtract({ installToHome: false });
      const sourceRepoRoot = downloadContext.repoDir;
      
      // Get current working directory (repo root)
      const repoRoot = process.cwd();
      
      // Prompt for profile (or use CLI option)
      const profile = await promptProfile(options.profile);
      
      // Prompt for IDEs
      const presetIdes = parseToolsOption(options.tools);
      const ides = await promptIDEs(presetIdes);
      
      // Run plan mode
      await planMode(repoRoot, sourceRepoRoot, profile, ides);
      
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
  } else if (command === 'check') {
    log('\n🔍 Check Mode: Validating rule resolution\n', 'cyan');
    
    let downloadContext;
    try {
      // Download and install rules
      downloadContext = await downloadAndExtract({ installToHome: false });
      const sourceRepoRoot = downloadContext.repoDir;
      
      // Get current working directory (repo root)
      const repoRoot = process.cwd();
      
      // Prompt for profile (or use CLI option)
      const profile = await promptProfile(options.profile);
      
      // Run check mode (no IDEs needed)
      await checkMode(repoRoot, sourceRepoRoot, profile, []);
      
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
    log('Usage:', 'yellow');
    log('  ai-coding-rules init [--mode=compose|replace|check] [--profile=bun-stack] [--tools=cursor,vscode,kiro,gemini]', 'blue');
    log('  ai-coding-rules plan [--profile=bun-stack] [--tools=cursor,vscode,kiro,gemini]', 'blue');
    log('  ai-coding-rules check [--profile=bun-stack]', 'blue');
    log('\nModes:', 'yellow');
    log('  compose  (default) Creates or updates AGENTS.rules.md, creates AGENTS.md only if missing', 'blue');
    log('  replace  Fully regenerates AGENTS.md (requires confirmation)', 'blue');
    log('  check    Validates rule resolution without writing files', 'blue');
    log('\nCommands:', 'yellow');
    log('  plan     Shows what would change without writing files', 'blue');
    log('  check    Validates rule resolution and returns non-zero on conflicts', 'blue');
    process.exit(1);
  }
}

main().catch((error) => {
  log(`\n❌ Unexpected error: ${error.message}`, 'red');
  process.exit(1);
});
