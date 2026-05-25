import { BbbPromptScreen } from '@/features/session/BbbPromptScreen';
import { useLocalSearchParams } from 'expo-router';

/**
 * Thin route shell — parses `sessionId` from the query string and hands it
 * to the feature component. Reached automatically after AMRAP via
 * `useLiveScreenEffects` (phase === 'awaiting-bbb'). Invalid id renders
 * nothing.
 */
export default function BbbRoute() {
  const { sessionId } = useLocalSearchParams<{ sessionId?: string }>();
  const parsed = sessionId ? Number.parseInt(sessionId, 10) : Number.NaN;
  if (Number.isNaN(parsed)) return null;
  return <BbbPromptScreen sessionId={parsed} />;
}
