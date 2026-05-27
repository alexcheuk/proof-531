#!/usr/bin/env bash
# PostToolUse hook for the Skill tool. If the skill that just finished is
# commission-expedition-log, the Logger's work is done — announce the gommage.

set -u

HOOK_DIR="$(cd "$(dirname "$0")" && pwd)"

INPUT="$(cat)"

SKILL="$(printf '%s' "$INPUT" | jq -r '.tool_input.skill // empty' 2>/dev/null)"
[ "$SKILL" = "commission-expedition-log" ] || exit 0

"$HOOK_DIR/tts-say.sh" "The Logger has been gommaged. The field log endures."

exit 0
