import { useClearMissState } from '@/data/queries/useClearMissState';
import { useRecordMiss } from '@/data/queries/useRecordMiss';
import type { Lift } from '@/domain/types';
import { useEffect, useRef } from 'react';

// `ready` excludes D4 (no AMRAP outcome) and unresolved loading states.
// Fires once per `sessionId`; a hit clears the counter so "consecutive" stays literal.
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
