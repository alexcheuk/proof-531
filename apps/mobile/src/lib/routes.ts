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
 *   import { goTo } from '@/lib/routes';
 *   goTo.today(router, 'squat');
 *   goTo.live(router, sessionId);
 *
 * If a destination needs to change shape, change it here once instead of in
 * a dozen feature files.
 *
 * Lives in src/lib/ (not src/app/) so expo-router does not interpret it as a
 * route and warn about a missing default export.
 */

/**
 * The cast type expo-router accepts for untyped routes. Kept as a single
 * named alias so the cast lives in one place and is searchable.
 */
type AnyHref = Href;

function href<T extends object | string>(value: T): AnyHref {
  return value as unknown as AnyHref;
}

function go(
  router: Router,
  target: AnyHref,
  opts?: { replace?: boolean; navigate?: boolean },
): void {
  if (opts?.replace) router.replace(target);
  else if (opts?.navigate) router.navigate(target);
  else router.push(target);
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
    go(router, href({ pathname: '/session/today', params: { lift } }), opts);
  },

  live(router: Router, sessionId: number | string): void {
    router.push(href({ pathname: '/session/live', params: { sessionId: String(sessionId) } }));
  },

  bbb(router: Router, sessionId: number | string, opts?: { replace?: boolean }): void {
    go(router, href({ pathname: '/session/bbb', params: { sessionId: String(sessionId) } }), opts);
  },

  prCelebration(router: Router, sessionId: number | string, opts?: { replace?: boolean }): void {
    go(
      router,
      href({ pathname: '/session/pr-celebration', params: { sessionId: String(sessionId) } }),
      opts,
    );
  },

  complete(
    router: Router,
    sessionId: number | string,
    opts?: { replace?: boolean; from?: 'history' },
  ): void {
    const params: Record<string, string> = { sessionId: String(sessionId) };
    if (opts?.from) params.from = opts.from;
    go(router, href({ pathname: '/session/complete', params }), opts);
  },

  /**
   * Open the Progress tab with a specific lift pre-selected. Progress is
   * a first-class tab (loop-024); navigating here swaps tabs rather than
   * stack-pushing a sub-screen. The `lift` param is consumed by
   * `(tabs)/progress.tsx`, which falls back to `enabledLifts[0]` if
   * omitted.
   *
   * Pass `justCompleted` to signal that the user is arriving from a
   * just-closed session — the matching cell plays a one-shot fill-in
   * animation. The id travels with the route so a stale mount or a
   * later tab-tap can't replay the animation.
   *
   * Default uses `navigate()` (not `push()`) so that navigating from a
   * session stack reuses the `(tabs)` entry already in the root stack
   * instead of pushing a duplicate. Pass `{ replace: true }` only when
   * you need to overwrite the current history entry without going back.
   */
  progress(router: Router, lift: Lift, opts?: { replace?: boolean; justCompleted?: number }): void {
    const params: Record<string, string> = { lift };
    if (opts?.justCompleted !== undefined) params.justCompleted = String(opts.justCompleted);
    go(
      router,
      href({ pathname: '/(tabs)/progress', params }),
      opts?.replace ? { replace: true } : { navigate: true },
    );
  },
} as const;
