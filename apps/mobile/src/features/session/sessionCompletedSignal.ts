import type { Lift } from '@/domain/types';
import { useSyncExternalStore } from 'react';

/**
 * Module-level subject for "the user just finished a session and tapped
 * Close the day". The Session-complete screen publishes the lift just
 * before routing to Progress; the Progress screen reads the signal on
 * mount to play a one-time fill-in animation on the matching cell and a
 * pulse on the amber `now` cell (Discord 1508779267).
 *
 * Why a module subject (mirrors `statusBarTint`): a single producer and a
 * single consumer that live in different screen subtrees. Context would
 * require lifting a provider up to the (tabs) root for what is effectively
 * a one-shot hand-off; the subject keeps wire-up to one publish + one
 * subscribe and survives the cross-tab navigation.
 *
 * Consumption clears the signal so a later visit to Progress (or a
 * back-nav into it) doesn't replay the animation.
 */

export type SessionCompletedEvent = {
  lift: Lift;
  sessionId: number;
};

let current: SessionCompletedEvent | null = null;
const listeners = new Set<() => void>();

function emit(): void {
  for (const l of listeners) l();
}

export const sessionCompletedStore = {
  subscribe(l: () => void) {
    listeners.add(l);
    return () => {
      listeners.delete(l);
    };
  },
  getSnapshot: () => current,
  publish(event: SessionCompletedEvent): void {
    current = event;
    emit();
  },
  consume(): SessionCompletedEvent | null {
    const snapshot = current;
    if (snapshot === null) return null;
    current = null;
    emit();
    return snapshot;
  },
};

export function useSessionCompletedSignal(): SessionCompletedEvent | null {
  return useSyncExternalStore(
    sessionCompletedStore.subscribe,
    sessionCompletedStore.getSnapshot,
    sessionCompletedStore.getSnapshot,
  );
}

export function _resetSessionCompletedSignalForTests(): void {
  current = null;
  listeners.clear();
}
