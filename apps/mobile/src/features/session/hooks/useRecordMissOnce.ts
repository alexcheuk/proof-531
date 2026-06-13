import { useClearMissState } from '@/data/queries/useClearMissState';
import { useRecordMiss } from '@/data/queries/useRecordMiss';
import type { Lift } from '@/domain/types';
import { useEffect, useRef } from 'react';

/**
 * One-shot recorder for the missed-rep Program Correction, mirroring
 * `usePrSuccessHaptic`'s ref-guarded latch so SessionComplete re-renders /
 * refetches never double-count a miss.
 *
 * On the transition into a settled (non-null) `lift` with a known AMRAP
 * outcome, fires exactly once per `sessionId`:
 *   - `isMiss === true`  → `recordMiss(lift)` (increments missCount).
 *   - `isMiss === false` → `clearMissState(lift)` so a D1..D3 hit resets the
 *     counter and "second consecutive miss" stays literally consecutive.
 *
 * `ready` gates the effect until the session data has resolved; nothing fires
 * while loading. A D4 (tm-test) session passes `ready === false` for this hook
 * (no AMRAP outcome), so it never records or clears.
 */
export function useRecordMissOnce(params: {
  sessionId: number;
  lift: Lift | null;
  isMiss: boolean;
  ready: boolean;
}): void {
  const { sessionId, lift, isMiss, ready } = params;
  const firedForRef = useRef<number | null>(null);
  const recordMiss = useRecordMiss();
  const clearMissState = useClearMissState();

  useEffect(() => {
    if (!ready || lift === null) return;
    if (firedForRef.current === sessionId) return;
    firedForRef.current = sessionId;
    if (isMiss) {
      recordMiss.mutate({ lift });
    } else {
      clearMissState.mutate({ lift });
    }
    // recordMiss / clearMissState mutation objects are stable enough; the latch
    // (firedForRef keyed on sessionId) is the real guard against re-fires.
  }, [ready, lift, sessionId, isMiss, recordMiss, clearMissState]);
}
