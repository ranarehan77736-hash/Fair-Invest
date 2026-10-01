#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT_TAR="$ROOT/backend-deploy-clean.tar.gz"
OUT_ZIP="$ROOT/backend-deploy-clean.zip"

echo "=== Packaging Backend (api.fairinvest.site) ==="
cd "$ROOT/backend"

# Ensure MySQL schema dump is updated
node scripts/generateCleanMysqlSchema.js

rm -f "$OUT_TAR" "$OUT_ZIP"

FILES_TO_PACK=(
  src
  scripts
  package.json
  package-lock.json
  knexfile.js
  server.js
  app.js
  reset-admin.js
  test-smtp.js
  .env.example
  fairinvest_mysql_schema.sql
)

echo "Creating $OUT_TAR..."
COPYFILE_DISABLE=1 tar \
  --exclude='.DS_Store' \
  --exclude='._*' \
  --exclude='.env' \
  --exclude='node_modules' \
  --exclude='uploads' \
  --exclude='dev.sqlite3*' \
  -czvf "$OUT_TAR" \
  "${FILES_TO_PACK[@]}"

if command -v zip >/dev/null 2>&1; then
  echo "Creating $OUT_ZIP..."
  zip -r -q "$OUT_ZIP" "${FILES_TO_PACK[@]}" -x "*.DS_Store" "*._*" "*.env" "node_modules/*" "uploads/*" "dev.sqlite3*"
fi

echo ""
echo "=== Backend Pack Complete ==="
echo "Tarball: $OUT_TAR"
[ -f "$OUT_ZIP" ] && echo "Zip:     $OUT_ZIP"
echo "Target: Upload and extract inside cPanel Node.js app folder for api.fairinvest.site"
