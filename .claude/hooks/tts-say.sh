#!/usr/bin/env bash
# Send a TTS line to the homelab speaker. Silent no-op if env isn't configured.
# Usage: tts-say.sh "<message>" [device] [voice] [style]
#
# Every run appends one JSON line to .claude/hooks/.log (gitignored) so missed
# announcements can be diagnosed without instrumenting the loop itself.

set -u

MESSAGE="${1:-}"
DEVICE="${2:-kitchen}"
VOICE="${3:-Algenib}"
STYLE="${4:-Say solemnly}"

HOOK_DIR="$(cd "$(dirname "$0")" && pwd)"
LOG_FILE="$HOOK_DIR/.log"

log() {
  # one JSON line per call: timestamp, status, message, optional error
  printf '{"ts":"%s","status":"%s","msg":%s,"err":%s}\n' \
    "$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
    "$1" \
    "$(printf '%s' "${2:-}" | jq -Rs . 2>/dev/null || printf '"%s"' "${2:-}")" \
    "$(printf '%s' "${3:-}" | jq -Rs . 2>/dev/null || printf '"%s"' "${3:-}")" \
    >>"$LOG_FILE" 2>/dev/null || true
}

if [ -z "$MESSAGE" ]; then
  log "skip-empty" "" ""
  exit 0
fi

REPO_ROOT="$(git rev-parse --show-toplevel 2>/dev/null || true)"
if [ -n "$REPO_ROOT" ] && [ -f "$REPO_ROOT/.env.claude.local" ]; then
  set -a; . "$REPO_ROOT/.env.claude.local"; set +a
fi

if [ -z "${TTS_API_URL:-}" ] || [ -z "${TTS_API_TOKEN:-}" ]; then
  log "skip-no-env" "$MESSAGE" "TTS_API_URL or TTS_API_TOKEN not set"
  exit 0
fi

if ! command -v jq >/dev/null 2>&1; then
  log "skip-no-jq" "$MESSAGE" "jq not installed"
  exit 0
fi

# Fire synchronously with a tight timeout so the log captures the result.
RESP="$(curl -sS -X POST "$TTS_API_URL/say" \
  -H "Authorization: Bearer $TTS_API_TOKEN" \
  -H "Content-Type: application/json" \
  --max-time 5 \
  -w '\nHTTP_CODE:%{http_code}' \
  -d "$(jq -nc \
    --arg m "$MESSAGE" \
    --arg d "$DEVICE" \
    --arg v "$VOICE" \
    --arg s "$STYLE" \
    '{message:$m, device:$d, voice:$v, style:$s}')" 2>&1)"

CODE="$(printf '%s' "$RESP" | awk -F: '/^HTTP_CODE:/{print $2}')"
if [ "$CODE" = "200" ] || [ "$CODE" = "201" ] || [ "$CODE" = "204" ]; then
  log "sent" "$MESSAGE" ""
else
  log "fail-http" "$MESSAGE" "code=$CODE body=$(printf '%s' "$RESP" | grep -v '^HTTP_CODE:' | tr -d '\n' | head -c 200)"
fi

exit 0
