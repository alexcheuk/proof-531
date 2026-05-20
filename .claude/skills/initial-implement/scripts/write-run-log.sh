#!/usr/bin/env bash
# write-run-log.sh <task-id> <subagent-name> [content-file]
#   If content-file is omitted, reads from stdin.
#   Output goes to docs/superpowers/runs/<task-id>/<ISO-timestamp>/<subagent>.md

set -euo pipefail

# Require bash 4+ (mapfile, declare -A). macOS stock bash is 3.2 — `brew install bash`.
if [[ ${BASH_VERSINFO[0]} -lt 4 ]]; then
  echo "error: bash 4+ required (you have ${BASH_VERSION}); on macOS run 'brew install bash'" >&2
  exit 69
fi

if [[ $# -lt 2 ]]; then
  echo "usage: $0 <task-id> <subagent-name> [content-file]" >&2
  exit 64
fi

TASK_ID="$1"
SUBAGENT="$2"
CONTENT_SRC="${3:-/dev/stdin}"
TS="$(date -u +%Y-%m-%dT%H-%M-%SZ)"
LOG_DIR="docs/superpowers/runs/$TASK_ID/$TS"
mkdir -p "$LOG_DIR"
LOG_FILE="$LOG_DIR/${SUBAGENT}.md"

if [[ "$CONTENT_SRC" == "/dev/stdin" ]]; then
  cat > "$LOG_FILE"
else
  cp "$CONTENT_SRC" "$LOG_FILE"
fi

echo "$LOG_FILE"
