/**
 * Pure domain type aliases for 531 Strength.
 *
 * This module is part of `src/domain/` — a pure domain layer.
 * No framework imports, no asynchronous work, no database access.
 * Definitions here mirror the PWA schema verbatim (see
 * `~/Development/531-pwa/src/db/schema.ts`) and are the single source of
 * truth for these primitives across the mobile app.
 */

export type Lift = 'squat' | 'bench' | 'deadlift' | 'press';
export type Unit = 'lbs' | 'kg';
export type PlateSet = 'standard' | 'kg-standard';
export type Week = 1 | 2 | 3 | 4;
export type Day = 1 | 2 | 3 | 4;

/** All four main lifts, in canonical 5/3/1 order. */
export const LIFTS: readonly Lift[] = ['press', 'deadlift', 'bench', 'squat'] as const;
