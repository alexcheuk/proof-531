import { useSettings } from '@/data/queries/useSettings';
import { LIFTS, isLift } from '@/domain/labels';
import type { Lift } from '@/domain/types';
import { ProgressScreen } from '@/features/progress/ProgressScreen';
import { useLocalSearchParams } from 'expo-router';

/**
 * Progress tab — renders the per-lift cycle×day grid. The tab takes an
 * optional `?lift=` param so deep links (`/(tabs)/progress?lift=squat`) and
 * in-app `goTo.progress(router, lift)` calls land on the right lift; when
 * absent (a plain tab tap), we default to the first enabled lift and the
 * screen's own LiftTabs / swipe pager handle within-screen switching.
 */
export default function ProgressTab() {
  const { lift: liftParam } = useLocalSearchParams<{ lift?: string }>();
  const settings = useSettings();
  const enabled: Lift[] = settings.data?.enabledLifts ?? [...LIFTS];
  const lift: Lift = isLift(liftParam) ? liftParam : (enabled[0] ?? 'squat');
  return <ProgressScreen lift={lift} />;
}
