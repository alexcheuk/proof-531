#!/usr/bin/env bash
# Flag symbols re-exported from select barrel files that are not imported
# anywhere else under apps/mobile/src/. Catches dead exports before they
# become a polishing tax — the design system + data layer stay honest.
#
# Heuristic, not exhaustive: skips test files when counting usages so a
# symbol used only by its own tests still shows up as unused.
#
# Files scanned (when present):
#   - apps/mobile/src/design/primitives/index.ts
#   - apps/mobile/src/data/queries/<each file at the top of the dir>
#     (each query file is its own "barrel" of one or more exports)
#   - apps/mobile/src/data/accessors/<each file>
#
# Exit codes: 0 = clean, 1 = at least one unused symbol found.

set -euo pipefail

ROOT=$(cd "$(dirname "$0")/.." && pwd)
SRC="$ROOT/apps/mobile/src"

if [ ! -d "$SRC" ]; then
  echo "Could not find $SRC" >&2
  exit 2
fi

exit_code=0
total_checked=0
# bash 4+ `declare -a` does not initialize the variable, so `${#unused[@]}`
# under `set -u` errors when nothing was pushed. Explicit empty-array init
# keeps the "all clean" branch from tripping nounset.
unused=()

# Scan a single source file for `export {X, Y}` / `export function X` /
# `export class X` / `export const X` / `export type X` declarations and
# verify each name is imported somewhere else in $SRC. The first argument
# is the file to scan; the second is a human-readable label used in
# reporting.
scan_file() {
  local file="$1"
  local label="$2"
  local file_base
  file_base=$(basename "$file" | sed -E 's/\.tsx?$//')

  # Collect every exported symbol from the file. We handle:
  #   export { A, B as B2, type C } from '...';
  #   export { A, B };
  #   export function foo() { ... }
  #   export const foo = ...
  #   export type Foo = ...
  #   export class Foo { ... }
  local braces
  braces=$(tr '\n' ' ' <"$file" | tr ';' '\n' | grep -E "export \{" || true)
  local namedDecls
  namedDecls=$(grep -E "^export (function|const|let|class|type|interface) [A-Za-z_]+" "$file" || true)

  local -a symbols
  symbols=()

  # Brace exports.
  while IFS= read -r stmt; do
    [ -z "${stmt// /}" ] && continue
    local body
    body=$(printf '%s' "$stmt" | sed -E 's/^.*export \{([^}]+)\}.*$/\1/')
    IFS=',' read -ra parts <<<"$body"
    for raw in "${parts[@]}"; do
      local sym
      sym=$(printf '%s' "$raw" \
        | sed -E 's/^[[:space:]]+//;s/[[:space:]]+$//;s/^type[[:space:]]+//' \
        | sed -E 's/[[:space:]]+as[[:space:]]+.*$//')
      [ -z "$sym" ] && continue
      symbols+=("$sym")
    done
  done <<<"$braces"

  # Named single-decl exports.
  while IFS= read -r decl; do
    [ -z "${decl// /}" ] && continue
    local sym
    sym=$(printf '%s' "$decl" \
      | sed -E 's/^export (function|const|let|class|type|interface)[[:space:]]+([A-Za-z_][A-Za-z0-9_]*).*/\2/')
    [ -z "$sym" ] && continue
    symbols+=("$sym")
  done <<<"$namedDecls"

  for sym in "${symbols[@]}"; do
    total_checked=$((total_checked + 1))
    local usages
    usages=$(grep -rE "\\b${sym}\\b" "$SRC" \
      --include='*.ts' --include='*.tsx' \
      2>/dev/null \
      | grep -vE "${file}:" \
      | grep -vE "/${file_base}\.tsx?:" \
      | grep -vE "/${file_base}\.test\.tsx?:" \
      | grep -vE "__tests__/" \
      | grep -vE "\.test\.tsx?:" \
      || true)
    if [ -z "$usages" ]; then
      unused+=("$label::$sym")
    fi
  done
}

# Design primitives barrel — surface area that other code imports as
# `@/design/primitives`.
PRIMITIVES_INDEX="$SRC/design/primitives/index.ts"
if [ -f "$PRIMITIVES_INDEX" ]; then
  scan_file "$PRIMITIVES_INDEX" "primitives"
fi

# Data queries — each file is its own barrel. Skip __tests__ subdirs.
if [ -d "$SRC/data/queries" ]; then
  while IFS= read -r f; do
    scan_file "$f" "queries/$(basename "$f" | sed -E 's/\.tsx?$//')"
  done < <(find "$SRC/data/queries" -maxdepth 1 -type f \( -name "*.ts" -o -name "*.tsx" \) | sort)
fi

# Data accessors — same treatment.
if [ -d "$SRC/data/accessors" ]; then
  while IFS= read -r f; do
    scan_file "$f" "accessors/$(basename "$f" | sed -E 's/\.tsx?$//')"
  done < <(find "$SRC/data/accessors" -maxdepth 1 -type f \( -name "*.ts" -o -name "*.tsx" \) | sort)
fi

# Feature hooks — opt-in scan, off by default because the heuristic
# false-positives on type aliases that are exported for docs/clarity
# rather than for consumers. Pass `--with-hooks` (or set
# `FIND_UNUSED_HOOKS=1`) to widen.
if [ "${1:-}" = "--with-hooks" ] || [ "${FIND_UNUSED_HOOKS:-0}" = "1" ]; then
  for hooks_dir in "$SRC"/features/*/hooks; do
    [ -d "$hooks_dir" ] || continue
    feature=$(basename "$(dirname "$hooks_dir")")
    while IFS= read -r f; do
      scan_file "$f" "features/$feature/hooks/$(basename "$f" | sed -E 's/\.tsx?$//')"
    done < <(find "$hooks_dir" -maxdepth 1 -type f \( -name "*.ts" -o -name "*.tsx" \) | sort)
  done
  echo "Checked $total_checked exports across primitives + data + features/*/hooks (--with-hooks)."
else
  echo "Checked $total_checked exports across primitives + data/queries + data/accessors."
fi
if [ "${#unused[@]}" -eq 0 ]; then
  echo "✓ all scanned exports are imported by at least one non-test consumer."
  exit 0
fi

echo ""
echo "✗ Found ${#unused[@]} unused export(s):"
for entry in "${unused[@]}"; do
  echo "  - ${entry//::/ → }"
done
exit 1
