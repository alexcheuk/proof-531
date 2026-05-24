import { Skeleton } from '@/design/primitives/Skeleton';
import { View } from 'react-native';

/**
 * Paper-themed loading skeleton for the Home tab. Renders the same rough
 * rhythm as the populated screen so the first paint feels intentional.
 */
export function HomeSkeleton() {
  return (
    <View
      style={{ flex: 1, paddingHorizontal: 24, paddingTop: 24, gap: 14 }}
      testID="home-skeleton"
    >
      <Skeleton width={84} height={10} />
      <Skeleton width="60%" height={42} tone="lineStrong" />
      <View style={{ flexDirection: 'row', gap: 14, marginTop: 18 }}>
        <Skeleton width={44} height={10} />
        <Skeleton width={44} height={10} />
        <Skeleton width={44} height={10} />
        <Skeleton width={44} height={10} />
      </View>
      <Skeleton width="100%" height={120} style={{ marginTop: 18 }} />
      <Skeleton width="100%" height={56} style={{ marginTop: 18 }} />
      <Skeleton width="100%" height={56} />
    </View>
  );
}
