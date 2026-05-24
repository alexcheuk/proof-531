import { Text } from '@/design/primitives/Text';
import { useTheme } from '@/design/theme';
/**
 * Rest countdown display. Pure presentational — caller owns the driver
 * (`useLiveScreenState`) and passes seconds-remaining + target in.
 *
 * Wave 2 (W2.2) changes vs. the post-merge baseline:
 *   - Counts DOWN (renders `remaining` directly, not `target - remaining`).
 *   - Inline `SKIP` and `+30s` controls below the timer label.
 *   - Tap-to-toggle countdown ↔ count-up display (count-up mode is local
 *     to the component, resets on each rest cycle).
 *   - When in count-up mode the eyebrow reads `OVER REST` and the label
 *     shows elapsed time past the target.
 */
import { useState } from 'react';
import { Pressable, Text as RNText, type TextStyle, View, type ViewStyle } from 'react-native';

export type RestTimerProps = {
  /** Seconds remaining in the countdown driver. Can be negative past T-0. */
  remaining: number;
  /** Total configured rest target — used to format `OVER REST` label. */
  target: number;
  /** W2.2 — skip rest (forces `restRemaining` to 0). */
  onSkipRest?: () => void;
  /** W2.2 — add 30 seconds to the rest. */
  onAddRest?: () => void;
  testID?: string;
};

function formatLabel(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

export function RestTimer({ remaining, target, onSkipRest, onAddRest, testID }: RestTimerProps) {
  const { spacing, colors, radii } = useTheme();
  // W2.2 — count-up toggle is local to the timer (per-rest-cycle, not
  // persisted). Tapping the 96pt label flips it.
  const [countUp, setCountUp] = useState(false);

  // W2.2 — Count DOWN by default. When `remaining` goes negative past T-0,
  // pin the label at `0:00` so the user reads "rest is done" instead of a
  // confusing positive number. Count-UP mode renders elapsed time over the
  // target.
  const elapsedOver = Math.max(0, target - remaining);
  const countDownLabel = remaining <= 0 ? '0:00' : formatLabel(remaining);
  const countUpLabel = `${formatLabel(elapsedOver)} over`;
  const label = countUp ? countUpLabel : countDownLabel;

  const container: ViewStyle = {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
  };

  const headerRowStyle: ViewStyle = {
    flexDirection: 'row',
    justifyContent: 'space-between',
    // RN does not support 'baseline'; 'center' is the closest visual match.
    alignItems: 'center',
    marginBottom: 10,
  };

  const eyebrowStyle: TextStyle = {
    fontFamily: 'IBMPlexMono-Medium',
    fontSize: 10,
    lineHeight: 10,
    letterSpacing: 2.2, // 0.22em × 10 — caps spec
    textTransform: 'uppercase',
    color: colors.ink2,
  };

  const metaStyle: TextStyle = {
    fontFamily: 'IBMPlexMono-Medium',
    fontSize: 10,
    lineHeight: 10,
    letterSpacing: 1.8, // 0.18em × 10
    textTransform: 'uppercase',
    color: colors.ink3,
  };

  const controlsRow: ViewStyle = {
    flexDirection: 'row',
    gap: spacing.xl,
    justifyContent: 'center',
    marginTop: spacing.lg,
  };
  const controlChip: ViewStyle = {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.ink0,
    borderRadius: radii.sm,
    backgroundColor: 'transparent',
  };
  const controlLabelStyle: TextStyle = {
    fontFamily: 'IBMPlexMono-SemiBold',
    fontSize: 10,
    lineHeight: 12,
    letterSpacing: 2.2,
    textTransform: 'uppercase',
    color: colors.ink0,
  };

  return (
    <View
      testID={testID ?? 'rest-timer'}
      style={container}
      accessibilityLabel="Resting"
      accessibilityRole="timer"
    >
      <View style={headerRowStyle} testID={testID ? `${testID}-header` : undefined}>
        <RNText style={eyebrowStyle} testID="rest-timer-eyebrow">
          {countUp ? 'Over rest' : 'Rest timer'}
        </RNText>

        <RNText style={metaStyle} testID="rest-timer-target">
          TARGET {formatLabel(target)}
        </RNText>
      </View>

      <Pressable
        testID="rest-timer-toggle"
        accessibilityRole="button"
        accessibilityHint="Double tap to switch between count-down and count-up"
        onPress={() => setCountUp((prev) => !prev)}
      >
        <Text
          variant="sans"
          weight="medium"
          size={96}
          color="ink0"
          style={{
            letterSpacing: -3.84,
            lineHeight: 96,
            fontVariant: ['tabular-nums', 'lining-nums'],
          }}
          testID="rest-timer-value"
        >
          {label}
        </Text>
      </Pressable>

      {onSkipRest || onAddRest ? (
        <View style={controlsRow}>
          {onSkipRest ? (
            <Pressable
              testID="rest-timer-skip"
              accessibilityRole="button"
              accessibilityLabel="Skip rest"
              hitSlop={{ top: 8, bottom: 8, left: 12, right: 12 }}
              onPress={onSkipRest}
              style={controlChip}
            >
              <RNText style={controlLabelStyle}>SKIP</RNText>
            </Pressable>
          ) : null}
          {onAddRest ? (
            <Pressable
              testID="rest-timer-add"
              accessibilityRole="button"
              accessibilityLabel="Add 30 seconds to rest"
              hitSlop={{ top: 8, bottom: 8, left: 12, right: 12 }}
              onPress={onAddRest}
              style={controlChip}
            >
              <RNText style={controlLabelStyle}>+30s</RNText>
            </Pressable>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}
