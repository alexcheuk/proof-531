#!/usr/bin/env bash
# mark-status.sh <task-id> <status> [reason]
#   status must be one of: todo | in_progress | done | blocked
#   reason is only meaningful for blocked.
# Invariant: blocked_reason is present iff status == blocked.

set -euo pipefail

# Require bash 4+ (mapfile, declare -A). macOS stock bash is 3.2 — `brew install bash`.
if [[ ${BASH_VERSINFO[0]} -lt 4 ]]; then
  echo "error: bash 4+ required (you have ${BASH_VERSION}); on macOS run 'brew install bash'" >&2
  exit 69
fi

if [[ $# -lt 2 ]]; then
  echo "usage: $0 <task-id> <status> [blocked-reason]" >&2
  exit 64
fi

TASK_ID="$1"
NEW_STATUS="$2"
REASON="${3:-}"
QUEUE="${QUEUE_PATH:-docs/superpowers/queue.yaml}"

case "$NEW_STATUS" in
  todo|in_progress|done|blocked) ;;
  *)
    echo "error: invalid status '$NEW_STATUS' (allowed: todo|in_progress|done|blocked)" >&2
    exit 64
    ;;
esac

# Confirm the task exists.
EXISTS="$(TASK_ID="$TASK_ID" yq -r '.tasks[] | select(.id == strenv(TASK_ID)) | .id' "$QUEUE")"
if [[ "$EXISTS" != "$TASK_ID" ]]; then
  echo "error: task '$TASK_ID' not found in $QUEUE" >&2
  exit 65
fi

# Update status + blocked_reason atomically via tempfile + mv.
# Using strenv() (not string interpolation) makes the values injection-safe.
TMPFILE="$(mktemp)"
cp "$QUEUE" "$TMPFILE"
TASK_ID="$TASK_ID" NEW_STATUS="$NEW_STATUS" \
  yq -i '(.tasks[] | select(.id == strenv(TASK_ID)) | .status) = strenv(NEW_STATUS)' "$TMPFILE"
if [[ "$NEW_STATUS" == "blocked" ]]; then
  TASK_ID="$TASK_ID" REASON="$REASON" \
    yq -i '(.tasks[] | select(.id == strenv(TASK_ID)) | .blocked_reason) = strenv(REASON)' "$TMPFILE"
else
  TASK_ID="$TASK_ID" \
    yq -i 'del(.tasks[] | select(.id == strenv(TASK_ID)) | .blocked_reason)' "$TMPFILE"
fi
mv "$TMPFILE" "$QUEUE"

echo "marked $TASK_ID -> $NEW_STATUS"
