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

/**
 * Kind of a logged set. Mirrors the PWA `SetLog.kind` column verbatim — see
 * `~/Development/531-pwa/src/db/schema.ts`.
 *   - `warmup`     — pre-work ramp sets (not counted in volume).
 *   - `working`    — the first two prescribed 5/3/1 work sets.
 *   - `amrap`      — the final "+" set with AMRAP reps.
 *   - `bbb`        — Boring But Big assistance set (5×10 at 50%/60%).
 *   - `assistance` — generic assistance row (push/pull/core lifts).
 */
export type SetLogKind = 'warmup' | 'working' | 'amrap' | 'bbb' | 'assistance';

/**
 * A persisted set log row. Shape mirrors the PWA Dexie schema closely enough
 * for the domain summary helpers — the mobile data layer can extend or narrow
 * this when it lands the actual Drizzle table.
 */
export type SetLog = {
  id?: number;
  sessionId: number;
  index: number;
  kind: SetLogKind;
  prescribedWeight: number;
  prescribedReps: number;
  actualReps: number;
  completedAt: number;
  isPR?: boolean;
  estimated1RM?: number;
};

/**
 * The singleton settings row. Mirrors the PWA's `Settings` interface verbatim
 * (see `~/Development/531-pwa/src/db/schema.ts`).
 *
 * Persisted by the `settings` Drizzle table (id = 1, always). `enabledLifts`
 * is stored as a JSON-encoded TEXT column at the data layer; this shape is
 * the in-memory representation accessors expose to the rest of the app.
 */
export interface Settings {
  id: 1;
  storageUnit: Unit;
  displayUnit: Unit;
  plateSet: PlateSet;
  enabledLifts: Lift[];
  currentCycle: number;
  week: Week;
  day: Day;
}

/**
 * Defaults inserted into the `settings` row on first boot — mirrors the PWA's
 * `DEFAULT_SETTINGS` constant (see `~/Development/531-pwa/src/db/schema.ts`).
 * Excludes `id` since the row is always keyed at `id = 1`.
 */
export const DEFAULT_SETTINGS: Omit<Settings, 'id'> = {
  storageUnit: 'lbs',
  displayUnit: 'lbs',
  plateSet: 'standard',
  enabledLifts: ['squat', 'bench', 'deadlift', 'press'],
  currentCycle: 1,
  week: 1,
  day: 1,
};
