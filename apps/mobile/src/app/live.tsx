import { LiveScreen, type TodaySession } from '@/features/live/LiveScreen';
import { useLocalSearchParams, useRouter } from 'expo-router';

// Mock session for the route. P8-today-data will replace this with the
// real session pulled from Drizzle via a `useSession()` hook.
const MOCK_SESSION: TodaySession = {
  liftId: 'squat',
  liftLabel: 'Squat',
  unit: 'lbs',
  sets: [
    { index: 0, type: 'main', prescribedWeight: 195, prescribedReps: 5, amrap: false },
    { index: 1, type: 'main', prescribedWeight: 225, prescribedReps: 3, amrap: false },
    { index: 2, type: 'main', prescribedWeight: 250, prescribedReps: 1, amrap: true },
  ],
};

export default function LiveModal() {
  const router = useRouter();
  const params = useLocalSearchParams<{ setIndex?: string }>();
  const setIndex = params.setIndex ? Number(params.setIndex) : 0;
  return (
    <LiveScreen
      session={MOCK_SESSION}
      setIndex={setIndex}
      onComplete={() => {}}
      onClose={() => router.back()}
    />
  );
}
