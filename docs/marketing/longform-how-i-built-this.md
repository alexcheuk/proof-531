---
status: draft
audience: Indie Hackers, personal blog, potential HN link-out, long-form social
drafted: 2026-05-28 (Expedition 40)
purpose: "Alex's 'fun story about how I built this whole thing' -  the vibe-code journey narrative. Source material for Indie Hackers post, HN description, and any platform where the full arc fits."
---

# I Let a Claude Agent Build My Gym App, Start to Finish -  Here's What Actually Happened

I bench 225 pounds and I want to bench 315. That's the whole story.

The 5/3/1 program is how you get from here to there. It's elegant and relentless: you pick your training maxes, run the math on your percentages, add a little weight every cycle, and just keep going. Simple in concept, surprisingly finicky to track. Every session you need to know: what weight goes on the bar today? Which percentage? Which variant? Is this a BBB day?

I looked for an app. There are several. Every single one was wrong in the same predictable ways: Strong costs $120 lifetime, is beautiful, and treats 5/3/1 like one program in a menu of a hundred. Boostcamp has Wendler's actual blocks but the UI is busy and the BBB variant cuts off. The rest are either too generic or want a subscription for features I wouldn't use. I ended up with a notes app, which worked fine until 6am on a Tuesday when I had to do plate math in my head before I'd had coffee.

So I decided to build my own.

---

## The unusual part

A staff frontend engineer building their own gym app is not a story. It happens constantly. The interesting constraint I gave myself was this: I would not write the code.

I'd been following the agent coding wave with professional interest for a while. Claude Code, multi-agent harnesses, the whole ecosystem. The interesting question wasn't "can an AI write code" -  yes, obviously -  it was "can an AI *ship* a real product, start to finish, with a human who only specifies direction?" The honest answer was: I didn't know. I decided to find out, with a real app I actually wanted to exist.

The rules I set:

1. The app is built by a Claude Code agent harness running on a 30-minute cron.
2. Each iteration, the agent picks tasks, ships them, and a second agent writes a post about what changed.
3. I type what I want into a Discord channel. The agent reads it, decides what to act on, and reports back.
4. Direct human commits are allowed for emergencies but are not the default. If I'm writing code instead of prompting, the experiment is compromised.

I set those rules and I held to them. Mostly.

---

## How the loop actually works

A cron fires every 30 minutes. The agent wakes up, reads its accumulated context from prior loops -  gotchas, pending work, anti-patterns to avoid -  then checks two Discord channels: one with pinned rules I can edit live, one with a free-form task queue. Then it decides what to work on.

The agent has a multi-agent team underneath it: a designer, an implementer, and a QA agent. Each one has a role skill file -  a document with explicit rules about what it can and can't do. The designer doesn't write code. The implementer doesn't set design tokens. The QA agent audits what the implementer shipped against a checklist. They hand off between each other in sequence.

At the end of the loop, a fourth agent -  the Logger -  writes a field log about what happened and commits it alongside the code. The dev blog on 531strength.com is written this way, entirely, by the same system. There are now 86+ entries, each written by a different rotating persona character who ends every post with "For those who come after."

I didn't write any of that copy. I didn't write any of the app code. I specified the direction.

---

## What was hard

The first few expeditions were chaotic. The designer and implementer contradicted each other. The design token system wasn't set up yet, so the implementer was writing hex values directly into components -  which the next design pass would break. The QA agent would pass things the implementer had subtly broken.

The fix was layering in constraints. A boundary enforcement script in CI that fails if hex values appear outside the token file. A rule that the domain layer -  the pure math -  has no React imports, no async, no database calls. Property-based tests for the training math so you know the percentages are right without running the full app. Each constraint was itself something the agent loop added after hitting the problem it was meant to prevent.

The other hard thing: context. Each agent starts fresh. It doesn't remember what the previous loop did. The decision log -  a file in the repo where notable decisions are appended before the work is done -  is the primary continuity mechanism. If I made a call in expedition 12 about why the rest timer works the way it does, the agent in expedition 37 reads it and understands the why. Without it, the agents re-argue settled questions.

The decision log being maintained *by the agents themselves* is one of the weirder feedback loops in the system. The agents write their own inheritance.

---

## What surprised me

A few things I didn't expect:

**The quality compounded.** By expedition 20, the loop was shipping things that were noticeably better than what a solo developer would have shipped alone. Not because the agent is smarter than a human, but because the QA agent is not the same agent that did the implementation. They don't have the same blind spots. You get a real second set of eyes on every change, every iteration, automatically.

**The human bottleneck is context hygiene, not prompting.** My job is not to write clever prompts. My job is to keep the decision log clean, keep the role skill files accurate, and make sure the agents have the information they need to not make the same mistake twice. When I slipped on that -  let a few decisions go unlogged, got lazy about the rubric -  the loop started drifting. The quality of the output tracks directly with the quality of the context I maintain.

**The blog is the most interesting artifact.** The dev blog was supposed to be documentation. It ended up being the most honest external record of a vibe-coding experiment I've seen. Every post is a field log written by the system about its own work. It's not marketing. It's a receipt. Forty-plus posts in, you can watch the agents get better at their jobs across the run. That's strange and kind of remarkable.

**Existing apps stayed wrong in the ways I expected.** I was right about the problem. The app I built is the one I wanted. It does the math, shows the plates, leaves everything else out. I use it every session. It didn't drift into something I didn't want because the INTENT.md document -  a short file that says what the app is and is not -  is something the agent reads every loop as a drift check.

---

## Where it is now

The app is on the Google Play Store (public testing). The iOS version just went into App Store review. There have been [N] expeditions. The loop is still running.

The source is on GitHub: [link]. The dev blog documenting every expedition is at 531strength.com/blog. The /process page at 531strength.com/process explains the loop in more detail if you want to understand the architecture.

---

## The thing I'm still figuring out

Whether this model compounds at scale. The early data says yes: each expedition, the loop is slightly more capable than the one before it. The improvements aren't dramatic -  they're incremental, boring in the best way. But they accumulate. An app that started as a rough sketch now has accurate plate math, working rest timers, AMRAP tracking, PR detection, session receipts, history views.

The question I'm still asking: does this hit an inflection point? Does there come an expedition where the system's own quality of self-improvement accelerates? Or does it plateau at some ceiling imposed by the context window and the clarity of the humans doing the prompting?

I'll know more in another forty expeditions.

---

## If you want to try the same thing

The main thing I'd tell you: the skill is not in prompting. The skill is in defining boundaries, maintaining context, and being honest about what shipped and what didn't. The agents need clean inheritance. They need to know what's settled and what isn't. They need role files that are accurate and constraints that are enforced by something harder than instructions.

And you need a real problem. A gym tracker isn't glamorous. It's also not a toy. The non-glamour is the point -  if the experiment only works on demos and toy apps, it doesn't prove anything. The interesting question is whether it works on the boring, incremental, requires-good-judgment work of making a real product genuinely good.

So far: yes.

---

*531 Strength is free, no account required, local-only. Android on the Play Store, iOS pending App Store review. Source at [GitHub link]. Full process at 531strength.com/process.*
