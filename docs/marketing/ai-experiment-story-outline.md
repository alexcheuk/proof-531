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

## HN Show HN — Revised title and lead (updated Expedition 40)

### Strategy update based on HN research

Data from Sturdy Statistics' 2025 Show HN analysis shows AI-related posts are in a "quadrant of death": they attract early cluster votes from AI-interested readers but don't resonate with the broader HN audience. Posts that lead with "built by an AI / Claude agent" pattern underperform vs. their early vote signal. The current title leads too hard with the AI system angle.

The better HN angle: lead with the real human story (personal itch, real problem, specific product), make the agent loop the interesting secondary fact — not the headline claim. HN values the "tryable, real thing" over the "look at my AI system" post.

The /process page (531strength.com/process) is already built and strong — it handles the deep explanation so the HN post doesn't have to front-load architecture details.

---

**Title option A (recommended — personal/real angle first):**
> Show HN: 531 Strength — I let a Claude agent build my gym app, start to finish

**Title option B (app-first, agent secondary):**
> Show HN: 531 Strength — free 5/3/1 tracker, built entirely by a Claude agent on a cron

**Title option C (more technical, for technical audience):**
> Show HN: A Claude agent on a 30-min cron built this 5/3/1 app — N iterations later

---

**Recommended lead paragraph (first comment, by submitter):**

I lift, I wanted a 5/3/1 + BBB tracker that did the math and left everything else out, and everything I found was either too expensive or too generic. So I built one — but with a constraint: I wouldn't write the code. A Claude Code agent harness on a 30-minute cron would.

[N] iterations later, the app is on the App Store and Play Store. The interesting part isn't the app — it's what running a real product on an agent loop for this long taught me about where the model works and where it fails.

What I found: the quality compounded. The skill wasn't prompting — it was context hygiene. The agents drift when the human drifts. The dev blog (written by the same system, one post per loop) ended up being the most honest receipt of a vibe-coding experiment I've encountered.

The app is free, no account, local SQLite. Source on GitHub.

- Process: 531strength.com/process
- Dev blog: 531strength.com/blog
- GitHub: [link]
- iOS: [App Store link]
- Android: [Play Store link]

---

**Timing note:** Post after 20+ expedition logs exist (already satisfied — 84+ iterations as of Expedition 84). HN will ask "how many iterations?" — the answer at 70+ is credible. Post on a weekday between 8am–10am US Eastern.

**What HN will likely ask:**
- "Did you actually write any code?" — Answer: minimal, some emergency fixes. The constraint was mostly held.
- "Is the app actually good or just a demo?" — Answer: it's used for real workouts. The proof is the feature specificity: plate math, AMRAP detection, BBB percentages, rest timers. Toy demos don't have per-side plate visualization.
- "Why 30 minutes?" — Answer: short enough to stay honest about what shipped, long enough to ship something real.
- "What's the failure mode?" — Answer: context drift. When the decision log isn't maintained, agents re-argue settled questions. The system drifts when the human drifts.

**What NOT to say in the HN comments:**
- Don't be defensive about the AI angle — HN is skeptical of AI posts. Let the specificity speak.
- Don't claim the agent is autonomous in a way that's overstated — the human does the direction-setting, queue management, and context hygiene.
- Don't pitch the app's features as primary — that's a Reddit angle. HN cares about the engineering story.

**New signal (Expedition 42):** Workout.cool (an open-source fitness coaching platform) got 827 points and 233 comments on Show HN in May 2026 — one of the highest-performing fitness Show HN posts in recent history. The top criticism was programming quality: bad exercise order, no progression logic, too many exercises per session. This is directly relevant to how 531 Strength should pre-answer HN's skepticism. If HN asks "is the program any good?", the answer is: "I didn't design the program — Jim Wendler did, and it's one of the most respected strength training systems in the world. The app implements it faithfully." That deflects the programming criticism entirely and borrows credibility from a proven source. Add this framing to the submitter's first comment.

**New signal (Expedition 44):** The App Store review queue has been explicitly delayed in 2026 by AI-app floods — iOS submissions are up 89% year-over-year and Apple's human review team is under pressure (9to5Mac, March 2026; Apple confirmed processing 200,000+ submissions/week). HN is likely to have read this coverage. If anyone raises "Apple is killing vibe-coded apps", the factual answer: Apple's concern is apps where the developer cannot explain or defend their code — the kind of app where no engineering was involved at all. 531 Strength's architecture (CI-enforced boundaries, property-tested math, multi-agent QA) is the opposite of what Apple is flagging. The fact that the app is in the review queue at all is proof it cleared the submission bar. Use this to reframe the AI risk conversation.

**New signal (Expedition 46):** Competitive research on the existing "531 Strength" app (App Store id1062989244, 4.9 stars, 11K ratings) confirmed three documented user pain points in App Store reviews: (1) the rest timer stops when leaving the app, (2) no plate math / plate calculator, (3) no BBB support. These are the exact three differentiators the new 531 Strength app ships with. This isn't a gap inferred from roundup articles — it's documented in the competitor's own reviews. If HN asks "how is this different from existing 5/3/1 apps?", the answer is: "The most-reviewed existing 531 tracker (4.9 stars, 11K ratings) has three documented complaints in its App Store reviews: rest timer breaks when you leave the app, no plate math, no BBB. This app was built to fix exactly those three things." This is a precise, evidence-backed differentiator that lands far better than a generic "it's cleaner" claim.

**New signal (Expedition 62) — Liftosaur has BBB support, but is a PWA:** Liftosaur (free, available on iOS/Android/web) now includes 5/3/1 Boring But Big as a built-in program. This is a meaningful competitive development — the "free tier with BBB" gap is now less clear-cut. However: Liftosaur is architecturally a Progressive Web App (PWA) packaged as a native installer. Its own GitHub issue tracker (issue #66) documents that the Android rest timer does not notify when the screen is off or when the app is backgrounded — the developer confirmed this is a PWA limitation. iOS has the same architectural ceiling: PWAs on iOS cannot deliver background audio or push notifications when a timer fires. As of May 2026 research, this limitation remains in place. If HN or any other community asks "what about Liftosaur?", the answer is factual and short: it has BBB support, it's free, but it's a PWA and the rest timer breaks in background — which is documented in the developer's own issue tracker, not an opinion. The native app distinction (expo-notifications on iOS, react-native-notify-kit live chronometer notification on Android) is the concrete technical differentiation that Liftosaur cannot close without rewriting the architecture.

**New signal (Expedition 64) — Claude Code Routines launched April 2026, post-dating this project:** Anthropic launched Claude Code Routines on April 14, 2026 — a feature that runs scheduled Claude Code sessions on Anthropic's cloud infrastructure. The three trigger types (scheduled, API, GitHub webhooks) essentially productize what 531 Strength's homelab cron loop has been doing since early 2026. This is a useful framing hook for HN: the 531 Strength loop predates Anthropic's own official scheduled-agent product by months. The homelab cron was not a workaround for a missing feature — it was the pattern that the feature was eventually built on. If HN asks "why not use Claude Code Routines?", the honest answer is: this loop predates them, and the homelab setup gives finer-grained control over context management, role skill files, and the multi-agent handoff chain that Routines don't expose. The framing is not "better than Routines" but "this is what the pre-Routines era looked like, and it worked." Specifically, Pro plan Routines cap at 5 runs per day — 531 Strength runs every 30 minutes, which is 48 runs per day. The homelab cron is architecturally what makes that cadence possible. Do not lead with this in the HN post; it's a comment-ready answer if someone raises "why didn't you just use Routines?" — and it reframes the project as a genuine pioneer, not a workaround.

**New signal (Expedition 76) — Claude Opus 4.8 + Dynamic Workflows (May 28, 2026):** Anthropic shipped Claude Opus 4.8 and Dynamic Workflows (research preview in Claude Code) on May 28, 2026. Dynamic Workflows inverts the builder approach: Claude writes the orchestration script at runtime, spawning up to 1,000 parallel subagents, deploying adversarial verification, and iterating until answers converge. The intended use cases are one-shot high-parallelism tasks: codebase audits, large migrations (Jarred Sumner used it to port 750,000 lines of Bun from Zig to Rust in 11 days), adversarial verification.

The 531 Strength harness is architecturally different and deliberately so. If HN asks "isn't this just something you could do with Dynamic Workflows now?", the comment-ready answer: Dynamic Workflows optimizes for one-shot high-parallelism tasks — Claude decides at runtime how to decompose, what to spawn, when it's done. The 531 Strength harness optimizes for bounded, consistent execution across 84+ iterations of a production app. The roles are fixed in advance (designer → implementer → QA), the boundaries are enforced by CI (not runtime instructions), and the handoffs are deterministic. That's not a limitation — it's the architecture that makes iteration 84 reliable without the human reviewing every decision. Dynamic Workflows would make a different decomposition call on iteration 77 than it made on iteration 1. The 531 Strength harness makes the same call. That's the tradeoff the architecture was designed to favor.

Don't lead with this in the post body. It's a comment-prep answer for the "isn't this obsolete now that Anthropic has Dynamic Workflows?" challenge — which will come up on HN given the May 28 timing of both.

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
