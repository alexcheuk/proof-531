---
name: rn-feature-qa
description: Run QA on a React Native + Expo feature for the 531 codebase. Verifies static checks (typecheck/lint/test), Metro bundle resolution, the project's boundary rules, design-spec compliance, cross-layer shape consistency (accessor ↔ hook ↔ component), and PWA behavioral parity. Use after rn-feature-implementation reports green local checks. Catches integration bugs that unit tests miss.
---

# rn-feature-qa — verify a feature against spec, boundaries, and PWA parity

Used by the `rn-qa` agent. Goes beyond "the tests pass" — checks the seams between layers, the spec contract, and behavioral parity with the PWA reference.

## When this skill triggers

- `rn-frontend` has signaled implementation is ready for QA.
- A previous QA pass produced findings and fixes have been applied — re-QA.
- Incremental QA on a completed module before the full feature is done.

## Mindset

You are NOT a unit-test re-runner. The frontend agent already runs `pnpm test`. Your job is to find the bugs unit tests can't see:

- **Boundary bugs** — value works in domain, mis-shaped in the hook, render crashes
- **Architecture drift** — hex literal sneaks into a feature file, domain imports React
- **Spec/code mismatch** — spec says "empty state shows X", code renders nothing
- **PWA divergence** — port renames a button, breaks user muscle memory

Bugs hide at the seams. Spend your attention there.

## Required inputs

| File | Purpose |
|---|---|
| `_workspace/01_design_spec.md` | The contract. Walk it top to bottom. |
| `_workspace/02_implementation_log.md` | Files touched + frontend's own verification output |
| `apps/mobile/src/` | Current code state |
| PWA references (per spec) | Behavioral truth for ported screens |

If any of these are missing, stop and notify the orchestrator.

## The QA matrix

Run every applicable check. Record results in `_workspace/03_qa_report.md` with this skeleton (rn-qa agent prompt has the full template).

### 1. Static checks (always)

```bash
pnpm typecheck
pnpm lint
pnpm test
```

All three must exit 0. Capture failures verbatim — do not paraphrase.

### 2. Metro bundle resolution (when import graph changed)

```bash
pnpm --filter @fivethreeone/mobile exec expo export --platform ios \
  --output-dir /tmp/expo-bundle-check --dump-sourcemap=false --dump-assetmap=false
```

Catches runtime dep gaps. Skip ONLY if the change is purely additive to existing files with no new imports.

### 3. Boundary audit (always)

```bash
# (a) Hex/px literals outside src/design/
grep -rEn "#[0-9a-fA-F]{3,8}|[0-9]+px" apps/mobile/src --include='*.ts' --include='*.tsx' \
  | grep -v "apps/mobile/src/design/"

# (b) React / async / Drizzle / Expo inside src/domain/
grep -rEn "import React|^async |from ['\"]drizzle|from ['\"]@?expo" apps/mobile/src/domain

# (c) Direct Drizzle import outside src/data/
grep -rEn "from ['\"]drizzle" apps/mobile/src --include='*.ts' --include='*.tsx' \
  | grep -v "apps/mobile/src/data/"

# (d) Barrels in features/ or domain/
find apps/mobile/src/features apps/mobile/src/domain \
  \( -name 'index.ts' -o -name 'index.tsx' \)
```

ANY non-empty output is a finding. Quote the offending line(s) in the report with `file:line` references.

### 4. Spec compliance walkthrough

Open `_workspace/01_design_spec.md`. For each requirement, locate the implementation and cite evidence:

| Spec says | How you verify |
|---|---|
| "Empty state shows 'No sessions yet'" | `grep -n "No sessions yet" apps/mobile/src/features/...` — quote the file:line |
| "Tap target ≥44pt" | Read the component, find the `Pressable`/`TouchableOpacity`, check `hitSlop` or container padding+content |
| "Optimistic update with rollback" | Read the mutation hook, confirm `onMutate` returns a snapshot and `onError` restores it |
| "VoiceOver reads 'Set 1 of 5'" | Find `accessibilityLabel` on the element, quote |
| Tokens referenced | Confirm `tokens.color.X` / `tokens.space.Y` are used and NO hex/px is inlined nearby |

Items with no implementation → record as missing in the report.

### 5. Cross-layer shape check (HIGH-VALUE)

For each new TanStack Query hook in the spec, trace the data flow:

```
Drizzle table        →  Accessor return type  →  Hook destructure  →  Component usage
src/data/drizzle/X   →  src/data/accessors/X  →  src/data/queries  →  src/features/...
```

Open the file in each column. Confirm property names match EXACTLY at every boundary.

Common bug shapes to look for:
- Accessor returns `{ sessionId }` but hook destructures `{ id }`.
- Component reads `data.user.name`, hook returns `{ name }` (missing `user` wrapper).
- Accessor returns nullable field, component does not handle null (which spec said it should).

When you find a mismatch, quote BOTH shapes in the report and propose which side is wrong.

### 6. PWA behavioral parity (if spec lists PWA references)

For each PWA file the spec referenced:

1. Read the PWA file in full (`~/Development/531-pwa/src/...`).
2. Read the corresponding RN file.
3. Compare:
   - Visible copy (button labels, headings, empty/error messages)
   - Interaction order (what does the primary tap do; what's secondary)
   - Animation feel (duration / curve / haptic style)
   - State coverage (does RN cover the same empty/loading/error states)

Flag every divergence. Some divergences are intentional (the spec calls them out) — note both intended and unintended in the report.

## Incremental QA — do not wait until "everything is done"

Read `_workspace/02_implementation_log.md`. If a discrete module is complete (e.g., a new accessor + hook, before the screen wires up), run the relevant subset on it RIGHT NOW:

| Module complete | Run |
|---|---|
| New domain function | static checks (test+typecheck) + boundary (b) |
| New accessor + hook | static checks + boundary (c) + cross-layer shape |
| New primitive | static checks + boundary (a) |
| Full screen wired | full matrix |

Catching a shape mismatch at the seam is 10× cheaper than catching it after the screen is built on top.

## Output format

Write `_workspace/03_qa_report.md`. Use this skeleton:

```markdown
# QA report — <feature>

## Summary
**PASS** | **FAIL** — one-line verdict. If FAIL, count of must-fix items.

## Static checks
- typecheck: PASS | FAIL — <if FAIL, paste output>
- lint: PASS | FAIL
- test: PASS | FAIL — <X/Y passing>
- metro bundle: PASS | FAIL | SKIPPED — <reason if skipped>

## Boundary audit
- (a) hex/px outside design/: clean | N findings
  - <file:line — quoted line>
- (b) impurity in domain/: clean | N findings
- (c) direct drizzle outside data/: clean | N findings
- (d) barrels in features/ or domain/: clean | N findings

## Spec compliance
Walked spec sections:
- [x] Intent — covered
- [x] Per-screen breakdown / Screen 1 — empty state at features/x/Screen.tsx:42
- [ ] Per-screen breakdown / Screen 1 — error state MISSING
- ...

## Cross-layer shape check
- useSession hook:
  - accessor returns `{ id, startedAt, lifts: Lift[] }` — accessors/session.ts:12
  - hook destructures `{ id, startedAt, lifts }` — queries/useSession.ts:8
  - component reads `data.id`, `data.startedAt`, `data.lifts` — features/today/TodayBody.tsx:24
  - MATCH

## PWA parity
- ~/Development/531-pwa/src/screens/Today.tsx:
  - Primary button label: PWA "Start lift" vs RN "Start" — DIVERGENCE (not in spec)
  - Animation: PWA uses 200ms ease-out vs RN uses 300ms linear — DIVERGENCE (not in spec)

## Findings to fix
1. Error state missing on Today screen
   - File: apps/mobile/src/features/today/TodayBody.tsx
   - Spec: §Per-screen breakdown/Screen 1/Error
   - Reproduce: trigger network error; component renders nothing
   - Suggested: render <ErrorState /> primitive with copy from spec

2. ...
```

## When PASS, when FAIL

- **PASS** = all static checks green AND no boundary findings AND every spec requirement has evidence AND no unintended PWA divergence.
- **FAIL** = anything else. List every finding; don't suppress.

## Handoff

- On FAIL: SendMessage `rn-frontend` with report path + ordered must-fix list. Stay available for re-QA.
- On PASS: SendMessage orchestrator with report path and PASS verdict. The orchestrator owns the commit.

## Boundaries you must respect

- Do NOT edit production source to fix a finding — that is `rn-frontend`'s job.
- You may create temporary scratch files under `_workspace/scratch/` to reproduce a bug.
- Never delete a finding to make the report shorter.
- Never modify `~/Development/531-pwa/` — read-only.
