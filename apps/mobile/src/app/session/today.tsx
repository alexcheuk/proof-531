import { isLift } from '@/domain/labels';
import { TodayScreen } from '@/features/session/TodayScreen';
import { useLocalSearchParams } from 'expo-router';

/**
 * Thin route shell — parses the `:lift` query param off the URL and hands it
 * to the feature component. An invalid or missing lift renders nothing for
 * now (the full empty-state UI lands with the Live screen task).
 */
export default function TodayRoute() {
  const { lift } = useLocalSearchParams<{ lift?: string }>();
  if (!isLift(lift)) return null;
  return <TodayScreen lift={lift} />;
}
