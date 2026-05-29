import { useDb } from '@/data/DbProvider';
import { createSession } from '@/data/accessors/session';
import { ACTIVE_SESSION_KEY, useActiveSession } from '@/data/queries/useActiveSession';
import { SESSIONS_KEY } from '@/data/queries/useSessions';
import { useSetLogsForSession } from '@/data/queries/useSetLogsForSession';
import { type WorkingSetIndex, nextWorkingSetIndex } from '@/domain/schemes';
import type { Lift } from '@/domain/types';
import { goTo } from '@/lib/routes';
import { useQueryClient } from '@tanstack/react-query';
// active mode: never call createSession again — that orphans the original row and breaks getActiveSession.
import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';

export type TodayMode = 'preview' | 'preview-other-active' | 'active';

export type UseTodayScreenStateResult = {
  mode: TodayMode;
  starting: boolean;
  sessionId: number | null;
  otherLift: Lift | null;
  completedCount: number;
  completedIndices: ReadonlyArray<WorkingSetIndex>;
  nextSetIndex: WorkingSetIndex | null;
  onPressCta: () => Promise<void> | void;
};

export function useTodayScreenState(lift: Lift): UseTodayScreenStateResult {
  const db = useDb();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [starting, setStarting] = useState(false);
  // Synchronous re-entrancy guard. `starting` is a React state value, so
  // setStarting(true) only takes effect on the next render — two taps within
  // a single render cycle both see `starting === false` and both fire. The
  // ref flips synchronously inside the handler, so the second tap reads
  // `true` no matter how fast it arrives. Without this, spam-tapping the
  // Begin CTA pushed duplicate /session/live entries with the same
  // sessionId; the hidden lower Live's exit gate later replace()'d the
  // active route with '/' and bounced the user to Home from BBB / Complete.
  const inFlightRef = useRef(false);

  const activeSession = useActiveSession();
  const activeData = activeSession.data ?? null;
  const sessionForLift = activeData && activeData.lift === lift ? activeData : null;
  const otherLift = activeData && activeData.lift !== lift ? (activeData.lift as Lift) : null;

  // Read the set logs only when this lift has an in-flight session, so we
  // don't pull rows that don't belong to the screen.
  const setLogs = useSetLogsForSession(sessionForLift?.id ?? null);
  const workingIndices = (setLogs.data ?? [])
    .filter((l) => l.kind === 'working' || l.kind === 'amrap' || l.kind === 'tm-test')
    .map((l) => l.index)
    .filter((i): i is WorkingSetIndex => i === 0 || i === 1 || i === 2);
  const uniqueCompleted = Array.from(new Set(workingIndices));
  const completedCount = sessionForLift ? uniqueCompleted.length : 0;
  // `nextWorkingSetIndex` defaults to the 3-slot contract for weeks 1–3 when
  // `week` is omitted. The Today screen does not branch its CTA copy on
  // week-4 specifically (see TodayScreen.tsx — week 4 still routes through
  // the same Begin → Live flow), so leaving the call signature unchanged is
  // intentional. On an in-flight week-4 session, `uniqueCompleted` is either
  // [] (not started) or [0] (test logged → session is `completed` and lives
  // in active-session-store no more), so the legacy 3-slot iteration is
  // harmless.
  const nextSetIndex = sessionForLift ? nextWorkingSetIndex(uniqueCompleted) : null;

  const mode: TodayMode = sessionForLift
    ? 'active'
    : otherLift
      ? 'preview-other-active'
      : 'preview';

  const onPressCta = async () => {
    if (inFlightRef.current) return;
    inFlightRef.current = true;
    setStarting(true);
    try {
      if (mode === 'preview-other-active' && otherLift) {
        goTo.today(router, otherLift, { replace: true });
        return;
      }

      if (mode === 'active' && sessionForLift) {
        // `push` (not `replace`) so the back stack stays
        // home → today → live and a Back tap from Live returns to the
        // session plan instead of skipping past it to home.
        goTo.live(router, sessionForLift.id);
        return;
      }

      // preview — create the session, invalidate so Home/Today/History see the
      // new row, then route to Live.
      const session = await createSession(db, lift);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ACTIVE_SESSION_KEY }),
        queryClient.invalidateQueries({ queryKey: SESSIONS_KEY }),
      ]);
      // Same as above: push so Back from Live lands on Today.
      goTo.live(router, session.id);
    } catch (err) {
      console.error('TodayScreen.onPressCta createSession failed', err);
    } finally {
      // Reset on BOTH success and failure paths. The success-only reset
      // previously relied on the screen unmounting; when the user taps
      // Back from Live, this screen stays mounted (stack pop) and the CTA
      // would otherwise stay disabled.
      inFlightRef.current = false;
      setStarting(false);
    }
  };

  return {
    mode,
    starting,
    sessionId: sessionForLift?.id ?? null,
    otherLift,
    completedCount,
    completedIndices: sessionForLift ? uniqueCompleted : [],
    nextSetIndex,
    onPressCta,
  };
}
