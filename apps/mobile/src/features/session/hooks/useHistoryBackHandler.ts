import { useEffect } from 'react';
import { BackHandler } from 'react-native';

/**
 * Override the Android hardware-back button when a session-complete
 * surface was opened from the History tab, so the user lands back on
 * History instead of the stack default (which can pop to Home or Today
 * on cross-tab pushes).
 *
 * Lives next to the SessionComplete screen because the back contract is
 * specific to it. The hook is a no-op when `enabled` is false so callers
 * always invoke it unconditionally and gate via the flag — keeps the
 * hook-call order stable across renders.
 */
export type UseHistoryBackHandlerOptions = {
  enabled: boolean;
  onBack: () => void;
};

export function useHistoryBackHandler({ enabled, onBack }: UseHistoryBackHandlerOptions): void {
  useEffect(() => {
    if (!enabled) return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      onBack();
      return true;
    });
    return () => sub.remove();
  }, [enabled, onBack]);
}
