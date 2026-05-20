import { useRepos } from '@/data/context';
import { useActiveCycle } from '@/data/queries/useActiveCycle';
import { prescribedSets } from '@/domain/program';
import { type HomeCycleStatus, HomeScreen } from '@/features/home/HomeScreen';
import { useRouter } from 'expo-router';

function pickGreeting(now: Date): string {
  const h = now.getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

export default function HomeRoute() {
  const { lifts: liftRepo } = useRepos();
  const { data: cycle } = useActiveCycle();
  const router = useRouter();

  const allLifts = liftRepo.list();
  const enabledLifts = allLifts.filter((l) => l.enabled);

  const cycleStatus: HomeCycleStatus = cycle
    ? { kind: 'active', cycle: cycle.number, week: 1 }
    : { kind: 'freshStart' };

  const week: 1 | 2 | 3 | 4 = cycleStatus.kind === 'active' ? cycleStatus.week : 1;

  const liftsWithTopSet = enabledLifts.map((l) => {
    const sets = prescribedSets(l.trainingMax, week);
    const top = sets[sets.length - 1];
    if (!top) {
      throw new Error(`HomeRoute: prescribedSets returned no sets for lift ${l.id}`);
    }
    return {
      id: l.id,
      label: l.label,
      trainingMax: l.trainingMax,
      topWeight: top.weight,
      topReps: top.reps,
      amrap: top.amrap,
      pct: top.percent,
    };
  });

  return (
    <HomeScreen
      greeting={pickGreeting(new Date())}
      cycleStatus={cycleStatus}
      lifts={liftsWithTopSet}
      unit="lbs"
      completedSessions={0}
      onLiftPress={(liftId) => router.navigate({ pathname: '/train', params: { liftId } })}
    />
  );
}
