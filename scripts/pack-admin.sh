#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="$ROOT/admin-deploy-clean.tar.gz"

cd "$ROOT/Adminpanel"
npm run build

cd "$ROOT/Adminpanel/dist"
rm -f "$OUT"
COPYFILE_DISABLE=1 tar \
  --exclude='.DS_Store' \
  --exclude='._*' \
  -czvf "$OUT" .

echo ""
echo "Created: $OUT"
echo "Upload this tar.gz to the server (no __MACOSX / ._ junk)."
