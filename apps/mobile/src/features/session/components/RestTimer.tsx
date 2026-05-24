import { CapsLabel } from '@/design/primitives/CapsLabel';
import { Row } from '@/design/primitives/Row';
import { Text } from '@/design/primitives/Text';
import { useTheme } from '@/design/theme';
/**
 * Rest count-up display + ±30s / Skip controls.
 *
 * Structural port of `~/Development/531-pwa/src/features/session/components/
 * RestTimer.tsx`. The PWA counts UP from `startedAt`; we derive the same
 * count-up label from `target - remaining` so the visual matches the ref
 * without changing the underlying countdown driver.
 *
 * The right-side meta caption flips to "OVERTIME" (amber) once `remaining`
 * goes negative — useful at-a-glance signal during longer rests so the user
 * knows they're past target without having to do the math.
 */
import { useEffect } from 'react';
import { View, type ViewStyle } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { RestTimerControls } from './RestTimerControls';

export type RestTimerProps = {
  /** Seconds remaining in the countdown driver. */
  remaining: number;
  /** Total configured rest target — used to derive count-up elapsed. */
  target: number;
  /** Adds 30s to the running countdown. Hides the button when absent. */
  onAddRest?: () => void;
  /** Subtracts 30s from the running countdown. Hides the button when absent. */
  onSubRest?: () => void;
  /** Skip remaining rest — advances to the next set. Hides the button when absent. */
  onSkip?: () => void;
  testID?: string;
};

function formatLabel(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

// Once the user is meaningfully past target (≥ this many seconds) the giant
// clock switches to an "over by N:NN" frame so the headline reads as a
// pacing alert rather than just a count-up.
const PACE_HINT_THRESHOLD_SECONDS = 5;

export function RestTimer({
  remaining,
  target,
  onAddRest,
  onSubRest,
  onSkip,
  testID,
}: RestTimerProps) {
  const { spacing } = useTheme();
  const elapsed = target - remaining;
  const overtime = remaining < 0;
  const overBySeconds = overtime ? Math.abs(remaining) : 0;
  const showOverByHint = overBySeconds >= PACE_HINT_THRESHOLD_SECONDS;
  const label = showOverByHint ? `+${formatLabel(overBySeconds)}` : formatLabel(elapsed);

  // Overtime pulse — gentle opacity sway between 1 and 0.7 over ~1.4s while
  // the user is past target. Reset to 1 the moment they're back inside the
  // target window so the headline doesn't flash on phase change.
  const pulse = useSharedValue(1);
  useEffect(() => {
    if (!overtime) {
      cancelAnimation(pulse);
      pulse.value = 1;
      return;
    }
    pulse.value = 1;
    pulse.value = withRepeat(
      withTiming(0.7, { duration: 700, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, [overtime, pulse]);
  const pulseStyle = useAnimatedStyle(() => ({ opacity: pulse.value }));

  const container: ViewStyle = {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
  };

  return (
    <View
      testID={testID ?? 'rest-timer'}
      style={container}
      accessibilityLabel={overtime ? 'Resting · over target' : 'Resting'}
      accessibilityRole="timer"
    >
      <Row
        justify="space-between"
        style={{ marginBottom: 10 }}
        {...(testID ? { testID: `${testID}-header` } : {})}
      >
        <CapsLabel>{showOverByHint ? 'Over by' : 'Rest timer'}</CapsLabel>
        <CapsLabel color={overtime ? 'amber' : 'ink3'} testID="rest-timer-meta">
          {overtime ? 'OVERTIME' : 'TARGET'}
        </CapsLabel>
      </Row>

      <Animated.View style={pulseStyle}>
        <Text
          variant="sans"
          weight="medium"
          size={96}
          color={overtime ? 'amber' : 'ink0'}
          numeric
          style={{ letterSpacing: -3.84, lineHeight: 96 }}
          testID="rest-timer-value"
        >
          {label}
        </Text>
      </Animated.View>

      <RestTimerControls onAddRest={onAddRest} onSubRest={onSubRest} onSkip={onSkip} />
    </View>
  );
}
