import { PrCelebrationScreen } from '@/features/session/PrCelebrationScreen';
import { parseRouteId } from '@/lib/parseRouteId';
import { useLocalSearchParams } from 'expo-router';

/**
 * Thin route shell  -  parses `sessionId` from the query string and hands
 * it to the feature component. Reached automatically from
 * `useLiveScreenEffects` when an AMRAP just set a new PR. Invalid id
 * renders nothing.
 */
export default function PrCelebrationRoute() {
  const { sessionId } = useLocalSearchParams<{ sessionId?: string }>();
  const parsed = parseRouteId(sessionId);
  if (parsed === null) return null;
  return <PrCelebrationScreen sessionId={parsed} />;
}
