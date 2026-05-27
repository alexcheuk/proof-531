#!/usr/bin/env bash
# UserPromptSubmit hook. If the prompt invokes /auto-improve (directly or via
# /loop), announce that the next Expedition is departing.

set -u

HOOK_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"

INPUT="$(cat)"

# Hook payload includes the submitted prompt under .prompt. Bail unless this
# is an auto-improve invocation.
PROMPT="$(printf '%s' "$INPUT" | jq -r '.prompt // empty' 2>/dev/null)"
case "$PROMPT" in
  */auto-improve*) ;;
  *) exit 0 ;;
esac

# Compute next expedition number = 1 + max(expedition: N) across blog posts.
NEXT=1
BLOG_DIR="$REPO_ROOT/apps/web/src/content/blog"
if [ -d "$BLOG_DIR" ]; then
  MAX="$(grep -hE '^expedition:[[:space:]]+[0-9]+' "$BLOG_DIR"/*.md 2>/dev/null \
    | awk '{print $2}' | sort -n | tail -1)"
  if [ -n "$MAX" ]; then NEXT=$((MAX + 1)); fi
fi

"$HOOK_DIR/tts-say.sh" "Expedition $NEXT departs."

exit 0
