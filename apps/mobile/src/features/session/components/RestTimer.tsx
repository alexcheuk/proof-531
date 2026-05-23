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
import { View, type ViewStyle } from 'react-native';

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
  const { spacing } = useTheme();
  // Count UP from 0 to match the reference. After the target elapses we keep
  // ticking past it (free-form rest — the ref has no fixed ceiling either).
  const elapsed = Math.max(0, target - remaining);
  const label = formatLabel(elapsed);
  const container: ViewStyle = {
    alignItems: 'center',
    marginTop: spacing.xxl,
  };
  return (
    <View
      testID={testID ?? 'rest-timer'}
      style={container}
      accessibilityLabel="Resting"
      accessibilityRole="timer"
    >
      <Text
        variant="mono"
        weight="semibold"
        size={10}
        color="ink2"
        style={{ textTransform: 'uppercase', letterSpacing: 2.2, marginBottom: 6 }}
      >
        REST
      </Text>
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
