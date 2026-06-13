---
name: tick-start-environment-hygiene
description: Two recurring orientation-step gotchas that have bitten ticks at start. A concurrent loop can leave the branch behind origin (pull --ff-only before any work), and a typecheck that fails on a package already in package.json is usually an unlinked dependency that pnpm install fixes instantly.
---

# Tick-start environment hygiene (found 2026-06-13, tick-7)

Two checks belong in the Orient step, before any work, because both have stalled ticks at start.

## 1. The branch may be behind origin (concurrent loop)

A second loop instance can run and push between your ticks. Tick-7 started **11 commits behind
origin** because tick-6 had run concurrently on another seat. If you start work on a stale tree you
will diverge and have to force-push or merge to recover.

Before touching anything, fast-forward:

```bash
git -C /repos/1 pull --ff-only
```

Use `--ff-only` deliberately: if it refuses, you have local commits that diverged, which is a real
signal to stop and reconcile rather than silently merge. A clean fast-forward means you are now on
top of the concurrent loop's work and can orient against the true latest state.

## 2. A typecheck failing on a package that is already in package.json means it is not linked

Tick-7 had `pnpm typecheck` fail because `expo-store-review` (added by tick-6's IN-APP-REVIEW work)
was present in `package.json` but not linked into `node_modules`. The package was already in the
`.pnpm` virtual store from the earlier install; it just was not symlinked. The fix was instant:

```bash
pnpm install
```

So: if a typecheck or bundle-check fails resolving a module that you can confirm is listed in
`package.json`, do not assume the dependency is missing or that you need to add it. Run
`pnpm install` first; it relinks the virtual store with no network round-trip when the package is
already cached, and the failure usually clears immediately.
