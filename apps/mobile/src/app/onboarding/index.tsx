import { OnboardingScreen } from '@/features/onboarding/OnboardingScreen';
import { useRouter } from 'expo-router';

export default function OnboardingWelcome() {
  const router = useRouter();
  return (
    <OnboardingScreen
      onFinish={() => {
        router.replace('/');
      }}
    />
  );
}
