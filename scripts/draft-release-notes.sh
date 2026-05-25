#!/usr/bin/env bash
# Print conventional-commit one-liners between two refs so the maintainer
# can paste them into CHANGELOG.md without hand-rolling `git log`.
# Defaults to the latest tag → HEAD; pass two refs for an explicit range.
#
# Usage:
#   bash scripts/draft-release-notes.sh             # since last tag
#   bash scripts/draft-release-notes.sh v0.2.0      # since v0.2.0
#   bash scripts/draft-release-notes.sh v0.2.0 main # explicit range

set -euo pipefail

if [ "$#" -ge 2 ]; then
  from="$1"
  to="$2"
elif [ "$#" -ge 1 ]; then
  from="$1"
  to="HEAD"
else
  from=$(git describe --tags --abbrev=0 2>/dev/null || git rev-list --max-parents=0 HEAD | tail -n 1)
  to="HEAD"
fi

if ! git rev-parse "$from" >/dev/null 2>&1; then
  echo "Could not resolve ref: $from" >&2
  exit 1
fi

echo "## Draft notes — $from → $to"
echo ""

added=()
changed=()
fixed=()
devex=()
misc=()

while IFS= read -r line; do
  sha="${line%% *}"
  subj="${line#* }"
  type="${subj%%:*}"
  type="${type%%(*}"
  entry="- \`$sha\` $subj"
  case "$type" in
    feat) added+=("$entry") ;;
    fix) fixed+=("$entry") ;;
    refactor|perf) changed+=("$entry") ;;
    chore|docs|ci|test|build) devex+=("$entry") ;;
    *) misc+=("$entry") ;;
  esac
done < <(git log --no-merges --pretty='%h %s' "$from..$to")

print_section() {
  local heading="$1"
  shift
  if [ "$#" -eq 0 ]; then return; fi
  echo ""
  echo "$heading"
  printf '%s\n' "$@"
}

print_section "### Added" "${added[@]:-}"
print_section "### Changed" "${changed[@]:-}"
print_section "### Fixed" "${fixed[@]:-}"
print_section "### Developer experience" "${devex[@]:-}"
print_section "### Misc" "${misc[@]:-}"
