import { useTheme } from '@/design/theme';
import { View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { PAPER_28, PAPER_45 } from '../PRCertificate/paperTints';

/**
 * Pre-data placeholder shown on the PR celebration while
 * `useSessionCompleteData` resolves. Mirrors the hero-number slot's
 * shape so the layout doesn't jump when real data arrives.
 */
export function PrCelebrationSkeleton() {
  const { spacing } = useTheme();
  return (
    <Animated.View
      entering={FadeIn.duration(180).delay(140)}
      testID="pr-celebration-skeleton"
      style={{
        marginTop: spacing.xl,
        paddingTop: spacing.lg,
        borderTopWidth: 1,
        borderTopColor: PAPER_28,
        opacity: 0.45,
      }}
    >
      <View
        style={{
          height: 12,
          width: 140,
          backgroundColor: PAPER_28,
          marginBottom: 14,
        }}
      />
      <View style={{ height: 56, width: 220, backgroundColor: PAPER_45 }} />
    </Animated.View>
  );
}
