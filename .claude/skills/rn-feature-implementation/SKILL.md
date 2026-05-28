---
name: rn-feature-implementation
description: Implement a React Native + Expo feature in the 531 codebase from a design spec. Use when an rn-designer spec is ready and code must be written across design/data/domain/features/app layers. Enforces strict boundary rules, TDD for domain code, Metro-bundle-clean imports, and component tests that assert behavior (not pixels). Hand off to rn-qa when local verification is green.
---

# rn-feature-implementation — implement an RN/Expo feature from spec

Used by the `rn-frontend` agent to convert `_workspace/01_design_spec.md` into working, verified code.

## When this skill triggers

- A design spec is ready and implementation must begin.
- QA has reported failures that need fixing.
- An in-progress implementation needs continuation.

If there is no design spec, STOP and ask the orchestrator to run `rn-designer` first.

## Required reading before touching code

1. `_workspace/01_design_spec.md` — the contract. Read top to bottom.
2. Project root `CLAUDE.md` — boundary rules, dev commands, forbidden paths.
3. `apps/mobile/src/design/tokens.ts` — every value you use must come from here.
4. For ported screens: the matching file under `~/Development/531-pwa/src/` (read-only, if available locally — external contributors may not have this path).

## The boundary rules (REVIEWER-ENFORCED)

| # | Rule | Common violation |
|---|---|---|
| 1 | `src/design/` is the only place hex/px literals live | `style={{ color: '#000', padding: 16 }}` outside design/ |
| 2 | `src/domain/` is pure | `import React`, `await`, `from 'drizzle'` in a domain file |
| 3 | `src/data/` owns persistence | Component does `import { db } from '../data/drizzle'` directly |
| 4 | `features/` is composition; routes are thin shells | 200-line `app/foo.tsx` doing layout, data, and navigation |
| 5 | No barrels in `features/` or `domain/` | `features/today/index.ts` re-exporting everything |
| 6 | Import direction: `app → features → (design \| data \| domain)` | `domain/` importing from `data/` |

Internalize these. Reviewer rejects on violation; QA flags via grep.

## Workflow

### Step 1: Plan the file list (no code yet)

From the spec, enumerate every file that will be created or edited. Group by layer:

```
domain:    apps/mobile/src/domain/<x>.ts                + __tests__/<x>.test.ts
data:      apps/mobile/src/data/drizzle/<table>.ts      (if new table)
           apps/mobile/src/data/accessors/<x>.ts
           apps/mobile/src/data/queries/use<X>.ts
design:    apps/mobile/src/design/tokens.ts             (if new tokens)
           apps/mobile/src/design/primitives/<X>.tsx    (if new primitive)
features:  apps/mobile/src/features/<feature>/<Screen>.tsx
app:       apps/mobile/src/app/<route>.tsx              (thin shell, ≤30 lines)
```

Write this list to `_workspace/02_implementation_log.md` under `## File plan`. This becomes the QA agent's checklist.

### Step 2: Bottom-up implementation order

Implement in dependency order so each layer's tests can be run before the next:

1. **Tokens** (if any new ones). Edit `tokens.ts`. No tests — referenced by typecheck.
2. **Domain** (TDD: red → green). For each pure function:
   - Write the unit test first. Run `pnpm test --testPathPattern domain/<x>`. Confirm RED.
   - Implement the function. Re-run. Confirm GREEN.
   - Add a `fast-check` property test where the contract has algebraic structure (idempotence, monotonicity, inverse, etc.).
3. **Data** (table → accessor → hook). Confirm types compile after each step.
4. **Design primitives** (if any new ones).
5. **Features** (the screen composition). Add component tests asserting BEHAVIOR (interactions, state transitions), not pixel positions.
6. **Routes** (thin shells). Should be a few imports and one render.

Commit locally at each layer's boundary if natural — the orchestrator owns the final squash.

### Step 3: Use tokens, never literals

```tsx
// ✗ BAD
<View style={{ backgroundColor: '#0F1115', padding: 16, borderRadius: 12 }}>

// ✓ GOOD
import { tokens } from '@/design/tokens';
<View style={{
  backgroundColor: tokens.color.surface.raised,
  padding: tokens.space.md,
  borderRadius: tokens.radius.md,
}}>
```

If the value you need is not in tokens, ADD it to `tokens.ts` with a justification comment, then reference it. Never inline.

### Step 4: Keep domain pure

```ts
// ✗ BAD — async, uses React, hits DB
import { useEffect } from 'react';
export async function calculate1RM(weight: number, reps: number) {
  const cached = await db.select(...);
  return cached ?? epley(weight, reps);
}

// ✓ GOOD — pure, testable, no I/O
export function calculate1RM(weight: number, reps: number): number {
  return weight * (1 + reps / 30);
}
```

The data layer wraps the pure function with caching/persistence. Keep them separate.

### Step 5: Local verification (REQUIRED before handoff)

```bash
pnpm typecheck    # strict TS — must exit 0
pnpm lint         # biome — must exit 0
pnpm test         # jest — must exit 0
```

If your change touches the **import graph in a non-trivial way** (added a new npm package, new primitive that pulls a new transitive dep, edited a route entry, changed Storybook plumbing), run the Metro bundle spot-check:

```bash
pnpm --filter @fivethreeone/mobile exec expo export --platform ios \
  --output-dir /tmp/expo-bundle-check --dump-sourcemap=false --dump-assetmap=false
```

Exit 0 means Metro resolved every import (catches missing runtime deps that `pnpm run ci` misses — we got burned by `ts-dedent`).

Paste the output of each command into `_workspace/02_implementation_log.md` under `## Verification`. This is the QA agent's first read.

### Step 6: Hand off to QA

Send `rn-qa` a message containing:
- Path to implementation log
- List of files touched
- Confirmation that all four checks (typecheck, lint, test, bundle if applicable) are green
- Any spec deviations + justification

## Anti-patterns to avoid

| Anti-pattern | Why it's wrong | Do instead |
|---|---|---|
| Inline `try/catch` around every async call | Hides errors; bloats code | Let errors propagate to TanStack Query's `error` field; render via `Error` state from spec |
| Defensive null checks at every layer | Slows reading; trusts nothing | Validate at boundaries (DB read, network response); trust internal code |
| `useState` for derived data | Drifts from source of truth | Compute on render or use `useMemo` |
| `// removed` comments for deleted code | Rots; git owns history | Delete cleanly |
| Renaming `_foo` for unused vars | False signal | Delete the variable |
| New feature flag for a one-shot change | YAGNI | Just change the code |
| New abstraction for "future use" | YAGNI | Three similar lines beats premature abstraction |
| Multi-line docstrings | Noise | One short comment IF the WHY is non-obvious |

## Failure modes and recovery

| What happened | What to do |
|---|---|
| Test fails after your change | Read the failure. Fix the code, not the test (unless the test was wrong). |
| Typecheck fails on a third-party import | Check `pnpm-lock.yaml` — likely missing types or peer dep. |
| Metro bundle fails with "cannot resolve" | A transitive dep is declared `devDependency` somewhere. Hoist to `dependencies` of the package that needs it at runtime. |
| Reviewer rejects on boundary violation | Move the offending code to the correct layer. Don't argue with the rule. |
| Spec is ambiguous on a decision | STOP. Ask `rn-designer` via SendMessage. Don't guess. |

## Followup behavior

If `_workspace/02_implementation_log.md` already exists:
1. Read the log + the QA report (`_workspace/03_qa_report.md` if present).
2. Continue where the log left off, OR fix the QA findings.
3. Append to the log; do not overwrite.

## Forbidden paths (never edit)

- `~/Development/531-pwa/` — read-only PWA reference (local developer machine path, may not exist on external machines).
- `docs/superpowers/specs/` — engineering spec is immutable.
- `docs/superpowers/plans/` — plans are append-only.
