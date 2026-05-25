#!/usr/bin/env bash
# Flag symbols re-exported from src/design/primitives/index.ts that are not
# imported anywhere else under apps/mobile/src/. Catches dead primitives
# before they become a polishing tax — the design system stays honest.
#
# Heuristic, not exhaustive: skips test files when counting usages so a
# component used only by its own tests still shows up as unused.
#
# Exit codes: 0 = clean, 1 = at least one unused symbol found.

set -euo pipefail

ROOT=$(cd "$(dirname "$0")/.." && pwd)
INDEX="$ROOT/apps/mobile/src/design/primitives/index.ts"
SRC="$ROOT/apps/mobile/src"

if [ ! -f "$INDEX" ]; then
  echo "Could not find $INDEX" >&2
  exit 2
fi

exit_code=0
total_checked=0
unused=()

# Read the barrel one logical export-statement at a time.
# `tr` collapses newlines so multi-line `export { A, B } from '...';`
# statements fold into a single record before we split on semicolons.
while IFS= read -r stmt; do
  [ -z "${stmt// /}" ] && continue
  [[ "$stmt" == *"export {"* ]] || continue

  # Extract the brace body and trim type-only modifier.
  body=$(printf '%s' "$stmt" | sed -E 's/^.*export \{([^}]+)\}.*$/\1/')

  IFS=',' read -ra parts <<<"$body"
  for raw in "${parts[@]}"; do
    sym=$(printf '%s' "$raw" | sed -E 's/^[[:space:]]+//;s/[[:space:]]+$//;s/^type[[:space:]]+//')
    [ -z "$sym" ] && continue
    total_checked=$((total_checked + 1))

    # Count usages outside the primitive's own file, its tests, and the
    # barrel itself. A "use" is any \bSym\b token in a .ts/.tsx file.
    usages=$(grep -rE "\\b${sym}\\b" "$SRC" \
      --include='*.ts' --include='*.tsx' \
      2>/dev/null \
      | grep -vE "design/primitives/index\.ts" \
      | grep -vE "design/primitives/${sym}\.tsx?" \
      | grep -vE "design/primitives/${sym}\.test\.tsx?" \
      | grep -vE "__tests__/" \
      | grep -vE "\.test\.tsx?" \
      || true)

    if [ -z "$usages" ]; then
      unused+=("$sym")
    fi
  done
done < <(tr '\n' ' ' <"$INDEX" | tr ';' '\n')

echo "Checked $total_checked primitive exports."
if [ "${#unused[@]}" -eq 0 ]; then
  echo "✓ all primitives in use."
  exit 0
fi

echo ""
echo "✗ Found ${#unused[@]} unused primitive export(s):"
for sym in "${unused[@]}"; do
  echo "  - $sym"
done
exit 1
