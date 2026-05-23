import { SessionCompleteScreen } from '@/features/session/SessionCompleteScreen';
import { useLocalSearchParams } from 'expo-router';

/**
 * Thin route shell — parses `sessionId` from the query string and hands it to
 * the feature component. Invalid/missing renders nothing; the Live screen
 * (PE-05) is the only sanctioned entry point.
 */
export default function CompleteRoute() {
  const { sessionId } = useLocalSearchParams<{ sessionId?: string }>();
  const parsed = sessionId ? Number.parseInt(sessionId, 10) : Number.NaN;
  if (Number.isNaN(parsed)) return null;
  return <SessionCompleteScreen sessionId={parsed} />;
}
