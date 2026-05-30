import { useTheme } from '@/design/theme';
import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { PAPER_28, PAPER_45 } from '../PRCertificate/paperTints';

export function PrCelebrationSkeleton() {
  const { spacing } = useTheme();
  const opacity = useSharedValue(0);
  useEffect(() => {
    // Animate to 0.45 (the skeleton's muted final opacity) rather than 1 so the
    // fade target matches the resting appearance without fighting an inline style.
    opacity.value = withDelay(140, withTiming(0.45, { duration: 180 }));
    return () => cancelAnimation(opacity);
  }, [opacity]);
  const fadeStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));
  return (
    <Animated.View
      style={[
        {
          marginTop: spacing.xl,
          paddingTop: spacing.lg,
          borderTopWidth: 1,
          borderTopColor: PAPER_28,
        },
        fadeStyle,
      ]}
      testID="pr-celebration-skeleton"
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
