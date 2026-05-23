/**
 * Pure helper: compute the next `enabledLifts` array after toggling one lift.
 *
 * Ported from `~/Development/531-pwa/src/features/settings/nextEnabledLifts.ts`.
 *
 * Rules:
 * - Toggling an off lift adds it; the result preserves canonical LIFT_ORDER
 *   ordering (NOT insertion order).
 * - Toggling an on lift removes it.
 * - Toggling the only enabled lift is a no-op: returns the same array
 *   reference so callers can early-out cheaply.
 */
import type { Lift } from '@/domain/types';
import { LIFT_ORDER } from './lifts';

export function nextEnabledLifts(current: readonly Lift[], lift: Lift): Lift[] {
  const isOn = current.includes(lift);
  if (isOn && current.length === 1) {
    // Same reference so callers can skip the write.
    return current as Lift[];
  }
  if (isOn) {
    return current.filter((l) => l !== lift);
  }
  const nextSet = new Set<Lift>([...current, lift]);
  return LIFT_ORDER.filter((l) => nextSet.has(l));
}
