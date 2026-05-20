#!/usr/bin/env bash
# pick-next.sh — print the id of the next ready task in queue.yaml, or empty.
# A task is ready when status=todo and every depends_on id has status=done.
# Order: lowest phase, then lexicographic id.

set -euo pipefail

# Require bash 4+ (mapfile, declare -A). macOS stock bash is 3.2 — `brew install bash`.
if [[ ${BASH_VERSINFO[0]} -lt 4 ]]; then
  echo "error: bash 4+ required (you have ${BASH_VERSION}); on macOS run 'brew install bash'" >&2
  exit 69
fi

QUEUE="${QUEUE_PATH:-docs/superpowers/queue.yaml}"

if [[ ! -f "$QUEUE" ]]; then
  echo "error: queue not found at $QUEUE" >&2
  exit 2
fi

# Build a map of id -> status to evaluate dependencies.
mapfile -t ALL_IDS < <(yq -r '.tasks[].id' "$QUEUE")
declare -A STATUS
for id in "${ALL_IDS[@]}"; do
  STATUS["$id"]="$(yq -r ".tasks[] | select(.id == \"$id\") | .status" "$QUEUE")"
done

# Iterate tasks in order (lowest phase, then id alpha).
yq -r '.tasks | sort_by(.phase, .id) | .[] | [.id, .status, (.depends_on // [] | join(","))] | @tsv' "$QUEUE" \
  | while IFS=$'\t' read -r id status deps; do
      [[ "$status" != "todo" ]] && continue
      ready=true
      IFS=',' read -ra dep_array <<< "$deps"
      for dep in "${dep_array[@]}"; do
        [[ -z "$dep" ]] && continue
        if [[ "${STATUS[$dep]:-missing}" != "done" ]]; then
          ready=false
          break
        fi
      done
      if $ready; then
        echo "$id"
        exit 0
      fi
    done || true   # mask pipefail's EOF=1 from the inner read loop
