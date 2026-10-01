#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT_TAR="$ROOT/admin-deploy-clean.tar.gz"
OUT_ZIP="$ROOT/admin-deploy-clean.zip"

echo "=== Building Admin Panel (fairinvest.site/admin) ==="
cd "$ROOT/Adminpanel"
export VITE_API_BASE_URL="https://api.fairinvest.site/api"
npm run build

# Ensure .htaccess exists in dist
if [ ! -f "$ROOT/Adminpanel/dist/.htaccess" ]; then
  cp "$ROOT/Adminpanel/public/.htaccess" "$ROOT/Adminpanel/dist/.htaccess"
fi

cd "$ROOT/Adminpanel/dist"
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
echo "=== Admin Panel Pack Complete ==="
echo "Tarball: $OUT_TAR"
[ -f "$OUT_ZIP" ] && echo "Zip:     $OUT_ZIP"
echo "Target: Upload and extract inside cPanel public_html/admin/ (fairinvest.site/admin)"
