import { LiveScreen } from '@/features/session/LiveScreen';
import { parseRouteId } from '@/lib/parseRouteId';
import { useLocalSearchParams } from 'expo-router';

/**
 * Thin route shell  -  parses `sessionId` from the query string and hands it to
 * the feature component. Invalid/missing renders nothing; the Today CTA is
 * the only sanctioned entry point.
 */
export default function LiveRoute() {
  const { sessionId } = useLocalSearchParams<{ sessionId?: string }>();
  const parsed = parseRouteId(sessionId);
  if (parsed === null) return null;
  return <LiveScreen sessionId={parsed} />;
}
