#!/usr/bin/env bash

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

CONFIG="$ROOT/wrangler.check-api.jsonc"

if ! command -v npx >/dev/null 2>&1; then
  echo "Error: npx is required." >&2
  exit 1
fi

if [[ ! -f "$CONFIG" ]]; then
  echo "Error: wrangler.check-api.jsonc not found." >&2
  exit 1
fi

pnpm --config.dangerously-allow-all-builds=true dlx wrangler deploy --config "$CONFIG"
