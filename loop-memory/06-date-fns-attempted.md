---
name: date-fns-attempted
description: We tried swapping `src/domain/relativeTime.ts` to `date-fns` (Discord 1508377597, loop-003). It broke 7 SettingsScreen tests deterministically under jest-expo. Reverted; do not retry unless jest-expo / date-fns ship a fix.
---

# date-fns in `relativeTime.ts` — attempted, reverted

## The ask

Discord `1508377597820801085` — "can we just use like date-fn for
relativeTime instead of rolling our own".

## What we tried

Replaced the bucketing body of `formatRelativeTime` in
`apps/mobile/src/domain/relativeTime.ts` with:

```ts
import { formatDistanceStrict } from 'date-fns/formatDistanceStrict';

export function formatRelativeTime(ts: number, now = Date.now()): string {
  if (now - ts < 86_400_000) return 'today';
  if (now - ts < 86_400_000 * 2) return 'yesterday';
  return formatDistanceStrict(ts, now, { addSuffix: true });
}
```

Subpath import (`date-fns/formatDistanceStrict`) instead of the root
barrel — same failure.

## Why it didn't ship

Running `pnpm test` deterministically failed 7 tests in
`src/features/settings/__tests__/SettingsScreen.test.tsx` with
"Unable to find node on an unmounted component" inside `waitFor`.
Running JUST the SettingsScreen file passed. The failure is parallel-
worker timing: `formatDistanceStrict`'s first parse under jest-expo
adds enough latency to the first render of `TrainingMaxSection`
(which calls `formatRelativeTime` per lift row) that the test's
1000 ms `waitFor` budget can't catch the row mount, the test
function returns, the tree unmounts, and the waitFor poll then
throws.

`bundle-check` was green; the issue is jest-only.

## Decision

Kept the hand-rolled bucketing. ~20 LOC, zero deps. Documented in
the file's header that we tried date-fns. Not a refactor we lost
points on — the test gauntlet is the gate.

## Do not retry until

- jest-expo 56+ ships, OR
- date-fns 5+ trims its strict-distance parse cost, OR
- We move SettingsScreen integration tests off the same worker as the
  domain tests so the first-render budget isn't shared.

If a future iteration sees the swap pass `pnpm test --silent` three
times in a row with no SettingsScreen failures, ship it and delete
this memory.
