#!/usr/bin/env bash
# Sync the 531 wordmark assets from the PWA repo into the mobile app.
#
# The PWA lives at ~/Development/531-pwa and is the canonical source for
# the brand mark + icon variants (see CLAUDE.md — "behavioral source of
# truth"). Re-run this script when the wordmark changes upstream; the
# mobile app picks up the new artwork on the next Metro restart.
#
# Usage:
#   bash scripts/sync-pwa-assets.sh
#   bash scripts/sync-pwa-assets.sh --pwa /some/other/path/to/531-pwa
#
# Safe to re-run — overwrites the destination files in place. Does NOT
# modify the PWA repo.

set -euo pipefail

PWA_ROOT="${HOME}/Development/531-pwa"
if [ "${1:-}" = "--pwa" ] && [ -n "${2:-}" ]; then
  PWA_ROOT="$2"
fi

if [ ! -d "$PWA_ROOT" ]; then
  echo "✗ PWA repo not found at $PWA_ROOT" >&2
  echo "  Pass --pwa /path/to/531-pwa to override." >&2
  exit 1
fi

repo_root="$(git rev-parse --show-toplevel)"
dest="$repo_root/apps/mobile/assets/images"

if [ ! -d "$dest" ]; then
  echo "✗ destination not found: $dest" >&2
  exit 1
fi

declare -A MAP=(
  ["public/icons/icon-512.png"]="icon.png"
  ["public/icons/icon-512.png"]="splash-icon.png"
  ["public/icons/icon-maskable-512.png"]="android-icon-foreground.png"
)

for src in "${!MAP[@]}"; do
  out="${MAP[$src]}"
  if [ ! -f "$PWA_ROOT/$src" ]; then
    echo "  skip — missing in PWA: $src" >&2
    continue
  fi
  cp "$PWA_ROOT/$src" "$dest/$out"
  echo "  $src → $dest/$out"
done

echo "✓ synced PWA assets into apps/mobile/assets/images"
echo "  Restart Metro to pick up the new images:"
echo "    pnpm --filter @fivethreeone/mobile start --clear"
