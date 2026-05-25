import { useEffect } from 'react';
import { useSyncExternalStore } from 'react';

/**
 * Module-level subject for the active full-bleed status-bar tint
 * color. A screen calls `useStatusBarTint(color)` on mount to push its
 * color; the `<StatusBarTintLayer>` mounted in `_layout.tsx` (above the
 * SafeTopFrame children, below nothing) reads it and paints an absolute
 * strip over the SafeTopFrame's default paper bg.
 *
 * Why a module subject + useSyncExternalStore (not Context): Context
 * would require a provider in the same subtree as the consumer and the
 * setter is screen-driven. A module subject keeps the wire-up trivial
 * (one hook call from the consumer) and avoids re-rendering the whole
 * tree on each tint flip.
 *
 * Reason this exists at all: react-navigation's native-stack card
 * sets `overflow: hidden` on the card surface, so a per-screen
 * `marginTop: -insets.top` escape gets visually clipped at the card
 * boundary on iOS. The fix has to paint over SafeTopFrame from OUTSIDE
 * the card. See `loop-memory/07-status-bar-fill.md`.
 */
let currentTint: string | null = null;
const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

export const statusBarTintStore = {
  subscribe(l: () => void) {
    listeners.add(l);
    return () => {
      listeners.delete(l);
    };
  },
  getSnapshot: () => currentTint,
  set(color: string | null) {
    if (currentTint === color) return;
    currentTint = color;
    emit();
  },
};

export function useStatusBarTint(color: string | null): void {
  useEffect(() => {
    statusBarTintStore.set(color);
    return () => {
      statusBarTintStore.set(null);
    };
  }, [color]);
}

export function useStatusBarTintValue(): string | null {
  return useSyncExternalStore(
    statusBarTintStore.subscribe,
    statusBarTintStore.getSnapshot,
    statusBarTintStore.getSnapshot,
  );
}

export function _resetStatusBarTintForTests(): void {
  currentTint = null;
  listeners.clear();
}
