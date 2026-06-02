---
name: discord-channels
description: Cached Discord guild + channel IDs for the 531 server, plus the canonical curl recipes for every Discord call the loop makes. Loops should COPY these recipes, not re-derive them.
---

# Discord cached IDs

Guild: `1508244431046705293` (531.)

Channels:

- `#task-queue` — `1508247635721719949` — work the user wants done; bot reacts :+1: on pickup, :white_check_mark: on completion
- `#auto-improvements` — `1508247516586442782` — post end-of-loop summaries here
- `#loop-criteria` — `1509006645097664592` — pinned messages here are live, additive loop criteria on top of `loop-memory/loop-criteria.md`. Pin to add, unpin to retire. **First loop that needs this ID must discover it (recipe below) and write the ID back into the backticks above so the next loop pays one API call fewer.**
- `#needs-input` — `1509774367498829935` — questions for Alex from the loop; bot posts, Alex replies in thread or direct reply; next loop reads and acts
- `#general` — `1508244431650689177`

Bot self-react detection: use `GET /channels/:id/messages` and check whether the bot's own user ID appears in `reactions[].me` — saves a round-trip per message.

## Channel routing (do-work loop)

The 531 server has these four channels and no others. The do-work architecture was ported from a project (koresore) that also used `#alerts` and `#memory` channels; those do NOT exist here, so route their traffic as follows:

- **Build / validation FAILURES** (a `build-and-validate.sh` FAIL ingested by `validation.mjs`): post to `#needs-input`, not a separate `#alerts`. Lead with the failing flow and the fix-forward plan.
- **SOUL / DOCTRINE blessing requests** (the constitution-level half of the scoped self-edit gate): post the proposed change to `#needs-input` and wait for Alex's reply (the `:white_check_mark:` reaction or a confirming message). There is no separate `#memory` channel; `#needs-input` carries both questions and constitution-blessing requests.
- **Tactical distilled learnings** (the `do-work-distiller`): saved straight to `loop-memory/` (the self-edit gate is scoped, so the learnings layer is free) and mentioned in the `#auto-improvements` tick summary; they do not need their own channel.

So: `#task-queue` (work in), `#auto-improvements` (tick summary out), `#loop-criteria` (live pinned criteria), `#needs-input` (questions, escalations, build/validation failures, and constitution-blessing requests).

# Curl recipes

Every Discord call the loop makes, written out so the agent doesn't have to remember endpoint shapes, version pins, auth header format, or rate-limit gotchas. Source them in order from `.env.claude.local` first:

```bash
set -a; . ./.env.claude.local; set +a   # exports DISCORD_TOKEN -- the leading ./ is REQUIRED (see gotcha below)
AUTH="Authorization: Bot $DISCORD_TOKEN"
UA="User-Agent: 531-loop (https://github.com/alexcheuk/proof-531, 1.0)"
API="https://discord.com/api/v10"
```

The `User-Agent` header isn't optional — Discord sits behind Cloudflare, and Python `urllib`'s default UA gets the request 1010'd. `curl`'s default UA usually works; setting our own is one less thing to debug.

## Read pinned messages from a channel

```bash
curl -s -H "$AUTH" -H "$UA" "$API/channels/$CHANNEL_ID/pins"
```

Returns up to 50 messages, newest pin first. The full message object — `id`, `content`, `author`, `attachments`, `timestamp`, `reactions` — so the loop can parse pin bodies and check whether the bot has already acked any pin (if we ever start using reaction-as-ack on pins).

To dump just `(id, content)`:

```bash
curl -s -H "$AUTH" -H "$UA" "$API/channels/$CHANNEL_ID/pins" \
  | jq -r '.[] | "[\(.id)] \(.content)"'
```

## Read recent messages from a channel

```bash
curl -s -H "$AUTH" -H "$UA" "$API/channels/$CHANNEL_ID/messages?limit=100"
```

`limit` maxes at 100. Use `before=<message_id>` to paginate further back — but the task queue is small enough that one call is enough almost always.

## React to a message (bot self-react)

`:+1:` (U+1F44D) → `%F0%9F%91%8D`. `:white_check_mark:` (U+2705) → `%E2%9C%85`. `@me` is the literal string `@me`.

```bash
curl -s -X PUT -H "$AUTH" -H "$UA" \
  "$API/channels/$CHANNEL_ID/messages/$MESSAGE_ID/reactions/%F0%9F%91%8D/@me"
curl -s -X PUT -H "$AUTH" -H "$UA" \
  "$API/channels/$CHANNEL_ID/messages/$MESSAGE_ID/reactions/%E2%9C%85/@me"
```

Success returns HTTP 204 / empty body. Sleep ≥0.5s between PUTs — Discord rate-limits silently and a too-fast burst will silently drop reactions. After the batch, re-fetch the messages and retry any reaction where `reactions[].me` came back false.

## Post a message to a channel

```bash
curl -s -X POST -H "$AUTH" -H "$UA" -H "Content-Type: application/json" \
  "$API/channels/$CHANNEL_ID/messages" \
  -d "$(jq -nc --arg c "$BODY" '{content:$c, allowed_mentions:{parse:[]}}')"
```

`jq -n --arg` is the survival kit for summary bodies containing quotes, backticks, and newlines — hand-escaping JSON for `curl -d` is a regress to errno-via-syntax-error every time. `allowed_mentions.parse:[]` neutralizes any `@everyone` / `@role` that wandered in from a commit subject.

## Discover a channel by name (one-time, on cache miss)

```bash
GUILD_ID=1508244431046705293
curl -s -H "$AUTH" -H "$UA" "$API/guilds/$GUILD_ID/channels" \
  | jq -r '.[] | "\(.id)\t\(.name)"'
```

Returns every channel in the guild. Find the one named `loop-criteria` (or whatever channel needed an ID), then **edit the backticks in the channel list above** to cache it. Caching is the whole point — every future loop pays one network call instead of two.

## Rate limits + Cloudflare gotchas

- **Cloudflare 1010** from Python's `urllib` default UA → switch to `curl` (recipes here) or set a real `User-Agent` header.
- **Reactions silently rate-limit** → ≥0.5s between PUTs, re-verify via `reactions[].me`.
- **404 on a cached channel ID** → channel was deleted or renamed-and-recreated; clear the cache and rediscover.
- **401 / 403** → bot token rotated or missing scope. Token lives in `.env.claude.local` as `DISCORD_TOKEN`; if it really is gone, surface the error in the summary post and stop — don't try to ship blind.
- **`DISCORD_TOKEN` empty after sourcing → FIRST suspect the source line, NOT the config.** The
  `.env.claude.local` file does contain a valid token. The trap (hit on the 2026-06-01 do-work tick):
  the recipe was run as `set -a; . .env.claude.local; set +a` **without a leading `./`**. Under zsh
  the `.`/`source` builtin treats a bare filename as a `$PATH` lookup, does not find it in the cwd,
  and **silently fails** (an added `2>/dev/null` hid the "not found" error). The var stays empty,
  every call 401s, and the loop wrongly concludes "Discord is offline." **Fix: always source as
  `. ./.env.claude.local`** (the recipe above is correct), and after sourcing assert it loaded:
  `[ -n "$DISCORD_TOKEN" ] || echo "WARN: token not loaded - check the ./ in the source line"`.
- **Genuinely absent token** (file missing, or the value really is blank) → only then is Discord
  unconfigured. Do NOT block the tick: the file half of the rubric (`loop-memory/loop-criteria.md`)
  is then the whole criteria set, there is no `#task-queue` / `#needs-input` to read, and the
  `#auto-improvements` summary cannot post. Record it in `do-work/work/LOG.md` and do the repo work
  normally. But confirm it is truly absent (per the bullet above) before claiming it.
