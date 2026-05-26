import { Skeleton } from '@/design/primitives/Skeleton';
import { useTheme } from '@/design/theme';
import { View, type ViewStyle } from 'react-native';

/**
 * Loading skeleton for the Progress lift page — three blocks roughly the size
 * of the title, stats triplet, and goal panel.
 */
export function ProgressSkeleton() {
  const { colors, spacing, layout } = useTheme();
  const containerStyle: ViewStyle = {
    paddingHorizontal: layout.gutter,
    paddingTop: spacing.md,
    gap: spacing.md,
    backgroundColor: colors.bg0,
  };
  return (
    <View style={containerStyle} testID="progress-skeleton">
      <Skeleton style={{ width: '60%', height: 56 }} />
      <Skeleton style={{ height: 96 }} />
      <Skeleton style={{ height: 200 }} />
    </View>
  );
}
