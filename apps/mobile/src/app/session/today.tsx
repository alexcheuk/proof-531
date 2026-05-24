import { isLift } from '@/domain/labels';
import { TodayScreen } from '@/features/session/TodayScreen';
import { SessionNotFound } from '@/features/session/components/SessionNotFound';
import { useLocalSearchParams } from 'expo-router';

/**
 * Thin route shell — parses the `:lift` query param off the URL and hands it
 * to the feature component. An invalid or missing lift renders the
 * `SessionNotFound` shell (W1.4) so the user sees a clear "this session can't
 * be opened" surface + a Back to Home CTA instead of a blank screen.
 */
export default function TodayRoute() {
  const { lift } = useLocalSearchParams<{ lift?: string }>();
  if (!isLift(lift)) return <SessionNotFound />;
  return <TodayScreen lift={lift} />;
}
