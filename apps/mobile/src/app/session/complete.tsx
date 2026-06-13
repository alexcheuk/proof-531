import { SessionCompleteScreen } from '@/features/session/SessionCompleteScreen';
import { parseRouteId } from '@/lib/parseRouteId';
import { useLocalSearchParams } from 'expo-router';

/**
 * Thin route shell  -  parses `sessionId` and the optional `from` origin from
 * the query string and hands them to the feature component. `from=history`
 * indicates the user arrived from the History tab to review a past session;
 * the screen swaps its CTAs accordingly.
 */
export default function CompleteRoute() {
  const { sessionId, from } = useLocalSearchParams<{ sessionId?: string; from?: string }>();
  const parsed = parseRouteId(sessionId);
  if (parsed === null) return null;
  const origin: 'live' | 'history' = from === 'history' ? 'history' : 'live';
  return <SessionCompleteScreen sessionId={parsed} origin={origin} />;
}
