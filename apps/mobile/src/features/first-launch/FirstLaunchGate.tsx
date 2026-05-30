import { useLatestTms } from '@/data/queries/useLatestTm';
import { Redirect } from 'expo-router';
import type { ReactNode } from 'react';

export function FirstLaunchGate({ children }: { children: ReactNode }) {
  const tms = useLatestTms();

  // Wait for the query to settle before deciding. Returning null avoids a
  // tabs-then-onboarding flash on cold start.
  if (tms.isLoading) {
    return null;
  }

  if (!tms.data || tms.data.length === 0) {
    return <Redirect href="/onboarding" />;
  }

  return <>{children}</>;
}
