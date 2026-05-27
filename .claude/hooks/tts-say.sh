#!/usr/bin/env bash
# Send a TTS line to the homelab speaker. Silent no-op if env isn't configured.
# Usage: tts-say.sh "<message>" [device] [voice] [style]

set -u

MESSAGE="${1:-}"
DEVICE="${2:-kitchen}"
VOICE="${3:-Algenib}"
STYLE="${4:-Say solemnly}"

[ -z "$MESSAGE" ] && exit 0

# Source env from repo root if present so cron and interactive runs both work.
REPO_ROOT="$(git rev-parse --show-toplevel 2>/dev/null || true)"
if [ -n "$REPO_ROOT" ] && [ -f "$REPO_ROOT/.env.claude.local" ]; then
  set -a; . "$REPO_ROOT/.env.claude.local"; set +a
fi

[ -z "${TTS_API_URL:-}" ] && exit 0
[ -z "${TTS_API_TOKEN:-}" ] && exit 0

# Fire and forget. Background + redirect so the hook never blocks Claude
# and TTS failures (speaker offline, API down) never leak into the loop.
(
  curl -sS -X POST "$TTS_API_URL/say" \
    -H "Authorization: Bearer $TTS_API_TOKEN" \
    -H "Content-Type: application/json" \
    --max-time 5 \
    -d "$(jq -nc \
      --arg m "$MESSAGE" \
      --arg d "$DEVICE" \
      --arg v "$VOICE" \
      --arg s "$STYLE" \
      '{message:$m, device:$d, voice:$v, style:$s}')" \
    >/dev/null 2>&1
) &

exit 0
