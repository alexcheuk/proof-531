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
import { useState } from 'react';

export type HomeState = {
  selectedLift: Lift;
  setSelectedLift: (next: Lift) => void;
  /** The lift whose session is currently in_progress, or null if none. */
  inProgressLift: Lift | null;
};

/** Initialize with the first enabled lift; caller resets via `setSelectedLift`. */
export function useHomeScreenState(initialLift: Lift): HomeState {
  const [selectedLift, setSelectedLift] = useState<Lift>(initialLift);
  const activeSession = useActiveSession();
  const inProgressLift = (activeSession.data?.lift as Lift | undefined) ?? null;
  return { selectedLift, setSelectedLift, inProgressLift };
}
