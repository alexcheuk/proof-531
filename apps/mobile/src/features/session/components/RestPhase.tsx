import { Text } from '@/design/primitives/Text';
import { useTheme } from '@/design/theme';
/**
 * Full-body rendering of the Live screen's `rest` phase.
 *
 * Structural port of `~/Development/531-pwa/src/features/session/components/
 * RestPhase.tsx`. Eyebrow + headline above the countdown.
 */
import { View, type ViewStyle } from 'react-native';
import { RestTimer } from './RestTimer';

export type RestPhaseProps = {
  /** Seconds remaining (forwarded to RestTimer). */
  remaining: number;
  testID?: string;
};

export function RestPhase({ remaining, testID }: RestPhaseProps) {
  const { spacing } = useTheme();
  const headerStyle: ViewStyle = {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
  };
  return (
    <View testID={testID}>
      <View style={headerStyle}>
        <Text
          variant="mono"
          weight="semibold"
          size={10}
          color="ink2"
          style={{ textTransform: 'uppercase', letterSpacing: 2.2, marginBottom: 8 }}
        >
          LOGGED · REST NOW
        </Text>
        <Text variant="sans" weight="medium" size={48} color="ink0" style={{ letterSpacing: -1.5 }}>
          Breathe.
        </Text>
      </View>
      <RestTimer remaining={remaining} />
    </View>
  );
}
