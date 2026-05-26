#!/usr/bin/env bash
#
# Scan apps/mobile/src for "TEMP:" / "Remove before shipping" / "FIXME"
# comments in non-test files. These markers exist precisely because they
# are easy to forget at ship time — the loop-021 audit found a dev-only
# "REPLAY" button shipped on the PR celebration screen because nobody
# grepped for the marker before merging.
#
# Exit non-zero on any match so `pnpm verify` fails until the markers
# are removed.

set -uo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SRC="$ROOT/apps/mobile/src"

violations=$(grep -rn -E "TEMP:|Remove before shipping|FIXME\b" "$SRC" --include="*.ts" --include="*.tsx" 2>/dev/null \
  | grep -v "__tests__" \
  | grep -v "\.test\." \
  || true)

if [[ -n "$violations" ]]; then
  echo "✗ Found TEMP / FIXME markers in non-test files:"
  echo "$violations" | sed -E "s|^$ROOT/||"
  echo
  echo "  Remove the marker AND the code it gates before shipping."
  echo "  If the work is genuinely deferred, file a Discord task instead."
  exit 1
fi

echo "✓ no TEMP / FIXME markers in non-test files."
