#!/usr/bin/env bash
# Scaffold a new dev-blog post under apps/web/src/content/blog/.
# Usage:
#   bash scripts/new-loop-post.sh <kebab-slug>
#   pnpm new-loop-post <kebab-slug>
#
# Picks today's date for the filename and frontmatter, infers the next
# loop number from the existing posts, and prints the new file's path
# so an editor can `$EDITOR $(pnpm new-loop-post ...)`.
#
# Filename: apps/web/src/content/blog/YYYY-MM-DD-<slug>.md
# Frontmatter follows loop-memory/03-dev-blog.md exactly.

set -euo pipefail

ROOT=$(cd "$(dirname "$0")/.." && pwd)
BLOG_DIR="$ROOT/apps/web/src/content/blog"

if [ ! -d "$BLOG_DIR" ]; then
  echo "Could not find $BLOG_DIR" >&2
  exit 2
fi

SLUG="${1:-}"
if [ -z "$SLUG" ]; then
  echo "usage: $0 <kebab-slug>" >&2
  echo "  e.g. $0 cancel-moved-and-the-site-grew" >&2
  exit 2
fi

DATE=$(date +%Y-%m-%d)
ISO=$(date -u +%Y-%m-%dT%H:%M:%SZ)
BASENAME="${DATE}-${SLUG}.md"
TARGET="$BLOG_DIR/$BASENAME"

if [ -e "$TARGET" ]; then
  echo "Already exists: $TARGET" >&2
  exit 1
fi

# Infer next loopId — find the highest `loopId: 'loop-NNN'` across
# existing posts and add one. Backdated retro posts (`retro-NNN`) and
# anything that doesn't match get skipped.
LAST_LOOP=$(grep -h "^loopId: 'loop-" "$BLOG_DIR"/*.md 2>/dev/null \
  | sed -E "s/^loopId: 'loop-([0-9]+)'/\\1/" \
  | sort -n \
  | tail -1)
if [ -z "$LAST_LOOP" ]; then
  NEXT="loop-001"
else
  NEXT_NUM=$(printf "%03d" $((10#$LAST_LOOP + 1)))
  NEXT="loop-$NEXT_NUM"
fi

cat > "$TARGET" <<EOF
---
title: '<headline, ≤ 70 chars>'
summary: >-
  <2–3 sentence elevator pitch. Lead with the most interesting thing that
  shipped, not a list of everything.>
pubDate: $DATE
loopId: '$NEXT'
loopIso: '$ISO'
commitCount: 1
tags: ['<area>', '<area>']
---

<Body — see loop-memory/03-dev-blog.md for what each loop's entry
should cover. Skip sections that don't have anything to say.>

## What changed

## Why it changed

## Surprises

## What's queued next
EOF

echo "$TARGET"
