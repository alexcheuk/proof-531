import type { Unit } from '@/domain/types';

/** Stepper increment for the Progress goal panel. 5 lb / 2.5 kg. */
export function goalStep(unit: Unit): number {
  return unit === 'lbs' ? 5 : 2.5;
}

/**
 * Bump granularity for the default-goal seed  -  picks a round number so the
 * initial goal lands on a recognisable target weight (225, 250, … in lbs;
 * 100, 110, … in kg) rather than a fractional step.
 */
export function defaultBumpStep(unit: Unit): number {
  return unit === 'lbs' ? 25 : 10;
}

export function ceilToStep(value: number, step: number): number {
  return Math.ceil(value / step) * step;
}
