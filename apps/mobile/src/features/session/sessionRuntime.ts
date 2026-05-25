import type { LastLoggedSet } from './hooks/useLiveScreenState';

/**
 * In-memory live-session runtime snapshot.
 *
 * Keeps the rest-timer end-time and most-recently-logged set alive across
 * remounts of LiveScreen — e.g. when the user tabs to History during rest
 * and returns. The screen's local state is reseeded from this snapshot on
 * the next mount; the snapshot is cleared when the rest phase ends or the
 * session completes/cancels.
 *
 * Module-level state (not React) so a screen unmount does not clear it.
 * Does not survive an app kill — for that we'd persist to AsyncStorage or
 * SQLite, deferred until we have evidence anyone backgrounds the app
 * during rest.
 */
export type LiveRestSnapshot = {
  sessionId: number;
  /** Absolute wall-clock ms when the rest timer should reach 0. */
  endsAtMs: number;
  /** The set that put us into rest, so RestPhase can render the headline. */
  lastLogged: LastLoggedSet;
};

let snapshot: LiveRestSnapshot | null = null;

export function setRestSnapshot(next: LiveRestSnapshot): void {
  snapshot = next;
}

export function readRestSnapshot(sessionId: number): LiveRestSnapshot | null {
  if (!snapshot) return null;
  if (snapshot.sessionId !== sessionId) return null;
  return snapshot;
}

export function clearRestSnapshot(sessionId: number): void {
  if (snapshot?.sessionId === sessionId) {
    snapshot = null;
  }
}

/** Test-only — full reset between cases. */
export function _resetSessionRuntimeForTests(): void {
  snapshot = null;
}
