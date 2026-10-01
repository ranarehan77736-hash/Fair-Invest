#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT_TAR="$ROOT/site-deploy-clean.tar.gz"
OUT_ZIP="$ROOT/site-deploy-clean.zip"

echo "=== Building Frontend (fairinvest.site) ==="
cd "$ROOT"
export VITE_API_BASE_URL="https://api.fairinvest.site/api"
npm run build

# Ensure .htaccess exists in dist
if [ ! -f "$ROOT/dist/.htaccess" ]; then
  cp "$ROOT/public/.htaccess" "$ROOT/dist/.htaccess"
fi

cd "$ROOT/dist"
rm -f "$OUT_TAR" "$OUT_ZIP"

echo "Creating $OUT_TAR..."
COPYFILE_DISABLE=1 tar \
  --exclude='.DS_Store' \
  --exclude='._*' \
  -czvf "$OUT_TAR" .

if command -v zip >/dev/null 2>&1; then
  echo "Creating $OUT_ZIP..."
  zip -r -q "$OUT_ZIP" . -x "*.DS_Store" "*._*"
fi

echo ""
echo "=== Frontend Pack Complete ==="
echo "Tarball: $OUT_TAR"
[ -f "$OUT_ZIP" ] && echo "Zip:     $OUT_ZIP"
echo "Target: Upload and extract inside cPanel public_html/ (fairinvest.site)"
