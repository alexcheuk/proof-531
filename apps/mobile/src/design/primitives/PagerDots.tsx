import { View, type ViewStyle } from 'react-native';
import { useTheme } from '../theme';

/**
 * Decorative N-dot pager indicator. Active dot is `colors.ink0`; inactive
 * dots are `colors.ink3`. Purely presentational — does not own any
 * interaction. Hidden from accessibility (the underlying pager FlatList
 * announces the active page).
 */
export type PagerDotsProps = {
  count: number;
  selectedIndex: number;
  testID?: string;
};

const DOT_SIZE = 6;

export function PagerDots({ count, selectedIndex, testID }: PagerDotsProps) {
  const { colors, spacing } = useTheme();

  const wrap: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    height: 16,
  };

  return (
    <View
      testID={testID}
      style={wrap}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      {Array.from({ length: count }).map((_, i) => (
        <View
          // biome-ignore lint/suspicious/noArrayIndexKey: index IS the key for the dots
          key={`pd-${i}`}
          style={{
            width: DOT_SIZE,
            height: DOT_SIZE,
            borderRadius: DOT_SIZE / 2,
            backgroundColor: i === selectedIndex ? colors.ink0 : colors.ink3,
          }}
        />
      ))}
    </View>
  );
}
