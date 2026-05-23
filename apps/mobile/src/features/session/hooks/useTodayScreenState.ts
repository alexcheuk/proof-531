import { useDb } from '@/data/DbProvider';
import { createSession } from '@/data/accessors/session';
import type { Lift } from '@/domain/types';
/**
 * Today screen local state + Start handler.
 *
 * Trimmed port of `~/Development/531-pwa/src/features/session/hooks/
 * useTodayScreenState.ts`. For PE-04 the screen only needs to expose a
 * preview of the upcoming session and a Start CTA — the PWA's full state
 * machine (loading / empty / preview / preview-other-active / active) is
 * deferred to a later task that lands the live screen + active-session
 * routing.
 *
 * Returns:
 *   - `starting`: true between the user pressing Start and the
 *     `router.replace` firing.
 *   - `start()`: idempotent (no-op while `starting` is true) — creates a
 *     session for the requested lift, then routes to `/session/live`.
 *
 * Errors during `createSession` reset `starting` to false and re-throw so
 * the caller's `try/catch` (which logs to the console for now) gets the
 * underlying error.
 */
import { useRouter } from 'expo-router';
import { useState } from 'react';

export type UseTodayScreenStateResult = {
  starting: boolean;
  start: () => Promise<void>;
};

export function useTodayScreenState(lift: Lift): UseTodayScreenStateResult {
  const db = useDb();
  const router = useRouter();
  const [starting, setStarting] = useState(false);

  const start = async () => {
    if (starting) return;
    setStarting(true);
    try {
      const session = await createSession(db, lift);
      router.replace({
        pathname: '/session/live',
        params: { sessionId: String(session.id) },
      });
    } catch (err) {
      console.error('TodayScreen.start failed', err);
      setStarting(false);
    }
  };

  return { starting, start };
}
