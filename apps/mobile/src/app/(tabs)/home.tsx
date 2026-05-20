import { useRepos } from '@/data/context';
import { useActiveCycle } from '@/data/queries/useActiveCycle';
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

  return (
    <HomeScreen
      greeting={pickGreeting(new Date())}
      headline="Time to lift."
      cycleStatus={cycleStatus}
      lifts={enabledLifts.map((l) => ({
        id: l.id,
        label: l.label,
        trainingMax: l.trainingMax,
      }))}
      stats={{ prs: 0, sessions: 0, daysLifted: 0 }}
      onLiftPress={(liftId) => router.navigate({ pathname: '/train', params: { liftId } })}
    />
  );
}
