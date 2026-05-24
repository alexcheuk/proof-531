import type { Lift } from '@/domain/types';
import type { Href, Router } from 'expo-router';

/**
 * Typed navigation helpers. Centralizes the `as never` / `as any` casts that
 * every screen used to scatter — `expo-router`'s typedRoutes generator is
 * disabled in this project (PF-05) because the file-system router doesn't
 * cleanly produce typed paths for the (tabs) group, and the workaround used
 * to be inline casts at every call site.
 *
 * Use these helpers anywhere you'd otherwise write `router.push(... as never)`:
 *
 *   import { goTo } from '@/app/routes';
 *   goTo.today(router, 'squat');
 *   goTo.live(router, sessionId);
 *
 * If a destination needs to change shape, change it here once instead of in
 * a dozen feature files.
 */

/**
 * The cast type expo-router accepts for untyped routes. Kept as a single
 * named alias so the cast lives in one place and is searchable.
 */
type AnyHref = Href;

function href<T extends object | string>(value: T): AnyHref {
  return value as unknown as AnyHref;
}

export const goTo = {
  home(router: Router): void {
    router.replace(href('/'));
  },

  onboarding(router: Router): void {
    router.replace(href('/onboarding'));
  },

  settings(router: Router): void {
    router.push(href('/(tabs)/settings'));
  },

  history(router: Router): void {
    router.push(href('/(tabs)/history'));
  },

  today(router: Router, lift: Lift, opts?: { replace?: boolean }): void {
    const target = href({ pathname: '/session/today', params: { lift } });
    if (opts?.replace) router.replace(target);
    else router.push(target);
  },

  live(router: Router, sessionId: number | string): void {
    router.push(href({ pathname: '/session/live', params: { sessionId: String(sessionId) } }));
  },

  complete(
    router: Router,
    sessionId: number | string,
    opts?: { replace?: boolean; from?: 'history' },
  ): void {
    const params: Record<string, string> = { sessionId: String(sessionId) };
    if (opts?.from) params.from = opts.from;
    const target = href({ pathname: '/session/complete', params });
    if (opts?.replace) router.replace(target);
    else router.push(target);
  },
} as const;
