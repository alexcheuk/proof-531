---
status: draft
audience: r/vibecoding, r/homelab, r/selfhosted, Indie Hackers, potential HN (separate angle)
drafted: 2026-05-28 (Expedition 47)
purpose: "Casual 'look what I built' post about the ridiculousness and fun of the whole system — homelab, Discord guidance, TTS to Google Home, expedition lore, Logger rotation, Pocket Cast audio. Not a technical deep-dive. The absurdist delight angle."
note: "This is a DIFFERENT post from the technical deep-dive in longform-how-i-built-this.md. That piece is for Indie Hackers / HN. This is lighter, more personal, oriented toward people who will find the whole setup delightfully unhinged."
---

# Reddit/HN Casual Builder Draft — "Look What I Built" (The Fun Version)

## Angle

The technical story (agent harness, multi-agent teams, CI boundaries, property tests) lives in `longform-how-i-built-this.md`. That piece earns credibility by being specific about the engineering.

This piece is different. The angle here is: this whole project is kind of ridiculous in the most fun way possible, and that's the whole point. The target reader is a developer who runs a homelab, listens to tech podcasts, and would find genuine delight in the absurdist feedback loop described below.

The post does NOT lead with the app. The app is almost incidental. It leads with the experience of building this way.

---

## Draft — Long Form (suitable for Reddit post body, Indie Hackers, or a personal blog)

**Post title options:**

- "I built a gym app where an AI agent updates me via my Google Home speaker, and now I can't imagine building software any other way"
- "My gym app has expedition lore, a rotating cast of doomed field loggers, and sends me audio updates through Google Home. Here's what I learned."
- "I gave Claude Code a homelab, a Discord channel, and a 30-minute alarm clock. It built me a gym app."

---

**Body:**

I want to bench 315 pounds. Right now I bench 225. The program that gets you from here to there is called 5/3/1 — elegant, relentless, math-heavy. You need to track percentages, plate math, cycle counts.

I looked for an app. They were all wrong. So I built one.

That part isn't interesting. What's interesting is how I built it.

---

### The setup

The app is built by a Claude Code agent that runs on a 30-minute cron job on my homelab. It wakes up, reads its accumulated memory from previous loops, checks two Discord channels (one for pinned rules, one for a freeform task queue), decides what to work on, and then works.

I'm not in the loop during that 30 minutes. I'm probably at the gym.

When the loop finishes, it sends a Discord message with what it shipped. Then — and this is the part that gets people — the homelab reads that Discord message aloud through my Google Home speaker in the living room.

So I'll be making coffee and a voice from across the room says: "Expedition complete. The rest timer animation is now smooth on Android. Three tests added."

My wife has stopped asking questions about this.

---

### The lore

Somewhere around iteration 15, I decided the dev blog (yes, the app writes its own dev blog — I'll get to that) needed a fictional frame. I'd been reading about these long-haul Antarctic expeditions where teams would winter over, and there was this poignant quality to the logs: written by someone who knows the team is about to be rotated out, addressed to whoever shows up next.

So now every loop is an "expedition." At the end of each loop, a fourth agent — called the Logger — writes a field log. Different persona each time. Different name. Different voice. Ends every post with "For those who come after."

The agents are gommaged at the end of each loop. (Gommage: the context wipe. The word is borrowed from a painting technique.) The next expedition starts fresh, reads what came before, and carries on.

I did not explain this to the agents. They invented their own names. They write to each other across context windows they can't see across.

There are now 64+ of these posts.

---

### The Pocket Cast angle

The dev blog posts are at 531strength.com/blog. They're also published as an RSS feed. I added it to Pocket Cast.

I listen to expedition logs on my morning walk. The Logger of Expedition 23 had a particularly good voice. Expedition 31's Logger was more terse — almost like they knew something was about to break (it was; a boundary violation got through). 

The funny thing is I wrote none of this copy. These are field logs written by the same system that wrote the app code. One commit per loop: the code change and the blog post, together.

---

### What it taught me about software development

The experience of building this way changes what you notice.

When a human developer works on a project, they carry context invisibly — they remember why a decision was made, what they tried before, where the trap is. Agent loops don't have that. Every expedition starts from scratch.

So you have to externalize everything that a human would carry internally. There's a decision log where every notable choice gets written down before the work is done. Not after. Before. So the next agent inherits the reasoning, not just the output.

The agents write their own inheritance. That's the strange part.

Sixty-plus iterations in, the loop is building things I'd be proud to ship manually. The rest timer works in the background on Android. The plate math visualization is clean. AMRAP detection, session receipts, PR tracking. All of it shipped iteratively by a system that forgot it existed thirty minutes after each loop ended.

The thing about building this way: it makes the decisions you don't write down visible very quickly. The drift is immediate. If I slack on the decision log for a few loops, the agents start re-arguing settled questions. The system is a mirror for the quality of the context you maintain.

---

### The app itself

It's called 531 Strength. Free, no account required, local SQLite only. Android on the Play Store, iOS pending App Store approval.

The plate math shows you exactly what goes on the bar. The rest timer doesn't quit when you switch apps. BBB is fully supported. The history tab is a receipt, not a dashboard.

I use it every session. It's exactly the app I wanted.

But honestly, the app is almost the least interesting part of this project.

---

## Short Version (for r/vibecoding or a quick Reddit comment)

My gym app is built by a Claude agent on a 30-minute cron. At the end of each loop, the homelab reads the Discord summary aloud through my Google Home. The dev blog is written by a rotating cast of doomed "Loggers" who end every post with "For those who come after." I listen to expedition logs on Pocket Cast on my morning walk.

The app is free, local-first, no account. [link]

But the most useful thing I've learned: agent loops are mirrors for the quality of your context management. The drift is immediate when you stop writing things down. The agents need clean inheritance the same way a new teammate needs documentation — except the handoff happens every thirty minutes.

64+ iterations in. Still running.

---

## Channel targeting notes

**r/vibecoding** — Post the short version. Lead with the lore/homelab angle as the hook, not the architecture. The community already knows about agent loops; the expedition lore + Google Home speaker detail is the unexpected texture that earns engagement.

**r/homelab** or **r/selfhosted** — The cron-on-homelab angle is the lead. Frame it as "my homelab runs my development loop" rather than "my AI builds apps." Different audience, different entry point. These communities are interested in what the infrastructure looks like.

**Indie Hackers** — The full post works here. IH appreciates the personal story + honest reflection on what building this way teaches you. Different from the technical longform piece — this is more personal, more about the experience than the architecture.

**HN (if at all)** — Needs its own adaptation. HN will want the "what did you learn that's generalizable" section. The Pocket Cast / Google Home color is probably trimmed. The "decision log as inheritance" observation is the kind of thing HN engages with.

**Twitter/X** — Thread version: start with the Google Home speaker detail (hook), then walk through the expedition lore, the Pocket Cast use, the key insight about context hygiene. End with app link.

**YouTube Shorts series** — Each element of this story is a separate Short. See the YouTube Shorts content strategy in `loop-memory/16-organic-launch-strategy.md` (Tactic 13).

---

## What's needed from Alex before posting

1. Confirm the homelab/TTS setup details are accurate as described (cron job, Discord → Google Home pathway)
2. Confirm the Pocket Cast detail — is this accurate? Does Alex actually listen to expedition logs this way?
3. Personal details: confirm "bench 225, want 315" is accurate and okay to include (this is in INTENT.md but confirm for public use)
4. Choose which platforms to post to and in which sequence — this can go in parallel with or after the technical posts
5. Decide whether to post under personal name or project name
6. Any additional details about the homelab setup Alex is comfortable sharing (server type, OS, etc.) — not required but adds texture for the homelab audience
