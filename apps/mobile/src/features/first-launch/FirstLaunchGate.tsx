/**
 * `FirstLaunchGate` — wraps the tabs subtree and redirects to `/onboarding`
 * when no training-max rows exist (i.e., the user has never completed
 * onboarding). Renders nothing while the query is still in flight, so we
 * don't flash the tabs UI before deciding.
 */
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
