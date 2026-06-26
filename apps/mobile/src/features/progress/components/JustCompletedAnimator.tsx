import type { ReactNode } from 'react';
import { useEffect } from 'react';
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

// Key on sessionId so a new session replays automatically; a stale id never replays on re-render.
// Lives in features, not design/primitives: "just completed" is a behavioral concern, not a primitive.
// History: module-level signal store + stuck-true flag in ProgressLiftPage caused a Reanimated race
// on consecutive session closes (black-screen). Cell-local mount-driven model removes shared state.
const FILL_IN_DURATION_MS = 480;
const PULSE_DELAY_MS = FILL_IN_DURATION_MS - 80;
const PULSE_UP_MS = 220;
const PULSE_DOWN_MS = 260;
const PULSE_SCALE = 1.12;

type Props = {
  children: ReactNode;
};

export function JustCompletedAnimator({ children }: Props) {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.85);
  const pulse = useSharedValue(1);

  useEffect(() => {
    opacity.value = withTiming(1, {
      duration: FILL_IN_DURATION_MS,
      easing: Easing.out(Easing.cubic),
    });
    scale.value = withTiming(1, {
      duration: FILL_IN_DURATION_MS,
      easing: Easing.out(Easing.cubic),
    });
    pulse.value = withDelay(
      PULSE_DELAY_MS,
      withSequence(
        withTiming(PULSE_SCALE, {
          duration: PULSE_UP_MS,
          easing: Easing.out(Easing.cubic),
        }),
        withTiming(1, {
          duration: PULSE_DOWN_MS,
          easing: Easing.inOut(Easing.cubic),
        }),
      ),
    );
    return () => {
      cancelAnimation(opacity);
      cancelAnimation(scale);
      cancelAnimation(pulse);
    };
  }, [opacity, scale, pulse]);

  const animatedStyle = useAnimatedStyle(() => ({
    flex: 1,
    opacity: opacity.value,
    transform: [{ scale: scale.value * pulse.value }],
  }));

  return <Animated.View style={animatedStyle}>{children}</Animated.View>;
}
