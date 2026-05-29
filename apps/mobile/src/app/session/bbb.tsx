import { BbbPromptScreen } from '@/features/session/BbbPromptScreen';
import { parseRouteId } from '@/lib/parseRouteId';
import { useLocalSearchParams } from 'expo-router';

/**
 * Thin route shell — parses `sessionId` from the query string and hands it
 * to the feature component. Reached automatically after AMRAP via
 * `useLiveScreenEffects` (phase === 'awaiting-bbb'). Invalid id renders
 * nothing.
 */
export default function BbbRoute() {
  const { sessionId } = useLocalSearchParams<{ sessionId?: string }>();
  const parsed = parseRouteId(sessionId);
  if (parsed === null) return null;
  return <BbbPromptScreen sessionId={parsed} />;
}
