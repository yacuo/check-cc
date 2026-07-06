#!/usr/bin/env bash

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

PROJECT="checkcc"
OUT_DIR="$ROOT/out"
SITE_URL="${SITE_URL:-https://checkcc.org/}"
NEXT_PUBLIC_CHECK_API_URL="${NEXT_PUBLIC_CHECK_API_URL:-https://api.checkcc.org/check}"
SKIP_BUILD=false

for arg in "$@"; do
  case "$arg" in
    --skip-build) SKIP_BUILD=true ;;
    *)
      echo "用法：./shell/deploy-cf-pages.sh [--skip-build]" >&2
      exit 1
      ;;
  esac
done

if ! command -v npx >/dev/null 2>&1; then
  echo "Error: npx is required." >&2
  exit 1
fi

if [[ "$SKIP_BUILD" == false ]]; then
  echo ">>> SITE_URL=$SITE_URL NEXT_PUBLIC_CHECK_API_URL=$NEXT_PUBLIC_CHECK_API_URL pnpm build"
  SITE_URL="$SITE_URL" NEXT_PUBLIC_CHECK_API_URL="$NEXT_PUBLIC_CHECK_API_URL" pnpm build
fi

if [[ ! -d "$OUT_DIR" ]]; then
  echo "Error: out/ not found." >&2
  exit 1
fi

npx wrangler pages deploy out --project-name="$PROJECT" --branch=main
