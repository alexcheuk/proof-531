#!/usr/bin/env bash
# UserPromptSubmit hook. If the prompt invokes /auto-improve (directly or via
# /loop), announce that the next Expedition is departing.

set -u

HOOK_DIR="$(cd "$(dirname "$0")" && pwd)"
LOG_FILE="$HOOK_DIR/.log"
REPO_ROOT="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"

log() {
  printf '{"ts":"%s","hook":"on-loop-start","status":"%s","note":"%s"}\n' \
    "$(date -u +%Y-%m-%dT%H:%M:%SZ)" "$1" "${2:-}" \
    >>"$LOG_FILE" 2>/dev/null || true
}

INPUT="$(cat)"

# Prefer jq; fall back to a grep that finds the prompt field in the JSON.
if command -v jq >/dev/null 2>&1; then
  PROMPT="$(printf '%s' "$INPUT" | jq -r '.prompt // empty' 2>/dev/null)"
else
  PROMPT="$(printf '%s' "$INPUT" | grep -oE '"prompt"[[:space:]]*:[[:space:]]*"[^"]*"' | head -1 | sed -E 's/.*"prompt"[[:space:]]*:[[:space:]]*"([^"]*)".*/\1/')"
fi

case "$PROMPT" in
  *auto-improve*) ;;
  *)
    log "skip-no-match" "prompt=$(printf '%s' "$PROMPT" | head -c 80)"
    exit 0
    ;;
esac

NEXT=1
BLOG_DIR="$REPO_ROOT/apps/web/src/content/blog"
if [ -d "$BLOG_DIR" ]; then
  MAX="$(grep -hE '^expedition:[[:space:]]+[0-9]+' "$BLOG_DIR"/*.md 2>/dev/null \
    | awk '{print $2}' | sort -n | tail -1)"
  if [ -n "$MAX" ]; then NEXT=$((MAX + 1)); fi
fi

log "fire" "expedition=$NEXT"
"$HOOK_DIR/tts-say.sh" "Expedition $NEXT departs."

exit 0
