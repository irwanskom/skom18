#!/usr/bin/env bash
# Vendors Leaflet into assets/vendor/leaflet/ so the office map does not depend
# on a CDN at runtime. Run from anywhere; re-runnable.
#
#   ./scripts/fetch-leaflet.sh
#
# Downloads are checked against the same SRI digests the CDN tags used, so a
# corrupted or substituted file fails the script instead of landing in the repo.

set -euo pipefail

VERSION="1.9.4"
BASE="https://unpkg.com/leaflet@${VERSION}/dist"
DEST="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)/assets/vendor/leaflet"

# sha384, base64 — same values as the integrity attributes on the CDN tags.
SRI_CSS="sHL9NAb7lN7rfvG5lfHpm643Xkcjzp4jFvuavGOndn6pjVqS6ny56CAt3nsEVT4H"
SRI_JS="cxOPjt7s7Iz04uaHJceBmS+qpjv2JkIHNVcuOrM+YHwZOmJGBXI00mdUXEq65HTH"

IMAGES=(
  layers.png
  layers-2x.png
  marker-icon.png
  marker-icon-2x.png
  marker-shadow.png
)

mkdir -p "$DEST/images"

fetch() {
  local url="$1" out="$2"
  echo "  fetching $(basename "$out")"
  curl -fsSL --retry 3 --retry-delay 2 --max-time 60 -o "$out" "$url"
}

digest() {
  openssl dgst -sha384 -binary "$1" | openssl base64 -A
}

verify() {
  local file="$1" expected="$2" actual
  actual="$(digest "$file")"
  if [ "$actual" != "$expected" ]; then
    echo "ERROR: checksum mismatch for $(basename "$file")" >&2
    echo "  expected sha384-$expected" >&2
    echo "  actual   sha384-$actual" >&2
    rm -f "$file"
    exit 1
  fi
  echo "  verified $(basename "$file")"
}

echo "Vendoring Leaflet ${VERSION} into ${DEST}"

fetch "$BASE/leaflet.css" "$DEST/leaflet.css"
verify "$DEST/leaflet.css" "$SRI_CSS"

fetch "$BASE/leaflet.js" "$DEST/leaflet.js"
verify "$DEST/leaflet.js" "$SRI_JS"

# Referenced by leaflet.css. The office map draws a circleMarker and hides the
# layers control, so these are only here to keep the stylesheet self-contained.
for img in "${IMAGES[@]}"; do
  fetch "$BASE/images/$img" "$DEST/images/$img"
done

echo
echo "Done. map-kantor.html picks these up automatically — no edit needed."
echo "Commit assets/vendor/leaflet/ so the map ships without the CDN."
