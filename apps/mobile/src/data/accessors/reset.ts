/**
 * Hard-reset accessor.
 *
 * Mirrors the PWA accessor at `the PWA reference`
 * (which wraps a Dexie `rw` transaction over all five tables). drizzle-orm's
 * cross-driver transaction typing is inconvenient and the mobile DB is
 * single-writer (JS event loop, no concurrent expo-sqlite writers in practice)
 * — sequential deletes are equivalent in observable behavior.
 *
 * The next boot re-seeds default Settings via `seedDefaultSettings` (called
 * by `getSettings`); the `FirstLaunchGate` then sees zero TMs and redirects
 * to `/onboarding`.
 *
 * In-flight sessions are dropped to the floor — this is HARD reset by design;
 * the confirm sheet is the safety. Foreign-key order matters: prs and setLogs
 * reference setLogs/sessions, so we drop them first.
 */
import type { BaseSQLiteDatabase } from 'drizzle-orm/sqlite-core';
import {
  liftGoals,
  liftProgress,
  prs,
  sessions,
  setLogs,
  settings,
  trainingMaxes,
} from '../drizzle/schema';

// biome-ignore lint/suspicious/noExplicitAny: structural-poly across sqlite drivers
type AnyDb = BaseSQLiteDatabase<any, any, any>;

export async function resetEverything(db: AnyDb): Promise<void> {
  // Discord 1508776628 — "Reset function doesn't reset the current day in
  // lifts": liftProgress (each lift's cycle/week, added loop-024) and
  // liftGoals (per-lift goal targets) were not being cleared. Stale rows
  // survived a hard reset and the new onboarded user saw e.g. squat on
  // cycle 4 week 3 from the prior install.
  await Promise.resolve(db.delete(prs));
  await Promise.resolve(db.delete(setLogs));
  await Promise.resolve(db.delete(sessions));
  await Promise.resolve(db.delete(trainingMaxes));
  await Promise.resolve(db.delete(liftProgress));
  await Promise.resolve(db.delete(liftGoals));
  await Promise.resolve(db.delete(settings));
}
