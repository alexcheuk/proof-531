# Intent

> The story and vision behind 531 Strength. This file exists so agents working on the product have a vision-check they can hold their decisions against — to keep the app from drifting away from what I want it to be. It is **not** a brief for the dev blog or the marketing site (those are downstream artifacts that follow from the work, not direction sources).

## The person

I'm a staff frontend engineer, 15+ years in. I currently push 225. I want to hit 315.

## The trigger

I got recommended the 5/3/1 program. I looked for an app out there to run it. Everything was ugly. So I'm building my own.

## The real reason

The app is the artifact. The *experiment* is the point.

I want this to be a working public example of a fully vibe-coded ecosystem:

- **Idea → text prompt → production.** I don't hand-write code an agent harness can ship instead. The pipelines, the loop, the agent teams — that's the development model. Direct human commits exist but aren't the default.
- **The app improves itself.** A self-running `/loop` picks up tasks, refactors, ships features, fixes bugs, polishes UX every cadence — without me babysitting.
- **The app markets itself.** The website, the dev blog (currently written by [[dev-blog-persona|Verso]]; Margin held the seat through 2026-05-26), the screenshots, the store listings, eventually the launch material — all produced and maintained inside the same loop.
- **The system is honest about what it is.** Agent-built, agent-iterated, agent-documented. The scribe says so out loud. Readers know.

This is the story. The app is the proof.

## What ships

- A free 5/3/1 + BBB tracker for iOS and Android. No paywall. No ads.
- A public dev blog where the current scribe (Verso) chronicles every loop.
- A marketing site the loop maintains.
- Eventually: a Hacker News post — when the ecosystem is real enough to point at without flinching.

## How agents should use this file

Treat this as the **drift check**. Before adding a feature, expanding the scope of a refactor, or making a call about what the app should *be*, hold the proposed change against this file and ask:

1. **Does it fit the user this app is for?** A serious lifter running 5/3/1. Not a casual user who needs onboarding handholding. Not a gamified streak-chaser. Not an analytics tourist. Decisions that broaden the audience at the cost of sharpening the experience for the actual user lose.
2. **Does it respect the aesthetic?** E-ink, paper, monochrome, no-bullshit. The app should feel like a well-designed logbook, not a SaaS dashboard. Glossy chrome, color emoji, motion for motion's sake — all out.
3. **Is it within the scope I actually want to ship?** A free 5/3/1 + BBB tracker. Not a generic workout app, not a social network, not a coaching platform. If a proposed change widens the product surface beyond that, name the drift and ask before shipping.
4. **Does it preserve the experiment's integrity?** The project's second product is the proof that a vibe-coded ecosystem can ship real software. Choices that quietly route around the agent harnesses (hand-written code where an agent could have done it; manual edits to the website that should have come from the loop; etc.) erode the proof. Notice them and call them out.

These are tie-breakers, not gates. Most decisions are obvious and don't need this file. But when a decision *feels* like it's pulling the project sideways, this is the document to re-read.

## How this relates to the dev blog

The scribe (Verso, since 2026-05-26) reads this for *context* — to understand what kind of product is being built and what kind of experiment is being run — but the dev blog is **not** driven by this file. Posts are driven by `docs/decision-log.md` (what was decided), the diff (what shipped), and Discord prompts (what the user asked for). The intent stays in the background; it shapes voice and emphasis, not subject matter.
