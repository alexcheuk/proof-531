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
 */
import { useEffect, useState } from 'react';

export type HomeState = {
  selectedLift: Lift;
  setSelectedLift: (next: Lift) => void;
  /** The lift whose session is currently in_progress, or null if none. */
  inProgressLift: Lift | null;
};

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
  const [selectedLift, setSelectedLift] = useState<Lift>(initialLift);
  useEffect(() => {
    if (enabledLifts.length === 0) return;
    if (!enabledLifts.includes(selectedLift)) {
      setSelectedLift(initialLift);
    }
  }, [enabledLifts, initialLift, selectedLift]);
  const activeSession = useActiveSession();
  const inProgressLift = (activeSession.data?.lift as Lift | undefined) ?? null;
  return { selectedLift, setSelectedLift, inProgressLift };
}
