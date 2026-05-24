import { useActiveSession } from '@/data/queries/useActiveSession';
import type { Lift } from '@/domain/types';
/**
 * Home screen UI state — currently the selected lift plus a derived
 * `inProgressLift` read from `useActiveSession`.
 *
 * Ported in spirit from the PWA's `useHomeScreenState`. The PWA returns a
 * fully composed read of settings/TMs/active session; the RN port composes
 * settings/TMs at the screen level via the TanStack Query hooks in
 * `@/data/queries/*` and only delegates the selected-lift bookkeeping (and
 * the derived `inProgressLift`) to this hook.
 *
 * `selectedLift` survives unmount-remount via a module-scoped cache. Without
 * this, the (tabs) tree unmounts when the user pushes into /session/* and
 * the carousel snaps back to the first enabled lift on return. The cache is
 * in-memory only by design — a cold launch starts on the first lift again.
 */
import { useCallback, useEffect, useState } from 'react';

export type HomeState = {
  selectedLift: Lift;
  setSelectedLift: (next: Lift) => void;
  /** The lift whose session is currently in_progress, or null if none. */
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
  const setSelectedLift = useCallback((next: Lift) => {
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
  return { selectedLift, setSelectedLift, inProgressLift };
}
