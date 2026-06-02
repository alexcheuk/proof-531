#!/usr/bin/env bash
# Boundary lint per CLAUDE.md:
#   1. Hex/px literals only in src/design/.
#   2. src/domain/ is pure — no React/async/Drizzle.
#   3. src/data/ owns persistence — features must not import 'drizzle-orm'.
#
# Exit 0 = clean, 1 = at least one violation.
# Run via `pnpm check-boundaries` or inside `pnpm run ci`.

set -euo pipefail

ROOT=$(cd "$(dirname "$0")/.." && pwd)
SRC="$ROOT/apps/mobile/src"

if [ ! -d "$SRC" ]; then
  echo "Could not find $SRC" >&2
  exit 2
fi

violations=()

# 1. Hex color literals outside src/design/. Six-digit hex inside string
# literals (e.g. "#E7E3D6"). Tokens.ts already covers the legitimate cases.
hex_hits=$(grep -RInE "['\"\`]#[0-9A-Fa-f]{6}['\"\`]" \
  "$SRC" \
  --include='*.ts' \
  --include='*.tsx' \
  --exclude-dir='__tests__' \
  --exclude-dir='design' 2>/dev/null || true)
if [ -n "$hex_hits" ]; then
  violations+=("Hex literal outside src/design/:")
  while IFS= read -r line; do
    violations+=("  $line")
  done <<< "$hex_hits"
fi

# 2. React or async inside src/domain/. The domain layer is meant to be
# pure functions over plain data — no JSX, no Promise<...>, no Drizzle.
domain_hits=$(grep -RInE "^(import React|import .* from ['\"]react['\"]|^export async |async function |from ['\"]drizzle-orm)" \
  "$SRC/domain" \
  --include='*.ts' \
  --include='*.tsx' \
  --exclude-dir='__tests__' 2>/dev/null || true)
if [ -n "$domain_hits" ]; then
  violations+=("Impure import in src/domain/:")
  while IFS= read -r line; do
    violations+=("  $line")
  done <<< "$domain_hits"
fi

# 3. Drizzle imports outside src/data/. Features must consume via accessors
# and the TanStack Query hooks under data/queries/, never reach into the
# ORM directly.
drizzle_hits=$(grep -RIn "from ['\"]drizzle-orm" \
  "$SRC" \
  --include='*.ts' \
  --include='*.tsx' \
  --exclude-dir='data' \
  --exclude-dir='__tests__' 2>/dev/null || true)
if [ -n "$drizzle_hits" ]; then
  violations+=("Direct drizzle-orm import outside src/data/:")
  while IFS= read -r line; do
    violations+=("  $line")
  done <<< "$drizzle_hits"
fi

# 4. gorhom BottomSheet `index={open ? 0 : -1}` regression guard.
# gorhom v5 documents `index` as initial-only — prop-driven snap is
# unreliable (see loop-memory/05-gorhom-sheet-index.md and the Discord
# 1508365310 / 1508312977 cancel-button regressions). Sheet primitive
# drives open/close imperatively via a ref. If a new consumer
# reintroduces the prop-driven pattern this gate flags it.
gorhom_hits=$(grep -RInE "index=\{[A-Za-z0-9_.]+ \? 0 : -1\}" \
  "$SRC" \
  --include='*.ts' \
  --include='*.tsx' \
  --exclude-dir='__tests__' 2>/dev/null || true)
if [ -n "$gorhom_hits" ]; then
  violations+=("BottomSheet 'index={X ? 0 : -1}' — index is initial-only in gorhom v5; drive open/close imperatively via a ref:")
  while IFS= read -r line; do
    violations+=("  $line")
  done <<< "$gorhom_hits"
fi

# 5. Barrel files in features/ or domain/. CLAUDE.md rule 5 + features/CLAUDE.md
# rule 3: import directly from the file that exports the symbol. Barrels are
# allowed only inside design/primitives/. An index.ts/index.tsx anywhere under
# features/ or domain/ is a barrel and is flagged.
barrel_hits=$(find "$SRC/features" "$SRC/domain" \
  -type f \( -name 'index.ts' -o -name 'index.tsx' \) 2>/dev/null || true)
if [ -n "$barrel_hits" ]; then
  violations+=("Barrel file in features/ or domain/ (import directly from the source file; barrels are only allowed in design/primitives/):")
  while IFS= read -r line; do
    violations+=("  $line")
  done <<< "$barrel_hits"
fi

if [ "${#violations[@]}" -eq 0 ]; then
  echo "✓ boundary rules clean: no hex outside design, no React/async in domain, no drizzle outside data, no prop-driven BottomSheet index, no barrels in features/ or domain/."
  exit 0
fi

echo "✗ Found ${#violations[@]} boundary violation(s):"
for v in "${violations[@]}"; do
  echo "$v"
done
exit 1
