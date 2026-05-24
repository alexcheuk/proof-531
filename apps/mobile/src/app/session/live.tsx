import { LiveScreen } from '@/features/session/LiveScreen';
import { SessionNotFound } from '@/features/session/components/SessionNotFound';
import { useLocalSearchParams } from 'expo-router';

/**
 * Thin route shell — parses `sessionId` from the query string and hands it to
 * the feature component. Invalid/missing renders the `SessionNotFound` shell
 * (W1.4); the Today CTA + resume banner are the sanctioned entry points.
 */
export default function LiveRoute() {
  const { sessionId } = useLocalSearchParams<{ sessionId?: string }>();
  const parsed = sessionId ? Number.parseInt(sessionId, 10) : Number.NaN;
  if (Number.isNaN(parsed)) return <SessionNotFound />;
  return <LiveScreen sessionId={parsed} />;
}
