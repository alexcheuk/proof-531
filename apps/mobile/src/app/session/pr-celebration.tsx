import { PrCelebrationScreen } from '@/features/session/PrCelebrationScreen';
import { useLocalSearchParams } from 'expo-router';

/**
 * Thin route shell — parses `sessionId` from the query string and hands
 * it to the feature component. Reached automatically from
 * `useLiveScreenEffects` when an AMRAP just set a new PR. Invalid id
 * renders nothing.
 */
export default function PrCelebrationRoute() {
  const { sessionId } = useLocalSearchParams<{ sessionId?: string }>();
  const parsed = sessionId ? Number.parseInt(sessionId, 10) : Number.NaN;
  if (Number.isNaN(parsed)) return null;
  return <PrCelebrationScreen sessionId={parsed} />;
}
