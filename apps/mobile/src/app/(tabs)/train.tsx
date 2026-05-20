import { useRepos } from '@/data/context';
import { useActiveCycle } from '@/data/queries/useActiveCycle';
import { TodayEditorial } from '@/features/today/TodayEditorial';
import type { TodaySession } from '@/features/today/today-types';
import { useLocalSearchParams } from 'expo-router';

// Fallback when no liftId is supplied (direct Train tab tap with no
// active session). Picks the first enabled lift if one exists; otherwise
// renders a sensible default so the screen still has something to show.
const FALLBACK: TodaySession = {
  cycleNumber: 1,
  liftId: 'bench',
  liftLabel: 'Bench Press',
  trainingMax: 215,
  unit: 'lbs',
  weekOfCycle: 1,
  sets: [],
};

export default function TrainRoute() {
  const { lifts: liftRepo } = useRepos();
  const { data: cycle } = useActiveCycle();
  const params = useLocalSearchParams<{ liftId?: string }>();

  const enabled = liftRepo.list().filter((l) => l.enabled);
  const selected = (params.liftId && liftRepo.get(params.liftId)) || enabled[0] || null;

  if (!selected) {
    return <TodayEditorial session={FALLBACK} />;
  }

  const session: TodaySession = {
    cycleNumber: cycle?.number ?? 1,
    liftId: selected.id,
    liftLabel: selected.label,
    trainingMax: selected.trainingMax,
    unit: 'lbs',
    weekOfCycle: 1,
    sets: [],
  };

  return <TodayEditorial session={session} />;
}
