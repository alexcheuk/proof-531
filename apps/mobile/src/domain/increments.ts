/**
 * Per-cycle Training Max (TM) increments for 5/3/1.
 *
 * This module is part of `src/domain/` — a pure domain layer.
 * No framework imports, no asynchronous work, no database access.
 */

import type { Lift, Unit } from './types';

/** Lifts that use lower-body TM increments (10 lb / 5 kg per cycle). */
export const LOWER_BODY: ReadonlySet<Lift> = new Set<Lift>(['squat', 'deadlift']);

/** Per-cycle TM bump magnitude, in the lift's own unit. */
export function tmIncrement(unit: Unit, lift: Lift): number {
  const isLower = LOWER_BODY.has(lift);
  if (unit === 'lbs') return isLower ? 10 : 5;
  return isLower ? 5 : 2.5;
}

/** Returns the next TM = currentTm + tmIncrement(unit, lift). */
export function nextTm(currentTm: number, lift: Lift, unit: Unit): number {
  return currentTm + tmIncrement(unit, lift);
}
