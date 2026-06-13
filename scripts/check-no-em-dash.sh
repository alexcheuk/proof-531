#!/usr/bin/env bash
#
# Scan loop-authored files for U+2014 em dash (—). The SOUL hard line forbids
# this character in any file the loop writes: use a colon, period, comma,
# semicolon, parentheses, or a spaced hyphen instead.
#
# SCOPE: do-work/, loop-memory/, docs/decision-log.md
#   These are the paths the loop actively authors. apps/mobile/src/** has
#   ~200 pre-existing em dashes in legacy code comments; those are tracked
#   under LOOP-EMDASH-MOBILE in the backlog and swept separately.
#   apps/web/** is pending Alex's #needs-input ruling (WEB-SIGNOFF backlog).
#
# EXCLUDED files (intentional U+2014 usage to define or quote the rule):
#   - do-work/SOUL.md / do-work/DOCTRINE.md  (hard-line text quotes the glyph)
#   - .claude/skills/do-work/SKILL.md        (same)
#   - loop-memory/22-web-em-dash-debt.md     (the inventory memo references it)
#
# Exit 1 with offending file:line on violation; exit 0 on clean.

set -uo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"

violations=$(grep -rn $'\xe2\x80\x94' \
  "$ROOT/do-work" \
  "$ROOT/loop-memory" \
  "$ROOT/docs/decision-log.md" \
  --include="*.ts" \
  --include="*.tsx" \
  --include="*.md" \
  2>/dev/null \
  | grep -v "do-work/SOUL\.md" \
  | grep -v "do-work/DOCTRINE\.md" \
  | grep -v "\.claude/skills/do-work/" \
  | grep -v "loop-memory/22-web-em-dash-debt\.md" \
  || true)

if [[ -n "$violations" ]]; then
  echo "Em dash (U+2014) found in loop-authored files. Use a spaced hyphen or colon instead."
  echo ""
  echo "$violations" | sed -E "s|^$ROOT/||"
  echo ""
  echo "  The SOUL hard line forbids em dashes in any file the loop writes."
  echo "  Replace — with: a spaced hyphen ( - ), colon (:), or semicolon (;)."
  exit 1
fi

echo "check-no-em-dash: clean"
