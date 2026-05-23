import { LiveScreen } from '@/features/session/LiveScreen';
import { useLocalSearchParams } from 'expo-router';

/**
 * Thin route shell — parses `sessionId` from the query string and hands it to
 * the feature component. Invalid/missing renders nothing; the Today CTA is
 * the only sanctioned entry point.
 */
export default function LiveRoute() {
  const { sessionId } = useLocalSearchParams<{ sessionId?: string }>();
  const parsed = sessionId ? Number.parseInt(sessionId, 10) : Number.NaN;
  if (Number.isNaN(parsed)) return null;
  return <LiveScreen sessionId={parsed} />;
}
