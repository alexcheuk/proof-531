import { useRepos } from '@/data/context';
import { OnboardingScreen } from '@/features/onboarding/OnboardingScreen';
import type { LiftId } from '@/features/onboarding/lift-meta';
import { useRouter } from 'expo-router';

const LIFT_CATEGORY: Record<LiftId, 'upper' | 'lower'> = {
  squat: 'lower',
  bench: 'upper',
  deadlift: 'lower',
  press: 'upper',
};

const LIFT_LABEL: Record<LiftId, string> = {
  squat: 'Squat',
  bench: 'Bench',
  deadlift: 'Deadlift',
  press: 'Press',
};

export default function OnboardingWelcome() {
  const router = useRouter();
  const { lifts: liftRepo } = useRepos();

  return (
    <OnboardingScreen
      onFinish={(result) => {
        // Upsert each lift. `create` would conflict on the primary key if
        // the user re-runs onboarding, so try update-first; fall back to
        // create when the row doesn't exist yet.
        for (const lift of result.lifts) {
          const existing = liftRepo.get(lift.id);
          if (existing) {
            liftRepo.update(lift.id, {
              trainingMax: lift.trainingMax,
              enabled: lift.enabled,
            });
          } else {
            liftRepo.create({
              id: lift.id,
              label: LIFT_LABEL[lift.id as LiftId],
              category: LIFT_CATEGORY[lift.id as LiftId],
              trainingMax: lift.trainingMax,
              enabled: lift.enabled,
            });
          }
        }
        router.replace('/');
      }}
    />
  );
}
