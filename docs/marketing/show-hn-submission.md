---
tactic: 5
channel: Hacker News Show HN
status: draft
ready_to_post: false
trigger: iOS App Store live (currently in review)
drafted: 2026-06-13 (Expedition 85)
timing: weekday 8-10am US Eastern; post once per account per 30 days
---

# Show HN Submission

## Title (use exactly one)

**Option A - recommended (personal/real angle first):**
> Show HN: 531 Strength - I let a Claude agent build my gym app, start to finish

**Option B (app-first, agent secondary):**
> Show HN: 531 Strength - a free 5/3/1 strength tracker, built entirely by a Claude Code agent

---

## First comment (post immediately as submitter - this is the "explanation" HN expects)

I lift. I wanted a 5/3/1 + BBB tracker that did the programming math and left everything else out. Everything I found was either too expensive, too generic, or missing BBB support entirely.

So I built one. With a constraint: I wouldn't write any code. A Claude Code agent harness on a 30-minute cron would build it for me.

85 iterations later, the app is live on Android and in App Store review for iOS. The interesting part isn't the app - it's what running a real production product on an agent loop for this long taught me about where the model works and where it breaks.

**What the harness actually does:**
- A coordinator agent picks the next task from a backlog, following a priority rubric
- It spawns specialized sub-agents: a designer (spec), an implementer (code), and a QA agent (review)
- Static analysis runs in CI: TypeScript, Biome, Jest property tests, boundary-enforcement scripts
- The dev blog is written by the same system - a rotating "Logger of Expedition N" persona that commits one field log per loop in the same commit as the code

**What I found after 85 loops:**

The quality compounded. Not because the agents got smarter - because the context got cleaner. The system drifts when the human drifts. Keeping tight role skill files, a clear decision log, and enforced architectural boundaries was the actual job. The agents execute. The human manages the constraints.

The failure modes were interesting: the agents hallucinate file paths that don't exist, introduce subtle type errors on the first pass, and occasionally build to a slightly wrong spec. The QA agent catches most of it. The TypeScript compiler catches the rest. The property tests catch the math bugs. The system works, but it took iteration to trust what each layer actually catches.

**The app:**
- 5/3/1 + BBB programming with correct plate math
- Rest timer with background notification (keeps counting when you leave the screen)
- Per-cycle training max tracking with 7th-Week Protocol
- Local SQLite, no account, no server

Free, open source, no paywall.

- Android (live): https://play.google.com/store/apps/details?id=com.alexcheuk.fivethreeone
- iOS: [App Store link - fill in once approved]
- GitHub: https://github.com/alexcheuk/proof-531
- Process writeup: https://531strength.com/process
- Dev blog (field logs from the agent): https://531strength.com/blog

---

## Anticipated HN comments and prepared responses

**"Isn't this just Dynamic Workflows / something Claude already has?"**

Dynamic Workflows optimizes for one-shot high-parallelism tasks: Claude decides at runtime what to spawn, when results are good enough. The 531 harness optimizes for consistent bounded execution across 85+ iterations of a production app. The roles are fixed in advance (designer - implementer - QA), boundaries are CI-enforced (not runtime instructions), and handoffs are deterministic. Iteration 85 makes the same architectural decisions as iteration 1. That's not a limitation - that's the tradeoff the architecture was designed to favor. Dynamic Workflows would make a different decomposition call on iteration 85 than iteration 1. The 531 harness doesn't.

**"Did you actually not write any code?"**

Mostly true with caveats. I set direction, reviewed PRs when something felt off, and held the line on architectural decisions. I didn't write application logic, component code, or tests. The boundary enforcement CI scripts were initially seeded from prompts. Over 85 iterations the system has shipped features I would have taken a weekend to write - and done it faster, with better test coverage, than I would have on my own.

**"Is it actually usable? Does anyone use it?"**

I use it to run my own 5/3/1 program. It's the primary motivator for keeping the agent loop honest - if the math is wrong, I notice. The Play Store listing is live as of this week.

**"Why a gym app and not something more interesting?"**

The domain constraints made it a good test. 5/3/1 has specific math (training max calculations, percentages, progressive overload logic) that the agent can't fake - it either produces the right plate load or it doesn't. Wrong percentages mean a lifter loads the wrong weight. That's a real forcing function for correctness.

**"How much did this cost?"**

On the Claude API directly, each loop iteration is roughly $0.50-2.00 in tokens (design spec + implementation + QA is three model calls with substantial context). At 85 iterations, roughly $50-150 in API costs. Claude Code subscription covers most of it via the usage model.

---

## Timing notes

- HN resets at midnight Pacific Time. Post between 8am-10am ET for best front-page timing.
- Do not post the same week as a major AI product launch (check HN front page that morning).
- The post window for iOS launch day is the best moment: post on the day both stores are live.
- Have 2-3 people ready to upvote in the first 30 minutes if possible (genuine users only, not coordinated).
- The dev blog has 85+ expedition logs - HN will ask "how many iterations" and the answer is now credible.
- If the post stalls early, post the /process page as a standalone Ask HN the next day instead.

---

## One thing missing

Alex's personal 5/3/1 history is needed for authenticity in comments. Be ready to answer:
- "How long have you been running 5/3/1?"
- "What are your current lifts / training max?"
These make you sound like a real lifter, not a developer who just chose a fitness domain.
