---
name: post-tracking
description: Tracks social/marketing posts drafted by the loop with their status and follow-up actions. The do-work loop checks this file to see what posts are awaiting Alex's go-ahead and what actions are pending.
---

# Social post tracking

> A simple ledger of posts the loop has drafted. Statuses:
> - `draft`: written, needs Alex review + go-ahead before posting
> - `approved`: Alex gave go-ahead, needs to be posted
> - `posted`: live, follow-up monitoring active
> - `done`: follow-up complete, no further action needed

## Active posts

### CASUAL-POST - casual android launch story
- status: draft
- file: `docs/marketing/casual-android-launch-post.md`
- target: r/vibecoding and/or r/homelab and/or r/selfhosted and/or Twitter/X
- drafted: 2026-06-13 (Expedition 87, task-queue 1515444127339249875 + 1515444142619099167)
- voice: extremely casual, "haha look what I did" - Alex's Discord message tone
- blocks on: Alex's go-ahead (SOUL growth-autonomy rule - public posts wait for Alex)
- follow_up: once posted, monitor engagement for 24-48h and respond to any questions/comments
- note: Alex also wants to use Playwright browser MCP to sign up for accounts if needed for posting

### R/531DISCUSSION - reddit launch post
- status: draft (READY TO POST - Android live)
- file: `docs/marketing/reddit-531discussion-draft.md`
- target: r/531Discussion
- blocks on: Alex personal details (how long on 5/3/1) + Alex go-ahead
- note: one remaining human blocker - Alex needs to fill in his 5/3/1 history

### R/WEIGHTROOM - reddit launch post
- status: draft (READY TO POST - Android live)
- file: `docs/marketing/reddit-weightroom-draft.md`
- target: r/weightroom
- blocks on: Post r/531Discussion first (24h gap per strategy), then Alex go-ahead

## Completed posts

(none yet - all posts drafted but not yet publicly posted, per SOUL growth-autonomy rule)

## How the loop uses this file

Each tick, after reading the backlog, check this file:
1. Any `approved` posts? Ship them (with Playwright MCP if account creation needed).
2. Any `draft` posts with new info to add? Update the draft file.
3. Any `posted` posts needing follow-up (24-48h after posting)? Check engagement.
4. Update statuses as they change.

Post this tracker update in the #auto-improvements Discord summary so Alex knows what's waiting on him.
