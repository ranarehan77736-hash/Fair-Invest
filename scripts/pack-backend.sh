#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="$ROOT/backend-deploy-clean.tar.gz"

cd "$ROOT/backend"
rm -f "$OUT"
COPYFILE_DISABLE=1 tar \
  --exclude='.DS_Store' \
  --exclude='._*' \
  --exclude='.env' \
  --exclude='node_modules' \
  --exclude='uploads' \
  -czvf "$OUT" \
  src scripts package.json package-lock.json knexfile.js

echo ""
echo "Created: $OUT"
echo "Upload to api.horizoneinvest.com, extract, then: npm install && npm run migrate"
