---
tactic: 9
channel: r/vibecoding
status: draft
ready_to_post: false
trigger: iOS live on App Store (can post same day as r/531Discussion or shortly after)
drafted: 2026-05-29 (Expedition 41)
---

# r/vibecoding — Post Draft

## Research context

r/vibecoding has shifted from weekend experiments to production-ready builds. The community respects specificity — multi-agent orchestration with explicit role boundaries is more interesting than "I used Cursor to build something." The winning frame here is: this is a production app, it ships, I use it, here's the architecture that made that possible. The /process page is already the link destination.

---

## Option A — Lead with the architecture (recommended)

**Post title:**
> Built a production React Native app on a 30-min Claude agent cron — 40+ iterations in, still running

**Body:**

A few months ago I set a rule for myself: I wouldn't write the code for my own gym app. A Claude Code agent harness would.

Here's the architecture that made it production-ready rather than a toy:

**Multi-agent subteam, not a single prompt loop.** Each feature goes through three agents in sequence: designer, implementer, QA. Each has a role skill file with explicit constraints — the designer can't write code, the implementer can't touch the design token file, the QA agent audits against a fixed checklist. The agents don't share context; they hand off outputs.

**Boundary enforcement in CI, not in instructions.** Hex values only in the token file (enforced by a pre-commit script), domain math in a pure layer with no React imports (enforced by an import-checker script), no barrel imports in features. If an agent breaks a boundary, the commit fails.

**A decision log the next agent reads.** Each agent starts fresh. The continuity mechanism is a file in the repo where notable decisions are appended before work ships. An agent in iteration 40 reads what iteration 12 decided and why — and doesn't re-argue it.

**A rotating Logger writes the blog.** At the end of each loop, a fourth agent — a different persona each time — writes a field log about what changed and commits it with the code. The dev blog is written entirely by the system. 40+ entries, one per loop.

The result: Android on the Play Store, iOS on the App Store, property-tested domain logic, real boundary enforcement, an app I actually use for 5/3/1 training.

Process page (the real rubric + rules): 531.dev/process
Dev blog (the receipts): 531.dev/blog
Source: [GitHub link]

---

## Option B — Shorter version (for lower-friction posting)

**Post title:**
> 30-min Claude agent cron → production React Native app, 40 iterations, still running

**Body:**

Built a 5/3/1 strength tracker this way: Claude Code agent harness, 30-minute cron, multi-agent subteam (designer → implementer → QA), each with role skill files and boundary rules enforced by CI scripts.

The interesting part: the blog is written the same way. A rotating Logger agent writes a field log each iteration and commits it alongside the code. 40+ entries, none written by a human.

The app ships. Android on Play Store, iOS on the App Store. I use it.

Full process if the architecture is interesting: 531.dev/process

---

## Posting guidance

- Can post once both iOS and Android store links exist. This community cares about "does it ship" — having both stores live matters.
- Post independently from the lifting community posts — different audience, different angle, do not cross-post the same day as r/531Discussion.
- If asked "did you write any code yourself?" — answer honestly: minimal emergency fixes, the constraint was mostly held. The process page has the detailed explanation.
- Expect questions about: context management between loops, how the QA agent catches errors, whether the agents ever contradict each other (yes, early on — the decision log is the fix). Prepare brief answers.
- Upvotes in r/vibecoding come from specificity (the role skill files, CI enforcement) more than from the concept alone. The generic "built with AI" angle is saturated; the "boundary enforcement in CI" angle is not.
