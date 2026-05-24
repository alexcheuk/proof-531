import { Skeleton } from '@/design/primitives/Skeleton';
import { View } from 'react-native';

/**
 * Paper-themed loading skeleton for the History list. Matches the rhythm of
 * `HomeSkeleton`: caps eyebrow + title + a few row blocks.
 */
export function HistorySkeleton() {
  return (
    <View
      style={{ flex: 1, paddingHorizontal: 24, paddingTop: 24, gap: 14 }}
      testID="history-skeleton"
    >
      <Skeleton width={84} height={10} />
      <Skeleton width="50%" height={42} tone="lineStrong" />
      <Skeleton width={140} height={10} style={{ marginTop: 12 }} />
      <Skeleton width="100%" height={56} style={{ marginTop: 14 }} />
      <Skeleton width="100%" height={56} />
      <Skeleton width="100%" height={56} />
    </View>
  );
}
