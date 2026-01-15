#!/bin/bash
# update.sh
# Re-runs install-to-home.sh to update packs
# Idempotent: safe to run multiple times

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "Updating ai-agentic-rules packs..."
"$SCRIPT_DIR/install-to-home.sh"
