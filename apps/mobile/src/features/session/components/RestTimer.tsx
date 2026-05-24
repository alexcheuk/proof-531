import { Text } from '@/design/primitives/Text';
import { useTheme } from '@/design/theme';
/**
 * Rest count-up display. Pure presentational — caller owns the driver
 * (`useLiveScreenState`) and passes seconds-remaining + target in.
 *
 * Structural port of `~/Development/531-pwa/src/features/session/components/
 * RestTimer.tsx`. The PWA counts UP from `startedAt`; we derive the same
 * count-up label from `target - remaining` so the visual matches the ref
 * without changing the underlying countdown driver (which still fires the
 * warning haptic at T-3s and the chime at T-0).
 *
 * Visual contract mirrors the PWA: REST caps eyebrow over a 96-px tabular
 * timer label. No "of m:ss" sub-line — the ref's rest is free-form.
 */
import { Text as RNText, type TextStyle, View, type ViewStyle } from 'react-native';

export type RestTimerProps = {
  /** Seconds remaining in the countdown driver. */
  remaining: number;
  /** Total configured rest target — used to derive count-up elapsed. */
  target: number;
  testID?: string;
};

function formatLabel(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

export function RestTimer({ remaining, target, testID }: RestTimerProps) {
  const { spacing, colors } = useTheme();
  // Count UP from 0 to match the reference. After the target elapses we keep
  // ticking past it (free-form rest — the ref has no fixed ceiling either):
  // when `remaining` goes negative, `target - remaining` grows past `target`.
  const elapsed = target - remaining;
  const label = formatLabel(elapsed);
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

  return (
    <View
      testID={testID ?? 'rest-timer'}
      style={container}
      accessibilityLabel="Resting"
      accessibilityRole="timer"
    >
      <View style={headerRowStyle} testID={testID ? `${testID}-header` : undefined}>
        <RNText style={eyebrowStyle}>Rest timer</RNText>

        <RNText style={metaStyle}>TARGET</RNText>
      </View>

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
    </View>
  );
}
