#!/usr/bin/env bash
#
# Scan loop-authored files for U+2014 em dash (—). The SOUL hard line forbids
# this character in any file the loop writes: use a colon, period, comma,
# semicolon, parentheses, or a spaced hyphen instead.
#
# SCOPE: do-work/, loop-memory/, docs/decision-log.md, docs/marketing/,
#   apps/mobile/src/, apps/web/src/content/blog/2026-06-*.md (tick-5+).
#   apps/mobile/src/** pre-existing em dashes swept in tick-5 (LOOP-EMDASH-MOBILE).
#   docs/marketing/** fully swept in tick-6 (LOOP-EMDASH-MARKETING).
#   apps/web/** pre-June corpus pending Alex's #needs-input ruling (WEB-SIGNOFF).
#   The June-2026+ Logger posts are now fully swept (tick-7) and guarded here.
#
# EXCLUDED files (intentional U+2014 usage to define or quote the rule):
#   - do-work/SOUL.md / do-work/DOCTRINE.md  (hard-line text quotes the glyph)
#   - .claude/skills/do-work/SKILL.md        (same)
#   - loop-memory/22-web-em-dash-debt.md     (the inventory memo references it)
#
# Exit 1 with offending file:line on violation; exit 0 on clean.

set -uo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"

# Collect June-2026+ blog post paths for explicit inclusion
BLOG_JUNE_FILES=()
while IFS= read -r -d '' f; do
  BLOG_JUNE_FILES+=("$f")
done < <(find "$ROOT/apps/web/src/content/blog" -name "2026-06-*.md" -print0 2>/dev/null)

violations=$(grep -rn $'\xe2\x80\x94' \
  "$ROOT/do-work" \
  "$ROOT/loop-memory" \
  "$ROOT/docs/decision-log.md" \
  "$ROOT/docs/marketing" \
  "$ROOT/apps/mobile/src" \
  "${BLOG_JUNE_FILES[@]+"${BLOG_JUNE_FILES[@]}"}" \
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
