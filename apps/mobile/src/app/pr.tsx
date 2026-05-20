import { PRModal } from '@/features/pr/PRModal';
import { useLocalSearchParams, useRouter } from 'expo-router';

export default function PrModalRoute() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    liftLabel?: string;
    priorE1RM?: string;
    newE1RM?: string;
    unit?: string;
  }>();
  return (
    <PRModal
      liftLabel={params.liftLabel ?? 'Lift'}
      priorE1RM={params.priorE1RM ? Number(params.priorE1RM) : 0}
      newE1RM={params.newE1RM ? Number(params.newE1RM) : 0}
      unit={(params.unit as 'lbs' | 'kg') ?? 'lbs'}
      onContinue={() => router.back()}
    />
  );
}
