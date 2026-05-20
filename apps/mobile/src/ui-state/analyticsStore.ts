import { setAnalyticsEnabled } from '@/lib/posthog';
import { create } from 'zustand';

type AnalyticsState = {
  enabled: boolean;
  setEnabled: (v: boolean) => void;
};

/**
 * Opt-in analytics toggle. Default OFF.
 *
 * Wraps `setAnalyticsEnabled` so flipping the store also flips the PostHog
 * client's `optIn` / `optOut` state. Persistence (across app launches) is
 * intentionally out of scope here — that lands with the Settings persistence
 * task.
 */
export const useAnalyticsStore = create<AnalyticsState>((set) => ({
  enabled: false,
  setEnabled: (v) => {
    setAnalyticsEnabled(v);
    set({ enabled: v });
  },
}));
