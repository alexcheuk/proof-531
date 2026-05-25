import { goTo } from '@/app/routes';
import { ACTIVE_SESSION_KEY } from '@/data/queries/useActiveSession';
import { LIFETIME_VOLUME_KEY } from '@/data/queries/useLifetimeVolume';
import { SESSION_KEY } from '@/data/queries/useSession';
import { SESSIONS_KEY } from '@/data/queries/useSessions';
import { SET_LOGS_FOR_SESSION_KEY } from '@/data/queries/useSetLogsForSession';
import { type QueryClient, useQueryClient } from '@tanstack/react-query';
import * as KeepAwake from 'expo-keep-awake';
import { type Router, useRouter } from 'expo-router';
import { useEffect } from 'react';
import type { LivePhase } from './useLiveScreenState';

/**
 * Owns the side-effects that orbit the LiveScreen render:
 *   1. Holds expo-keep-awake active for the lifetime of the screen so the
 *      device doesn't sleep mid-session.
 *   2. On `phase === 'complete'`, invalidates the session-shaped query
 *      surface and routes the user to either the home screen (cancelled)
 *      or the receipt (completed).
 *   3. Bounces the user home if the session row disappears or transitions
 *      out of `in_progress` from another surface — guarded so it doesn't
 *      race the complete-flow navigation.
 *
 * Pulled out of the screen component so the render tree stays focused on
 * layout. All branches were preserved from the prior inline implementation.
 */
export type UseLiveScreenEffectsOptions = {
  sessionId: number;
  phase: LivePhase;
  /** Current persisted status of the session row, if loaded. */
  sessionStatus: 'in_progress' | 'completed' | 'cancelled' | undefined;
  /** True while the session row is still loading from the DB. */
  sessionLoading: boolean;
  /** Whether the session lookup returned null (deleted / unknown id). */
  sessionMissing: boolean;
};

export function useLiveScreenEffects({
  sessionId,
  phase,
  sessionStatus,
  sessionLoading,
  sessionMissing,
}: UseLiveScreenEffectsOptions): void {
  const router = useRouter();
  const queryClient = useQueryClient();

  // Keep the screen awake for the entire session. Activate on mount,
  // deactivate on unmount. `activateKeepAwakeAsync` replaces the deprecated
  // sync `activateKeepAwake` (Expo SDK 51+); fire-and-forget here since the
  // activation is best-effort.
  useEffect(() => {
    void KeepAwake.activateKeepAwakeAsync();
    return () => {
      KeepAwake.deactivateKeepAwake();
    };
  }, []);

  // After the session machine settles into `complete` (via normal finish OR
  // cancel), invalidate the session-shaped queries and route away.
  useEffect(() => {
    if (phase !== 'complete' || sessionId == null) return;
    const routeToDestination = () => routeFromCompletePhase(router, sessionStatus, sessionId);
    invalidateSessionSurface(queryClient, sessionId)
      .then(routeToDestination)
      .catch((err) => {
        console.error('useLiveScreenEffects complete-flow invalidation failed', err);
        routeToDestination();
      });
  }, [phase, sessionId, sessionStatus, queryClient, router]);

  // After AMRAP the state machine stops in 'awaiting-bbb' so the user
  // sees the BBB plan + close-day prompt before the receipt. The session
  // row is already in `completed` state by this point (completeSession ran
  // inside onSaveAmrap), so this is purely a routing step.
  useEffect(() => {
    if (phase !== 'awaiting-bbb' || sessionId == null) return;
    const routeToDestination = () => goTo.bbb(router, sessionId, { replace: true });
    invalidateSessionSurface(queryClient, sessionId)
      .then(routeToDestination)
      .catch((err) => {
        console.error('useLiveScreenEffects awaiting-bbb invalidation failed', err);
        routeToDestination();
      });
  }, [phase, sessionId, queryClient, router]);

  // PR celebration — same routing pattern but lands on the full-screen
  // inverted celebration before the BBB prompt. Only entered when
  // `onSaveAmrap` detected `isPR` on the appended row.
  useEffect(() => {
    if (phase !== 'pr-celebration' || sessionId == null) return;
    const routeToDestination = () => goTo.prCelebration(router, sessionId, { replace: true });
    invalidateSessionSurface(queryClient, sessionId)
      .then(routeToDestination)
      .catch((err) => {
        console.error('useLiveScreenEffects pr-celebration invalidation failed', err);
        routeToDestination();
      });
  }, [phase, sessionId, queryClient, router]);

  // Exit gate: if the session row disappears (deleted) or transitions out
  // of `in_progress` from elsewhere (e.g. cancelled by another surface),
  // bounce home. Skipped while loading and while we're already mid-complete
  // flow (the effect above owns routing in that case, so this would race).
  useEffect(() => {
    if (sessionLoading) return;
    if (phase === 'complete') return;
    if (sessionMissing) {
      goTo.home(router);
      return;
    }
    if (sessionStatus && sessionStatus !== 'in_progress') {
      goTo.home(router);
    }
  }, [sessionLoading, sessionMissing, sessionStatus, phase, router]);
}

function routeFromCompletePhase(
  router: Router,
  sessionStatus: UseLiveScreenEffectsOptions['sessionStatus'],
  sessionId: number,
): void {
  if (sessionStatus === 'cancelled') {
    goTo.home(router);
    return;
  }
  goTo.complete(router, sessionId, { replace: true });
}

function invalidateSessionSurface(queryClient: QueryClient, sessionId: number): Promise<unknown> {
  // completeSession runs advanceDay (mutates settings.week/cycle and, on
  // wrap, the training_maxes history) and AMRAP saves may have set a new
  // PR, so we invalidate the broader session-shaped surface alongside the
  // three core keys. `lifetimeVolume` is included (loop-008) so the
  // History tab's volume stat refreshes the moment the day closes — the
  // new working + amrap rows (plus any BBB rows written by BbbPromptScreen)
  // need to be counted on next render.
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: ACTIVE_SESSION_KEY }),
    queryClient.invalidateQueries({ queryKey: SESSIONS_KEY }),
    queryClient.invalidateQueries({ queryKey: SESSION_KEY(sessionId) }),
    queryClient.invalidateQueries({ queryKey: ['settings'] }),
    queryClient.invalidateQueries({ queryKey: ['trainingMaxes'] }),
    queryClient.invalidateQueries({ queryKey: ['prs'] }),
    queryClient.invalidateQueries({ queryKey: ['sessionPrIds'] }),
    queryClient.invalidateQueries({ queryKey: LIFETIME_VOLUME_KEY }),
    queryClient.invalidateQueries({ queryKey: SET_LOGS_FOR_SESSION_KEY(sessionId) }),
  ]);
}
