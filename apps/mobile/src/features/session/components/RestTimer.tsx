import { CapsLabel } from '@/design/primitives/CapsLabel';
import { Row } from '@/design/primitives/Row';
import { Text } from '@/design/primitives/Text';
import { useTheme } from '@/design/theme';
import { formatMmSs } from '@/domain/time';
// Count-down (not count-up): flipped 2026-05-24 per user request  -  matches how lifters think
// ("90 left…") and the 0:00 moment is a clean "time to lift" cue.
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
  remaining: number;
  onAddRest?: () => void;
  onSubRest?: () => void;
  onSkip?: () => void;
  testID?: string;
};

// Once the user is meaningfully past target (≥ this many seconds) the giant
// clock switches to an "over by N:NN" frame so the headline reads as a
// pacing alert rather than just a count-up.
const PACE_HINT_THRESHOLD_SECONDS = 5;

export function RestTimer({ remaining, onAddRest, onSubRest, onSkip, testID }: RestTimerProps) {
  const { spacing } = useTheme();
  const overtime = remaining < 0;
  const overBySeconds = overtime ? Math.abs(remaining) : 0;
  const showOverByHint = overBySeconds >= PACE_HINT_THRESHOLD_SECONDS;
  const label = showOverByHint
    ? `+${formatMmSs(overBySeconds)}`
    : formatMmSs(Math.max(0, remaining));

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
