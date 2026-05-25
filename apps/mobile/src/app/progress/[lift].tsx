import { goTo } from '@/app/routes';
import { isLift } from '@/domain/labels';
import { ProgressScreen } from '@/features/progress/ProgressScreen';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect } from 'react';

/**
 * Thin route shell — parses `:lift` off the URL and hands it to the
 * feature component. Invalid lifts redirect home (matches the pattern in
 * `app/session/today.tsx`).
 */
export default function ProgressRoute() {
  const { lift } = useLocalSearchParams<{ lift?: string }>();
  const router = useRouter();
  const valid = isLift(lift);

  useEffect(() => {
    if (!valid) {
      goTo.home(router);
    }
  }, [valid, router]);

  if (!valid) return null;
  return <ProgressScreen lift={lift} />;
}
