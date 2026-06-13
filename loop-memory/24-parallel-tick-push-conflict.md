---
name: parallel-tick-push-conflict
description: What to do when a concurrent loop instance moves the remote out from under you mid-tick, so push fails with conflicts. The recovery is reset to origin and reapply only your unique work, not a manual conflict merge of loop-bookkeeping files. Companion to file 23 (which catches staleness before work starts); this one is the recovery after the divergence already happened.
---

# Parallel-tick push conflict (found 2026-06-13, tick-9)

File 23 covers the orientation-step check: `git pull --ff-only` before any work so you start
on top of a concurrent loop. This file covers the other half: the remote can still move while
your tick runs. When several loop instances run at once (cron triggers, a parallel tick spun up
deliberately, another seat), the remote can be many commits ahead by the time you push. Tick-9
ran as a parallel instance while the main loop's ticks 6, 7, and 8 ran simultaneously; by push
time the remote was 22 commits ahead.

## The conflict shape is almost always loop bookkeeping

The conflicts will not be in app source. They land in the files every tick rewrites:

- `do-work/work/backlog.md` (status wording for the same item)
- `do-work/work/validation-debt.md` (different description of the same debt)
- `do-work/work/LOG.md` (parallel log entries)

Both instances edited the same status line of the same item (e.g. IN-APP-REVIEW) and wrote it
slightly differently. There is no real semantic conflict; both are describing the same shipped
work. Hand-merging these line by line is wasted effort and risks reintroducing a regression the
other instance already fixed (ea06fb1 in this history was exactly that: fixing merge-resolution
regressions in three docs).

## Recovery: reset to origin, reapply only your unique work

Do not try to rebase or hand-merge the bookkeeping files. Instead:

```bash
git fetch origin
git reset --hard origin/<branch>        # adopt the remote's bookkeeping wholesale
# then reapply ONLY the unique, substantive change this tick produced
```

The principle: the remote's version of the shared bookkeeping files is authoritative (the other
instances already recorded their work there). Your tick's value is the one real change the other
instances did not make. Drop your bookkeeping edits, take theirs, and replay only your unique
diff on top. Tick-9's unique change was a single quality refactor (ProgressLiftPage `useMemo`
for the liftPr lookup + `useCallback` for `onPastCellPress`); everything else it had touched was
already represented on the remote, so it was discarded without loss.

Then add a short supplementary log entry for your unique change and push again.

## Subagent vs parallel-instance: know which can conflict

A code-writing subagent launched in the *same repo without `isolation: worktree`* can also create
conflicts if it commits. In practice `rn-frontend` and the other pipeline agents defer committing
to the orchestrator, so they do not race the loop. The thing that races you is another full loop
instance, not a deferred subagent. If you ever launch an agent that commits on its own in the same
working tree while you have uncommitted work, expect the same reset-and-reapply cleanup.

## expo-store-review changes the native fingerprint

Same class as `expo-notifications` (see file 00): adding `expo-store-review` (tick-6's
IN-APP-REVIEW work) changes the EAS fingerprint, so existing dev/native builds that matched the
prior fingerprint will not pick up the OTA. When a tick commissions a production build after a
native module was added, note the fingerprint change in the Discord summary so on-device QA
rebuilds rather than expecting an OTA to carry it.
