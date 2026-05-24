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
 *
 * The ±30s / Skip controls are optional — supplied by the caller via
 * `onAddRest` / `onSubRest` / `onSkip`. The PWA does not ship them, but
 * mobile users want fingertip control between sets, so we add them here.
 */
import * as Haptics from 'expo-haptics';
import { Pressable, Text as RNText, type TextStyle, View, type ViewStyle } from 'react-native';

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

export function RestTimer({
  remaining,
  target,
  onAddRest,
  onSubRest,
  onSkip,
  testID,
}: RestTimerProps) {
  const { spacing, colors } = useTheme();
  // Count UP from 0 to match the reference. After the target elapses we keep
  // ticking past it (free-form rest — the ref has no fixed ceiling either):
  // when `remaining` goes negative, `target - remaining` grows past `target`.
  const elapsed = target - remaining;
  const label = formatLabel(elapsed);
  const overtime = remaining < 0;
  const showControls = onAddRest !== undefined || onSubRest !== undefined || onSkip !== undefined;

  const container: ViewStyle = {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
  };

  const chipBase: ViewStyle = {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.ink0,
    backgroundColor: colors.bg0,
  };
  const chipPrimary: ViewStyle = {
    ...chipBase,
    backgroundColor: colors.ink0,
  };
  const chipLabel: TextStyle = {
    fontFamily: 'IBMPlexMono-SemiBold',
    fontSize: 11,
    letterSpacing: 1.8,
    textTransform: 'uppercase',
    color: colors.ink0,
  };
  const chipLabelInverted: TextStyle = { ...chipLabel, color: colors.bg0 };

  function withHaptic(fn?: () => void) {
    return () => {
      if (!fn) return;
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      fn();
    };
  }

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
        <CapsLabel>Rest timer</CapsLabel>
        <CapsLabel color={overtime ? 'amber' : 'ink3'} testID="rest-timer-meta">
          {overtime ? 'OVERTIME' : 'TARGET'}
        </CapsLabel>
      </Row>

      <Text
        variant="sans"
        weight="medium"
        size={96}
        color={overtime ? 'amber' : 'ink0'}
        style={{
          letterSpacing: -3.84,
          lineHeight: 96,
          fontVariant: ['tabular-nums', 'lining-nums'],
        }}
        testID="rest-timer-value"
      >
        {label}
      </Text>

      {showControls ? (
        <Row gap="sm" style={{ marginTop: spacing.lg }} testID="rest-timer-controls">
          {onSubRest ? (
            <Pressable
              testID="rest-timer-sub"
              accessibilityRole="button"
              accessibilityLabel="Subtract 30 seconds"
              onPress={withHaptic(onSubRest)}
              style={chipBase}
            >
              <RNText style={chipLabel}>−30s</RNText>
            </Pressable>
          ) : null}
          {onAddRest ? (
            <Pressable
              testID="rest-timer-add"
              accessibilityRole="button"
              accessibilityLabel="Add 30 seconds"
              onPress={withHaptic(onAddRest)}
              style={chipBase}
            >
              <RNText style={chipLabel}>+30s</RNText>
            </Pressable>
          ) : null}
          {onSkip ? (
            <Pressable
              testID="rest-timer-skip"
              accessibilityRole="button"
              accessibilityLabel="Skip rest and start the next set"
              onPress={withHaptic(onSkip)}
              style={chipPrimary}
            >
              <RNText style={chipLabelInverted}>Skip ›</RNText>
            </Pressable>
          ) : null}
        </Row>
      ) : null}
    </View>
  );
}
