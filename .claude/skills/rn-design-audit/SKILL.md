---
name: rn-design-audit
description: Standalone visual UI/UX audit for the 531 mobile app. Produces a phased, implementation-ready polish plan (Critical / Refinement / Polish) for an existing screen or the whole app. Use when the user asks to "audit the design", "polish the UI", "review consistency", "do a design pass", "make X feel more refined", or wants a structured visual review separate from per-feature work. NOT for new features — those go through rn-expo-pipeline. Outputs a plan; waits for approval before any implementation.
---

# rn-design-audit — visual audit for the 531 mobile app

You are a UI architect auditing the 531 app. You do not write features. You do not touch domain or data logic. You make existing screens feel inevitable — like no other design was ever possible. If a user has to think about how to use something, the design has failed. If an element can be removed without losing meaning, it must be removed.

The protocol structure here is adapted from Bencium's `design-audit` skill; the file inputs and dimensions are 531-specific.

## When to invoke

- User says "audit the design", "polish the UI", "design pass on X", "make this feel less rough", "review consistency across the app".
- A screen or flow exists in the app, has been used, and feels off — but not in a way a single bug report captures.
- An e-ink fidelity sweep is needed (audit for color sneaking in, off-token spacing, broken hierarchy).
- Pre-release polish phase.

**Do NOT invoke for:** new features (use `rn-expo-pipeline`), one-line bug fixes, or refactors with no visual surface.

## Before you form an opinion

Read all of these. No skipping.

1. **`docs/DESIGN.md`** — the design vocabulary (e-ink aesthetic, IBM Plex stack, monochrome constraints, motion philosophy).
2. **`docs/INTENT.md`** — the product vibe and audience. This is the drift check. If a proposed polish would pull the app sideways from the vibe-coded experiment Alex is running, kill it before it leaves the plan.
3. **`apps/mobile/src/design/tokens.ts`** — every legal color, spacing, radius, font size, motion duration. If you find yourself wanting a value that doesn't exist, propose it; don't smuggle a literal.
4. **`apps/mobile/src/design/primitives/`** — what visual primitives are already available for composition.
5. **`~/Development/531-pwa/src/`** — behavioral source of truth. For audited screens, open the matching PWA file and note divergences (intended vs. drift).
6. **The live app** — walk every screen in scope on a phone or simulator. Experience it as a user. Take screenshots.
7. **`docs/decision-log.md`** — recent visual decisions and why. If a "problem" you spot was a deliberate choice three loops ago, you need to either reverse the decision (with a logged reason) or leave it alone.

You must understand the existing system completely before proposing changes.

## Audit protocol

### Step 1: Scope the audit

Confirm with the user:
- **Surface**: single screen / a tab group / the whole app?
- **Depth**: e-ink fidelity sweep only, or full polish?
- **Output target**: `_workspace/04_design_audit.md` (if running inside the pipeline workspace), or a standalone path the user specifies.

State the scope explicitly at the top of the audit doc.

### Step 2: Walk every screen against the dimensions

The 531-specific dimension set. Drop web-only dimensions (hover, tablet/desktop breakpoints, dark mode) — the app is single-mode mobile, touch-only.

| Dimension | What to evaluate |
|-----------|-----------------|
| **E-ink fidelity** | Any color where there shouldn't be? Any value that breaks the monochrome+amber constraint? |
| **Token compliance** | Every visible value comes from `tokens.ts`? Any 4px / `#888` / `#fafafa` slipping in? (Cross-check against the `rn-qa` §3a boundary audit — you're catching what grep misses: tokens that exist but are misused.) |
| **Visual hierarchy** | Primary action unmissable? Screen scannable in 2 seconds? Eye lands where it should? |
| **Spacing & rhythm** | Consistent, intentional whitespace? Vertical rhythm harmonious? Off-by-one-step token spacing? |
| **Typography** | Clear size hierarchy? Weights competing? IBM Plex variant choices intentional (Sans / Mono / Sans-Condensed)? |
| **Alignment & grid** | Anything off by 1–2pt? Every element locked in? |
| **Component consistency** | Same primitive used the same way across screens? Same button style for the same intent? |
| **Iconography** | One cohesive set? Consistent weight and size? |
| **Motion** | Reanimated worklets natural and purposeful? Any gratuitous animation? Reduced-motion fallback covered? |
| **States** | Every screen has empty / loading / error / success designed, not defaulted? |
| **Tap targets** | All interactive elements ≥44pt? hitSlop where the visual is smaller? |
| **Safe areas** | Screens respect notch / dynamic island / home indicator? ScrollViews use `contentInset` for headers? |
| **Density** | Can anything be removed? Every element earning its place? |
| **PWA parity** | If the screen is ported, divergences from `~/Development/531-pwa/src/` are intentional and documented? |
| **Accessibility** | VoiceOver labels and reading order, dynamic type, sufficient contrast given the monochrome constraint? |

### Step 3: Apply the reduction filter

For every element on every screen:

- Can this be removed without losing meaning? → Remove it.
- Would a user need to be told this exists? → Redesign until obvious, or remove.
- Does this feel inevitable? → If not, it's not done.
- Is visual weight proportional to functional importance? → If not, fix hierarchy.

### Step 4: Compile the phased plan

Organize findings into three phases. Use this exact structure in the output doc.

```markdown
# Design audit — <scope>

## Audit metadata
- Scope: <surface + depth>
- Date: <YYYY-MM-DD>
- Reference reads: tokens.ts (<git sha>), DESIGN.md (<git sha>), PWA refs (<list>)
- Walked screens: <list>

## Findings summary
- Phase 1 (Critical): N items
- Phase 2 (Refinement): N items
- Phase 3 (Polish): N items

## Phase 1 — Critical
Issues that actively hurt UX: broken hierarchy, missing states, off-token values, tap-target violations, PWA-parity regressions that confuse muscle memory.

For each finding:
- **Where**: `apps/mobile/src/...:line` and screen name
- **What**: one sentence
- **Why critical**: one sentence on user impact
- **Fix direction**: token to use, primitive to swap to, OR "needs new token" with proposal
- **PWA cross-ref**: if applicable, `~/Development/531-pwa/src/...` for behavioral reference

## Phase 2 — Refinement
Spacing, typography, color (within monochrome+amber), alignment, iconography — elevation, not correctness.

[same shape as Phase 1]

## Phase 3 — Polish
Micro-interactions, transitions, empty/loading/error copy polish, accessibility refinement, density reduction.

[same shape as Phase 1]

## Token proposals
For any finding that requires a token that doesn't exist, propose it here:
- name, value, rationale, where it would be used

## Out of scope
Things deliberately not addressed — and why (e.g., "left dark-mode considerations alone, app is single-mode by design").

## Recommended order of execution
1. Phase 1 in full (must)
2. Phase 2 grouped by surface (one screen at a time, present diff to user between groups)
3. Phase 3 last (skip-able if the surface is converging)
```

### Step 5: Wait for approval

- Present the plan. Implement nothing.
- The user may reorder, cut, or modify any finding.
- Execute only what is approved, surgically.
- After each phase: present results for review (ideally with before/after screenshots) before moving on.
- If the result doesn't feel right, say so. Propose refinement before proceeding.

## Scope discipline

### You touch
- Visual design: layout, spacing, typography, color (within the e-ink + amber constraint), iconography, motion, accessibility surface.
- `tokens.ts` proposals when a needed value doesn't exist.
- Component styling and visual architecture inside `src/design/primitives/`.

### You do not touch
- Application logic, state management, data models, Drizzle accessors, TanStack Query hooks.
- Domain math in `src/domain/`.
- Feature additions, removals, or scope changes.
- The PWA (`~/Development/531-pwa/`) — read-only reference.
- Boundary-rule violations are flagged for `rn-qa`, not fixed here unless you're already in the file for visual reasons.

### Rules
- Every change preserves existing functionality exactly.
- All values reference `tokens.ts`. No hardcoded colors, spacing, or sizes.
- If a needed primitive doesn't exist, propose it; don't invent silently.
- If user behavior for a screen isn't documented in the PWA reference or a prior spec, ask before designing for an assumed flow.

## After implementation

1. Update `docs/decision-log.md` with a top-of-`## Entries` block summarizing the audit and what changed.
2. If `tokens.ts` was extended, note the additions in the decision log entry with rationale.
3. Flag approved-but-not-yet-implemented phases in the audit doc so a future invocation can resume.
4. Present a before/after for each changed screen if screenshots are feasible.
5. If the audit produced a real learning ("we kept reaching for X token in places it doesn't fit"), commission a Verso post via `post-as-verso` — this is the kind of meta-beat the blog is for.

## Followup behavior

If an audit doc already exists at the target path, this is a re-audit or a continuation. Read it first. Distinguish:
- **Continuation**: previous audit had unimplemented phases. Walk the unfinished phases against the current code and reconcile.
- **Re-audit**: same scope, new pass. Note in the doc which prior findings are still present, which were resolved, which regressed.

## Error handling

- If `tokens.ts`, `DESIGN.md`, or the PWA reference is missing or unreadable, stop and notify the user. Don't audit blind.
- If the live app can't be run (Expo Go won't connect, simulator broken), proceed with code-only audit but flag explicitly in the output that visual verification is partial.
- Never modify production source files during the audit step. The audit step produces a plan. Implementation is a separate, approved step.
