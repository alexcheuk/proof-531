/**
 * Unit conversion + plate-step snapping for the 531 Strength domain.
 *
 * This module is part of `src/domain/` — pure math, no React, no async,
 * no Drizzle. Mirrors the PWA's `features/session/domain/units.ts` (see
 * `~/Development/531-pwa/src/features/session/domain/units.ts`), but the
 * RN port renames the two primary verbs:
 *   - `round`   ≡ PWA's `snapWeight`
 *   - `convert` ≡ PWA's `convertWeight` / `convertAndSnap` (unified via
 *                 `options.snap`)
 *
 * The PWA names remain available as named back-compat aliases so call
 * sites ported verbatim keep working.
 */
import type { Unit } from './types';

/** NIST exact conversion: 1 lb = 0.45359237 kg. */
export const KG_PER_LB = 0.45359237;
export const LB_PER_KG = 1 / KG_PER_LB; // ≈ 2.20462262

/**
 * Snap a weight to the nearest loadable increment for its unit.
 *   - lbs → nearest 5
 *   - kg  → nearest 2.5
 * Non-positive input clamps to 0.
 */
export function round(weight: number, unit: Unit): number {
  if (weight <= 0) return 0;
  const step = unit === 'lbs' ? 5 : 2.5;
  return Math.round(weight / step) * step;
}

/**
 * Convert a weight between units.
 *
 * Defaults to `snap = true` because most call sites display a loadable
 * weight (plate math, ledger rows, training-max math). Opt out with
 * `{ snap: false }` for derived stats — e1RM, volume — that lose real
 * precision when forced onto the plate grid.
 *
 * Behavior matrix:
 *   - fromUnit === toUnit, snap=true  → applies `round` (normalizes
 *                                        values stored before a step
 *                                        change).
 *   - fromUnit === toUnit, snap=false → identity.
 *   - cross-unit, snap=true           → convert then `round` in target
 *                                        unit's step.
 *   - cross-unit, snap=false          → bare conversion (full
 *                                        precision).
 */
export function convert(
  value: number,
  fromUnit: Unit,
  toUnit: Unit,
  options?: { snap?: boolean },
): number {
  const snap = options?.snap ?? true;
  if (fromUnit === toUnit) {
    return snap ? round(value, toUnit) : value;
  }
  const inToUnit = fromUnit === 'lbs' ? value * KG_PER_LB : value * LB_PER_KG;
  return snap ? round(inToUnit, toUnit) : inToUnit;
}

/**
 * Back-compat alias for code ported from the PWA, where snapping was the
 * sole shape of the API.
 */
export const snapWeight = round;

/**
 * PWA back-compat: snapping conversion. Equivalent to `convert(...)`
 * with the default `snap: true`.
 */
export function convertAndSnap(value: number, fromUnit: Unit, toUnit: Unit): number {
  return convert(value, fromUnit, toUnit, { snap: true });
}

/**
 * PWA back-compat: bare conversion (no snap). Equivalent to
 * `convert(..., { snap: false })`. Identity short-circuits when units match
 * so derived stats (e1RM, volume) keep full precision rather than re-running
 * the (fromUnit===toUnit) snap branch in `convert`.
 */
export function convertWeight(value: number, fromUnit: Unit, toUnit: Unit): number {
  if (fromUnit === toUnit) return value;
  return convert(value, fromUnit, toUnit, { snap: false });
}

/**
 * Convert a *stored* weight to the user's display unit and snap to the
 * destination unit's step. The render-site equivalent of `snapWeight` for
 * the two-unit model — every weight render site should route through this
 * rather than the raw storage value.
 *
 * Identity when storageUnit === displayUnit (the snap is idempotent on a
 * value that was already snapped at write time, so this stays a no-op for
 * the common single-unit user).
 */
export function displayWeight(storageValue: number, storageUnit: Unit, displayUnit: Unit): number {
  return convertAndSnap(storageValue, storageUnit, displayUnit);
}

/**
 * Map the storage unit token to its display glyph.
 * Storage stays `'lbs' | 'kg'`; UI consistently renders `'lb' | 'kg'`.
 * Every render call site that shows a unit chip should route through
 * this — never interpolate the raw token.
 */
export function displayUnit(unit: Unit): 'lb' | 'kg' {
  return unit === 'lbs' ? 'lb' : 'kg';
}

/**
 * Compute the training max from a 1RM: 90% of the 1RM, snapped to the
 * unit's loadable step.
 */
export function trainingMaxFrom(oneRM: number, unit: Unit): number {
  return round(oneRM * 0.9, unit);
}
