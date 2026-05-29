import type { Lift } from '@/domain/types';
import type { Href, Router } from 'expo-router';

// Centralizes the `as never` casts for expo-router untyped routes.
// Lives in src/lib/ (not src/app/) so the router doesn't warn about a missing default export.

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

  // Uses navigate() (not push()) so the session stack reuses the existing (tabs) entry instead of pushing a duplicate.
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
