#!/bin/bash
# install-to-home.sh
# Installs ai-agentic-rules packs to ~/.aialchemylabs/
# Idempotent: safe to run multiple times
# Backs up existing files before overwriting

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

DRY_RUN=false
USE_RSYNC=false

usage() {
  echo "Usage: $0 [--dry-run]"
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --dry-run|-n)
      DRY_RUN=true
      shift
      ;;
    --help|-h)
      usage
      exit 0
      ;;
    *)
      echo -e "${RED}Unknown option: $1${NC}"
      usage
      exit 1
      ;;
  esac
done

# Determine script location and repo root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
TARGET_DIR="$HOME/.aialchemylabs"
BACKUP_DIR="$TARGET_DIR/.backup-$(date +%Y%m%d-%H%M%S)"

echo -e "${GREEN}Installing ai-agentic-rules to $TARGET_DIR${NC}"

if [[ "$DRY_RUN" == "true" ]]; then
  echo -e "${YELLOW}Dry run: no files will be modified.${NC}"
fi

if command -v rsync >/dev/null 2>&1; then
  USE_RSYNC=true
fi

if [[ "$DRY_RUN" == "false" ]]; then
  # Create target directory if it doesn't exist
  mkdir -p "$TARGET_DIR"
fi

# Function to install a file or directory
install_item() {
  local src="$1"
  local dest="$2"
  local item_name="${dest#$TARGET_DIR/}"

  # Skip if source doesn't exist
  if [[ ! -e "$src" ]]; then
    echo -e "${YELLOW}Warning: Source not found: $src${NC}"
    return 0
  fi

  if [[ "$DRY_RUN" == "true" ]]; then
    if [[ -e "$dest" ]] && ! diff -qr "$src" "$dest" >/dev/null 2>&1; then
      echo -e "${YELLOW}Would back up existing: $item_name${NC}"
    fi
    echo -e "${GREEN}Would install: $item_name${NC}"
    return 0
  fi

  # Create parent directory
  mkdir -p "$(dirname "$dest")"

  # If destination exists and differs, back it up
  if [[ -e "$dest" ]]; then
    if ! diff -qr "$src" "$dest" >/dev/null 2>&1; then
      echo -e "${YELLOW}Backing up existing: $item_name${NC}"
      mkdir -p "$BACKUP_DIR"
      mkdir -p "$(dirname "$BACKUP_DIR/$item_name")"
      cp -R "$dest" "$BACKUP_DIR/$item_name"
    fi
  fi

  # Copy source to destination
  if [[ -d "$src" ]]; then
    if [[ "$USE_RSYNC" == "true" ]]; then
      mkdir -p "$dest"
      rsync -a --delete "$src"/ "$dest"/
    else
      rm -rf "$dest"
      cp -R "$src" "$dest"
    fi
  else
    cp "$src" "$dest"
  fi

  echo -e "${GREEN}Installed: $item_name${NC}"
}

# Install all packs
echo -e "\n${GREEN}Installing packs...${NC}"
if [[ -d "$REPO_ROOT/packs" ]]; then
  for pack_dir in "$REPO_ROOT/packs"/*; do
    if [[ -d "$pack_dir" ]]; then
      pack_name=$(basename "$pack_dir")
      install_item "$pack_dir" "$TARGET_DIR/packs/$pack_name"
    fi
  done
else
  echo -e "${RED}Error: packs directory not found at $REPO_ROOT/packs${NC}"
  exit 1
fi

if [[ "$DRY_RUN" == "true" ]]; then
  echo -e "\n${GREEN}Dry run complete.${NC}"
  exit 0
fi

# Summary
echo -e "\n${GREEN}Installation complete!${NC}"
echo -e "Packs installed to: ${GREEN}$TARGET_DIR/packs${NC}"

if [[ -d "$BACKUP_DIR" ]] && [[ -n "$(ls -A "$BACKUP_DIR" 2>/dev/null)" ]]; then
  echo -e "Backups saved to: ${YELLOW}$BACKUP_DIR${NC}"
  echo -e "To restore a backup, copy files from $BACKUP_DIR back to $TARGET_DIR"
fi

echo -e "\n${GREEN}Next steps:${NC}"
echo "1. Create an AGENTS.md in your repo root"
echo "2. Reference packs from ~/.aialchemylabs/packs/ or copy them to your repo's .aialchemylabs/ directory"
echo "3. See examples/sample-repo/AGENTS.md for a template"
