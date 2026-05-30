import { useTheme } from '@/design/theme';
import { View, type ViewStyle } from 'react-native';

export type CycleGridCellProps = {
  /** Whether this cell represents a completed session. */
  done: boolean;
  /** Whether this cell is the just-filed session (renders a double-border). */
  justNow: boolean;
};

export function CycleGridCell({ done, justNow }: CycleGridCellProps) {
  const { colors } = useTheme();
  const base: ViewStyle = { flex: 1, height: 16 };
  const fill: ViewStyle = done
    ? { backgroundColor: colors.ink0 }
    : { borderWidth: 1, borderColor: colors.line };
  return (
    <View style={[base, fill, justNow ? { position: 'relative' } : null]} testID="cycle-cell">
      {justNow ? (
        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            top: -3,
            left: -3,
            right: -3,
            bottom: -3,
            borderWidth: 1,
            borderColor: colors.ink0,
          }}
        />
      ) : null}
    </View>
  );
}
