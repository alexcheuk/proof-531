import { useActiveSession } from '@/data/queries/useActiveSession';
import type { Lift } from '@/domain/types';
// Module-scoped cache: survives (tabs) unmount when pushing into /session/* so the carousel doesn't snap back.
import { useCallback, useEffect, useRef, useState } from 'react';

export type HomeState = {
  selectedLift: Lift;
  setSelectedLift: (next: Lift) => void;
  inProgressLift: Lift | null;
};

let lastSelectedLift: Lift | null = null;

/** Reset the in-memory selected-lift cache. Test-only. */
export function __resetHomeScreenStateForTests(): void {
  lastSelectedLift = null;
}

/**
 * Initialize with the first enabled lift; caller resets via `setSelectedLift`.
 *
 * Passing `enabledLifts` lets the hook re-anchor `selectedLift` if the user
 * disables the previously-selected lift in Settings — without it, internal
 * state would linger on a now-disabled lift and desync from the carousel.
 */
export function useHomeScreenState(
  initialLift: Lift,
  enabledLifts: ReadonlyArray<Lift> = [],
): HomeState {
  const [selectedLift, setSelectedLiftInternal] = useState<Lift>(lastSelectedLift ?? initialLift);
  // True once the user has explicitly chosen a lift (tap or swipe). Used to
  // gate the in-progress-lift auto-focus below: we want to snap to the
  // mid-session lift on cold open, but never override a deliberate swipe.
  const userSelectedRef = useRef<boolean>(lastSelectedLift !== null);
  const setSelectedLift = useCallback((next: Lift) => {
    userSelectedRef.current = true;
    lastSelectedLift = next;
    setSelectedLiftInternal(next);
  }, []);
  // Re-anchor when the currently-selected lift is no longer enabled (e.g.
  // user disabled it in Settings). Wipes the module-scoped cache too so a
  // later remount doesn't snap back to the stale value.
  useEffect(() => {
    if (enabledLifts.length === 0) return;
    if (!enabledLifts.includes(selectedLift)) {
      lastSelectedLift = initialLift;
      setSelectedLiftInternal(initialLift);
    }
  }, [enabledLifts, initialLift, selectedLift]);
  const activeSession = useActiveSession();
  const inProgressLift = (activeSession.data?.lift as Lift | undefined) ?? null;
  // Auto-focus the in-progress lift on first observation so the user lands on
  // a visible Resume CTA after backgrounding the app mid-session. Guarded by
  // `userSelectedRef` so swiping or tapping a different tab always wins.
  useEffect(() => {
    if (userSelectedRef.current) return;
    if (!inProgressLift) return;
    if (inProgressLift === selectedLift) return;
    if (enabledLifts.length > 0 && !enabledLifts.includes(inProgressLift)) return;
    lastSelectedLift = inProgressLift;
    setSelectedLiftInternal(inProgressLift);
  }, [inProgressLift, enabledLifts, selectedLift]);
  return { selectedLift, setSelectedLift, inProgressLift };
}
