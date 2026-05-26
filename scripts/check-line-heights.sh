#!/usr/bin/env bash
#
# Scan apps/mobile/src for inline `fontSize: N` + `lineHeight: M` pairs
# where M < N * 1.14 — the threshold below which React Native clips
# lowercase descenders (g j p q y) on display-size text.
#
# Doesn't catch every shape — primitives that take size + lineHeight as
# constants, and values referenced from variables, slip through. But the
# inline pattern is by far the most common offender (`ProgressTitleBlock`,
# `Intro`, `PickLifts`, the masthead heroes) and that's what this catches.
#
# Allowlist: any `// rn-line-height-ok: <reason>` comment on the line
# preceding the `lineHeight` declaration skips the check. Use for
# digits-only consumers (RestTimer, GoalPanel's value, etc.) where
# descenders cannot appear.
#
# Exit non-zero on any unannotated violation. Wire into `pnpm verify` so
# the loop catches this at commit time rather than on a screenshot pair.

set -uo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SRC="$ROOT/apps/mobile/src"
THRESHOLD_NUM=114   # 1.14 × 100, so we can compare in integers

violations=0
checked=0

# Grep for inline `fontSize: N,` lines. The lineHeight is usually within
# the next 6 lines of the same style block.
while IFS=: read -r file lineno fontline; do
  fontsize=$(echo "$fontline" | sed -nE 's/.*fontSize:[[:space:]]*([0-9]+).*/\1/p')
  # Only check display sizes (>= 24); body text doesn't clip noticeably.
  # Skip when fontSize wasn't a literal integer (e.g. `fontSize: VAR_NAME`).
  if [[ -z "$fontsize" || ! "$fontsize" =~ ^[0-9]+$ ]]; then continue; fi
  if (( fontsize < 24 )); then continue; fi

  # Pull the next 8 lines after the fontSize declaration; look for the
  # matching lineHeight in the same style object.
  block=$(awk -v start="$lineno" -v end="$((lineno + 8))" 'NR>=start && NR<=end' "$file")
  lh_line=$(echo "$block" | grep -n "lineHeight:" | head -1 || true)
  if [[ -z "$lh_line" ]]; then continue; fi

  # Skip allowlisted lines.
  lh_offset=$(echo "$lh_line" | cut -d: -f1)
  prev_lineno=$((lineno + lh_offset - 2))
  prev_line=$(sed -n "${prev_lineno}p" "$file")
  if echo "$prev_line" | grep -q "rn-line-height-ok"; then continue; fi

  lh=$(echo "$lh_line" | sed -nE 's/.*lineHeight:[[:space:]]*([0-9]+).*/\1/p')
  if [[ -z "$lh" || ! "$lh" =~ ^[0-9]+$ ]]; then continue; fi

  checked=$((checked + 1))

  # Need lh * 100 >= fontsize * 114 (i.e. lh/fontsize >= 1.14).
  if (( lh * 100 < fontsize * THRESHOLD_NUM )); then
    abs_lineno=$((lineno + lh_offset - 1))
    rel=${file#"$ROOT/"}
    echo "✗ $rel:$abs_lineno  fontSize=$fontsize lineHeight=$lh  (ratio $(awk "BEGIN{printf \"%.2f\", $lh/$fontsize}")× < 1.14×)"
    violations=$((violations + 1))
  fi
done < <(grep -rn "fontSize:" "$SRC" --include="*.tsx" --include="*.ts" 2>/dev/null)

echo
echo "Checked $checked inline fontSize+lineHeight pairs in display text (≥24 px)."

if [[ "$violations" -gt 0 ]]; then
  echo "✗ Found $violations line-height violations. RN clips descenders below 1.14× fontSize."
  echo "  Fix the pair, or annotate the previous line with: // rn-line-height-ok: <reason>"
  echo "  See loop-memory/09-rn-text-clipping.md for the rule."
  exit 1
fi

echo "✓ all checked pairs satisfy lineHeight ≥ 1.14 × fontSize."
