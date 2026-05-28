/**
 * Pure decision helper for the Android rest-notification orchestrator. Keeps
 * the "what should happen on this AppState change" rule out of the effect body
 * so it can be unit-tested without mounting the hook or the native module.
 */

/** The AppState values we care about (react-native's AppStateStatus subset). */
export type AppPhase = 'active' | 'background' | 'inactive' | 'unknown' | 'extension';

export type RestNotifEffect =
  | 'post' // app went to background mid-rest → show the live chronometer
  | 'reconcile' // app came to foreground mid-rest → sync deadline back, clear notif
  | 'none';

/**
 * Android only. Given the next AppState and whether a rest is active, decide
 * what the notification layer should do.
 *
 * - background while resting → post the chronometer notification
 * - active (foreground) while resting → reconcile (copy deadline back, cancel)
 * - anything else (inactive transients, not resting) → nothing
 */
export function restNotifEffectForAppState(
  nextPhase: AppPhase,
  restActive: boolean,
): RestNotifEffect {
  if (!restActive) return 'none';
  if (nextPhase === 'background') return 'post';
  if (nextPhase === 'active') return 'reconcile';
  return 'none';
}
