#!/usr/bin/env bash
# PostToolUse hook for the Skill tool. If the skill that just finished is
# commission-expedition-log, the Logger's work is done — announce the gommage.

set -u

HOOK_DIR="$(cd "$(dirname "$0")" && pwd)"
LOG_FILE="$HOOK_DIR/.log"

log() {
  printf '{"ts":"%s","hook":"on-skill-end","status":"%s","note":"%s"}\n' \
    "$(date -u +%Y-%m-%dT%H:%M:%SZ)" "$1" "${2:-}" \
    >>"$LOG_FILE" 2>/dev/null || true
}

INPUT="$(cat)"

if command -v jq >/dev/null 2>&1; then
  SKILL="$(printf '%s' "$INPUT" | jq -r '.tool_input.skill // empty' 2>/dev/null)"
else
  SKILL="$(printf '%s' "$INPUT" | grep -oE '"skill"[[:space:]]*:[[:space:]]*"[^"]*"' | head -1 | sed -E 's/.*"skill"[[:space:]]*:[[:space:]]*"([^"]*)".*/\1/')"
fi

if [ "$SKILL" != "commission-expedition-log" ]; then
  log "skip-no-match" "skill=$SKILL"
  exit 0
fi

log "fire" ""
"$HOOK_DIR/tts-say.sh" "The Logger has been gommaged. The field log endures."

exit 0
