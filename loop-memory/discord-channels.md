---
name: discord-channels
description: Cached Discord guild + channel IDs for the 531 server so future loops don't re-fetch.
---

# Discord cached IDs

Guild: `1508244431046705293` (531.)

Channels:

- `#task-queue` — `1508247635721719949` — work the user wants done; bot reacts :+1: on pickup, :white_check_mark: on completion
- `#auto-improvements` — `1508247516586442782` — post end-of-loop summaries here
- `#general` — `1508244431650689177`

Bot self-react detection: use `GET /channels/:id/messages` and check whether the bot's own user ID appears in `reactions[].me` — saves a round-trip per message.
