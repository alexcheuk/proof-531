---
name: rn-design-spec
description: Produce a complete React Native + Expo design spec from an idea, description, or wireframe for the proof-531 codebase. Use when starting any new feature, porting a PWA screen, or revising an existing screen. The output spec drives implementation by the rn-frontend agent and verification by the rn-qa agent. Covers screen flow, per-screen layout, design tokens, data contracts, domain logic, accessibility, and PWA parity.
---

# rn-design-spec — produce an implementation-ready design spec

This skill is used by the `rn-designer` agent (and may be invoked directly when iterating on a spec) to turn fuzzy design input into an unambiguous markdown spec that another agent can implement without re-asking design questions.

## When this skill triggers

- Starting a new RN/Expo feature for proof-531
- Porting a screen from `~/Development/531-pwa` to React Native
- Revising or expanding an existing design spec
- Adding a new screen/flow to an existing feature

If the request is "fix this bug" or "refactor this file", do NOT use this skill — those are implementation tasks.

## Inputs you can expect

| Input | Source | Notes |
|---|---|---|
| User idea / description | `_workspace/00_input/brief.md` or chat | Free text. May be a sentence or paragraphs. |
| Wireframe | image path or chat attachment | Optional. Treat as guideline, not pixel law. |
| PWA reference path | `_workspace/00_input/pwa_refs.md` or implied | When porting. Search for the matching file if not given. |
| Existing spec | `_workspace/01_design_spec.md` | If present, this is a revision — preserve unchanged sections. |

## Workflow

### Step 1: Resolve the PWA reference (if applicable)

Before writing anything, decide whether this is a port or greenfield.

- If the user names a PWA file/screen: read it.
- If the user describes an existing PWA screen by behavior: `find ~/Development/531-pwa/src -type f \( -name '*.tsx' -o -name '*.ts' \)` and grep for the named screen/component.
- If the user is greenfield ("brand new feature, doesn't exist in PWA yet"): no PWA reference. Note this explicitly in the spec.

Read the matching PWA file IN FULL. Note: behavior, copy, transitions, error/empty states.

### Step 2: Map to project boundaries

Decide what each piece of the feature will become BEFORE laying out screens:

| Concern | Destination |
|---|---|
| Visible UI primitives | `src/design/primitives/` (reuse first; only add when nothing composes) |
| Colors, spacing, radii, motion | `src/design/tokens.ts` (no inline hex/px anywhere else) |
| Pure 5/3/1 calculations | `src/domain/` (no React/async/DB) |
| Database tables and queries | `src/data/` (Drizzle + accessors + hooks) |
| Screen composition | `src/features/<feature>/` |
| Route shell | `src/app/<route>.tsx` (≤30 lines) |

When new domain math is needed, name the function and its inputs/outputs in the spec so the frontend agent can TDD it.

### Step 3: Write the spec

Write `_workspace/01_design_spec.md`. Use this skeleton verbatim — `rn-qa` parses these section names:

```markdown
# Design spec: <feature name>

## Intent
<one paragraph: what user is trying to accomplish, why>

## PWA reference
<paths under ~/Development/531-pwa/, with a one-line port/divergence note each>
<or "N/A — greenfield">

## Screens & flow
<ASCII or mermaid flow of screens, transitions, back behavior, deep links>

## Per-screen breakdown

### <Screen 1>
- Layout: <sections, sizing, safe areas>
- Tokens: <list referenced tokens from src/design/tokens.ts>
- States:
  - Empty: <copy + visual>
  - Loading: <skeleton? spinner? token reference>
  - Error: <copy + recovery action>
  - Success: <happy path>
- Interactions: <tap targets, gestures, haptics style, animations>
- Accessibility: <labels, roles, focus order, reduced-motion fallback>

### <Screen 2>
...

## Data contract
- New Drizzle tables: <name, columns w/ types and constraints>
- TanStack Query hooks: <hook name, cache key, invalidation>
- Optimistic mutations: <onMutate / onError shape>

## Domain logic
<function signatures + property to test, or "None">

## New primitives
<additions to src/design/primitives/ — reuse first>

## Out of scope
<bulleted list>

## Open questions
<bulleted list, or "None">
```

### Step 4: Coverage checklist

Before signaling completion, verify the spec answers ALL of these. If any "no" remains, either write the answer or move it to Open questions:

- [ ] What screen(s) does the user see, in what order?
- [ ] What does each screen look like in empty / loading / error / success states?
- [ ] What tokens does each screen reference? (None should be raw hex/px.)
- [ ] What data is read; what data is written?
- [ ] What domain math is required (if any)?
- [ ] What happens on every tappable element? (Including back / cancel.)
- [ ] What does VoiceOver/TalkBack read for each element?
- [ ] What is the reduced-motion fallback?
- [ ] What is explicitly out of scope?

## Quality bars

| Symptom | Fix |
|---|---|
| "It should look modern" | Reject — name specific tokens. |
| "Use a nice animation" | Reject — name the worklet, shared value, or `withTiming` config. |
| Spec quotes raw `#1A1A1A` or `16px` | Replace with token reference; add the token if needed. |
| Spec says "and other states" or "etc." | Enumerate every state. Ambiguity ships as a bug. |
| Spec references a primitive that doesn't exist | Mark as "new primitive" in the New primitives section. |

## When to escalate vs. decide

You may DECIDE, with brief rationale in the spec:
- Choice between two existing tokens
- Placement of a component within an established layout pattern
- Adoption of a standard accessibility pattern from the existing codebase

You must ESCALATE (via Open questions or SendMessage to orchestrator):
- New token that affects brand identity (primary color, brand typography)
- Behavior that contradicts the PWA reference without obvious reason
- Data model change that breaks existing queries
- Anything that requires a product decision (pricing, gating, copy with legal implications)

## Revisions

If `_workspace/01_design_spec.md` already exists, you are revising. Rules:
1. READ it first.
2. Preserve sections the user did not ask to change.
3. Apply the change minimally.
4. Append a `## Revision <YYYY-MM-DD>` block at the bottom describing what changed and why.

## References

- Architecture rules: project root `CLAUDE.md`
- Engineering spec: `docs/superpowers/specs/2026-05-22-rn-port-from-pwa-design.md`
- Product spec: `docs/DESIGN.md`
- Design tokens: `apps/mobile/src/design/tokens.ts`
- PWA reference root (read-only): `~/Development/531-pwa/src/`
