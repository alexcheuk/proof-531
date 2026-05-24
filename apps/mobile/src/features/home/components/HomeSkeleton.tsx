import { Row } from '@/design/primitives/Row';
import { Skeleton } from '@/design/primitives/Skeleton';
import { useTheme } from '@/design/theme';
import { View } from 'react-native';

/**
 * Paper-themed loading skeleton for the Home tab. Renders the same rough
 * rhythm as the populated screen so the first paint feels intentional.
 */
export function HomeSkeleton() {
  const { layout } = useTheme();
  return (
    <View
      style={{ flex: 1, paddingHorizontal: layout.gutter, paddingTop: 24, gap: 14 }}
      testID="home-skeleton"
    >
      <Skeleton width={84} height={10} />
      <Skeleton width="60%" height={42} tone="lineStrong" />
      <Row gap="md" style={{ marginTop: 18, gap: 14 }}>
        <Skeleton width={44} height={10} />
        <Skeleton width={44} height={10} />
        <Skeleton width={44} height={10} />
        <Skeleton width={44} height={10} />
      </Row>
      <Skeleton width="100%" height={120} style={{ marginTop: 18 }} />
      <Skeleton width="100%" height={56} style={{ marginTop: 18 }} />
      <Skeleton width="100%" height={56} />
    </View>
  );
}
