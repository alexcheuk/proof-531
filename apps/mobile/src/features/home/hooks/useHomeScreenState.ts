import type { Lift } from '@/domain/types';
/**
 * Home screen UI state — currently just the selected lift.
 *
 * Ported in spirit from the PWA's `useHomeScreenState`, but trimmed for the
 * RN port: the PWA returns a fully composed read of settings/TMs/active
 * session, whereas Home in mobile composes those reads directly via the
 * TanStack Query hooks in `@/data/queries/*` and only delegates the
 * selected-lift bookkeeping here.
 */
import { useState } from 'react';

export type HomeState = {
  selectedLift: Lift;
  setSelectedLift: (next: Lift) => void;
};

/** Initialize with the first enabled lift; caller resets via `setSelectedLift`. */
export function useHomeScreenState(initialLift: Lift): HomeState {
  const [selectedLift, setSelectedLift] = useState<Lift>(initialLift);
  return { selectedLift, setSelectedLift };
}
