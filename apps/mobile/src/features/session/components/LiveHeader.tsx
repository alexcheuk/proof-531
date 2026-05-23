import { MonoBadge } from '@/design/primitives/MonoBadge';
import { Text } from '@/design/primitives/Text';
import { useTheme } from '@/design/theme';
/**
 * Caps `SET N / 3` eyebrow with an optional `AMRAP` chip on the right.
 *
 * Structural port of `~/Development/531-pwa/src/features/session/components/
 * LiveHeader.tsx`. Pure presentational — no data, no router.
 */
import { View, type ViewStyle } from 'react-native';

export type LiveHeaderProps = {
  setIndex: 0 | 1 | 2;
  isAmrap: boolean;
  testID?: string;
};

export function LiveHeader({ setIndex, isAmrap, testID }: LiveHeaderProps) {
  const { spacing } = useTheme();
  const row: ViewStyle = {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  };
  return (
    <View testID={testID} style={row}>
      <Text
        variant="mono"
        weight="semibold"
        size={10}
        color="ink2"
        style={{ textTransform: 'uppercase', letterSpacing: 2.2 }}
      >
        SET {setIndex + 1} / 3
      </Text>
      {isAmrap ? <MonoBadge>AMRAP</MonoBadge> : null}
    </View>
  );
}
