import { TodayEditorial } from '@/features/today/TodayEditorial';
import type { TodaySession } from '@/features/today/today-types';

const MOCK_SESSION: TodaySession = {
  cycleNumber: 3,
  liftId: 'bench',
  liftLabel: 'Bench Press',
  trainingMax: 215,
  unit: 'lbs',
  weekOfCycle: 1,
  sets: [],
};

export default function HomeRoute() {
  return <TodayEditorial session={MOCK_SESSION} />;
}
