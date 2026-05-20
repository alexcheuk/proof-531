#!/usr/bin/env bash
# ready-tasks.sh — print all ready task ids, one per line.

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

mapfile -t ALL_IDS < <(yq -r '.tasks[].id' "$QUEUE")
declare -A STATUS
for id in "${ALL_IDS[@]}"; do
  STATUS["$id"]="$(yq -r ".tasks[] | select(.id == \"$id\") | .status" "$QUEUE")"
done

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
      $ready && echo "$id"
    done
