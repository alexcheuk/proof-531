import { Text } from '@/design/primitives/Text';
import { useTheme } from '@/design/theme';
/**
 * Rest countdown display. Pure presentational — caller owns the actual
 * countdown driver (`useLiveScreenState`) and passes seconds-remaining in.
 *
 * Structural port of `~/Development/531-pwa/src/features/session/components/
 * RestTimer.tsx`. The PWA timer counts UP (free-form rest); this port counts
 * DOWN from a configurable target (PG-04 wired `restTargetSeconds` into
 * settings + `useLiveScreenState`; PG-03 makes the consumer render it).
 *
 * Visual contract mirrors the PWA: REST caps eyebrow over a 96-px tabular
 * timer label. A muted "of m:ss" sub-line shows the target context so the
 * countdown reads as progress rather than a free-running clock.
 */
import { View, type ViewStyle } from 'react-native';

export type RestTimerProps = {
  /** Seconds remaining in the countdown. */
  remaining: number;
  /** Total configured rest target — rendered as context under the timer. */
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
  const label = formatLabel(remaining);
  const targetLabel = formatLabel(target);
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
      <Text
        variant="mono"
        weight="medium"
        size={11}
        color="ink3"
        style={{ textTransform: 'uppercase', letterSpacing: 1.98, marginTop: 6 }}
        testID="rest-timer-target"
      >
        of {targetLabel}
      </Text>
    </View>
  );
}
