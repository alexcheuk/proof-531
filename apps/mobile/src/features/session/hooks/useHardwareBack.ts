import { useEffect } from 'react';
import { BackHandler } from 'react-native';

/**
 * Register an Android hardware-back override. Returning true from the
 * listener suppresses the default `router.back()`, which is necessary on
 * cross-tab pushes (e.g. History → /session/today) where the stack history
 * doesn't match the user's mental "up" navigation.
 *
 * The hook is a no-op when `enabled` is false so callers always invoke it
 * unconditionally and gate via the flag — keeps hook order stable.
 */
export type UseHardwareBackOptions = {
  enabled: boolean;
  onBack: () => void;
};

export function useHardwareBack({ enabled, onBack }: UseHardwareBackOptions): void {
  useEffect(() => {
    if (!enabled) return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      onBack();
      return true;
    });
    return () => sub.remove();
  }, [enabled, onBack]);
}
