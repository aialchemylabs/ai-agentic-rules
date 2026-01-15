#!/bin/bash
# install-from-remote.sh
# Downloads and installs ai-agentic-rules packs from GitHub to ~/.ai-coding-rules/
# Silently replaces everything in ~/.ai-coding-rules/

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Default repository (can be overridden via environment variables)
REPO_OWNER="${AI_CODING_RULES_OWNER:-aialchemylabs}"
REPO_NAME="${AI_CODING_RULES_REPO:-ai-agentic-rules}"
REPO_BRANCH="${AI_CODING_RULES_BRANCH:-main}"

TARGET_DIR="$HOME/.ai-coding-rules"
TEMP_DIR=$(mktemp -d)
TARBALL_URL="https://github.com/${REPO_OWNER}/${REPO_NAME}/archive/refs/heads/${REPO_BRANCH}.tar.gz"

# Cleanup function
cleanup() {
  rm -rf "$TEMP_DIR"
}
trap cleanup EXIT

echo -e "${GREEN}Installing ai-agentic-rules from GitHub...${NC}"
echo -e "Repository: ${REPO_OWNER}/${REPO_NAME} (branch: ${REPO_BRANCH})"

# Download tarball
echo -e "\n${GREEN}Downloading latest rules...${NC}"
if ! curl -fsSL "$TARBALL_URL" -o "$TEMP_DIR/repo.tar.gz"; then
  echo -e "${RED}Error: Failed to download from ${TARBALL_URL}${NC}"
  echo -e "${YELLOW}Tip: Check your internet connection and verify the repository exists.${NC}"
  exit 1
fi

# Extract tarball
echo -e "${GREEN}Extracting...${NC}"
cd "$TEMP_DIR"
tar -xzf repo.tar.gz
EXTRACTED_DIR="${REPO_NAME}-${REPO_BRANCH}"

# Verify packs directory exists
if [[ ! -d "$EXTRACTED_DIR/packs" ]]; then
  echo -e "${RED}Error: packs directory not found in downloaded repository${NC}"
  exit 1
fi

# Remove existing directory and recreate (silent overwrite)
echo -e "${GREEN}Installing to ${TARGET_DIR}...${NC}"
rm -rf "$TARGET_DIR"
mkdir -p "$TARGET_DIR/packs"

# Copy packs
if command -v rsync >/dev/null 2>&1; then
  rsync -a "$EXTRACTED_DIR/packs/" "$TARGET_DIR/packs/"
else
  cp -R "$EXTRACTED_DIR/packs"/* "$TARGET_DIR/packs/"
fi

# Summary
echo -e "\n${GREEN}Installation complete!${NC}"
echo -e "Packs installed to: ${GREEN}$TARGET_DIR/packs${NC}"

echo -e "\n${GREEN}Next steps:${NC}"
echo "1. Run \`npx @aialchemy/ai-coding-rules init\` in your repo to set up AGENTS.md and configure your IDE"
echo "2. Or manually create AGENTS.md in your repo root (see examples/sample-repo/AGENTS.md)"

echo -e "\n${YELLOW}💡 Buy us a coffee:${NC}"
echo -e "${GREEN}https://github.com/sponsors/aialchemylabs${NC}"
