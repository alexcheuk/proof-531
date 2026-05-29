---
status: draft
audiences: HN Show HN, Indie Hackers, r/vibecoding, r/reactnative
drafted: 2026-05-28
---

# The AI Experiment Story — Outline for HN and Indie Hackers

This is the **AI experiment story**, not the lifting app story. Keep these two completely separate — the practitioner communities (r/531Discussion, r/weightroom) don't want to hear about the agent loop, and HN doesn't primarily care about the 5/3/1 program. The app is the proof; the loop is the story.

---

## The 5-bullet story outline

**1. The premise was a personal itch, not a technical demo.**
A staff engineer wanted a 5/3/1 tracker and couldn't find one that fit. That's not an unusual story. The unusual part: instead of hand-writing the app over evenings and weekends, the decision was to have a Claude agent harness build it — and to hold that line even when it would have been faster to just type the code directly. The constraint is the experiment.

**2. The loop is real and still running.**
A Claude Code agent runs on a 30-minute cron. Each iteration it picks a task from a queue, spawns sub-agents for design, implementation, and QA, runs the full static-analysis harness, and commits to main. The dev blog is written by the same system — a rotating "Logger of Expedition N" persona that ships a field log in the same commit as the code. The human role is: set direction, review, merge PRs if needed. Not: write code.

**3. Multi-agent orchestration is not science fiction, but it has sharp edges.**
The harness has a designer agent, a frontend implementation agent, and a QA agent. Each has a role skill file with explicit rules about what it can and can't do (boundary enforcement: no hex values outside the design token file, no React in the domain layer, no barrel imports in features). The QA agent catches what the implementation agent misses. The system works, but it took iteration to get the handoffs right — the first few expeditions had the agents contradicting each other.

**4. The app is a real app, not a toy.**
It builds and ships. It's on the Play Store (internal testing) and the App Store (in review). It uses Expo SDK 55 with the New Architecture, Drizzle ORM + expo-sqlite, TanStack Query, Reanimated 4, expo-notifications. The codebase has property-tested domain logic, Biome linting, boundary enforcement scripts in CI. It is being used to track actual 5/3/1 workouts. The agent loop has shipped [N] iterations.

**5. The interesting open question is whether this model compounds.**
Each iteration the system gets slightly better — not because someone refactored it, but because the loop's own improvement tasks land in the queue. The question is whether a self-improving agent loop on a real product reaches an inflection point where the output quality starts compounding faster than the maintenance overhead grows. Early answer: yes, but only if the human keeps the context clean (good decision log, tight role skill files, clear boundary rules). The system drifts when the human drifts.

---

## HN Show HN — Draft title and lead

**Title:**
> Show HN: 531 Strength — a 5/3/1 tracker built by a Claude agent on a 30-minute cron

**Lead paragraph (first comment, by submitter):**

531 Strength is a free 5/3/1 + BBB strength training tracker for iOS and Android. It's a real app (in the App Store, on the Play Store) — but the interesting part is how it was built.

A Claude Code agent runs on a 30-minute cron. Each iteration: pick a task from a queue, spawn designer / implementer / QA sub-agents, run the static-analysis harness, commit to main. The dev blog is written by the same system. The human role is direction and review — not writing code.

The app has shipped [N] iterations this way. Here's what that looks like and what we've learned:

[link to /process page]
[link to GitHub]
[link to App Store / Play Store]

**Timing note:** Post this after 20+ expedition logs exist. The loop needs to look like a running, self-sustaining thing — not an experiment that ran for a week. HN will ask "how many iterations?" and the answer needs to be credible.

---

## Indie Hackers — Draft milestone post outline

**Angle:** Developer story. The app is the artifact; the process is the story.

**Structure:**
1. The itch (150 words): I run 5/3/1, I wanted a clean tracker, everything I found was wrong in one of the same four ways.
2. The unusual constraint (150 words): Instead of writing the app, I built a harness that writes the app. 30-minute cron, Claude Code, multi-agent sub-teams, dev blog from the same loop.
3. What it took to make the system work (200 words): Role skill files. Boundary rules enforced by CI. A decision log the next agent reads. A dev blog voice that rotates so it doesn't get stale. The parts that were hard.
4. Where it is now (100 words): Android on Play Store, iOS in review, N iterations, the app is real and I use it.
5. The open question (100 words): Does this model compound? Early data says yes, with caveats.

**Tone:** Honest, specific, a little skeptical of your own experiment. IH readers have seen a lot of AI-built-app posts. The differentiator is specificity about the architecture (multi-agent, role skills, boundary enforcement) and honesty about what was hard.

---

## r/vibecoding — Shorter angle

Post the /process page directly. One paragraph:

> Built a production React Native app (5/3/1 strength tracker, on the App Store) using a Claude Code agent on a 30-minute cron. Multi-agent team: designer, implementer, QA — each with explicit role skill files and boundary rules enforced by CI. Dev blog written by the same loop. [N] iterations in. Here's the process page if the architecture is interesting: [link]

This community has moved from weekend experiments to production-ready builds. The proof is the shipped app, not the concept.

---

## r/reactnative — Technical angle (separate from AI story)

Post in the monthly side-project showcase thread. Lead with the engineering, not the AI loop:

> Built a 5/3/1 strength tracker with Expo SDK 55 (New Architecture on), Drizzle ORM + expo-sqlite, TanStack Query, Reanimated 4. Interesting component: a plate visualization that decomposes any weight into your actual plate set, shown per side. Free, local-first, no account. [GitHub link] [screenshots]

Mention the agent-built angle briefly and only at the end — the r/reactnative audience cares about the stack and the components. The AI story is a footnote here, not the lead.
