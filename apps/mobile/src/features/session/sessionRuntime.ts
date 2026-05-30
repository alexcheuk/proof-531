import type { LastLoggedSet } from './hooks/useLiveScreenState';

// Module-level (not React) so LiveScreen remounts during rest don't lose the countdown.
// Does not survive an app kill — persisting to SQLite is deferred until there's evidence of demand.
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
