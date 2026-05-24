import { CapsLabel } from '@/design/primitives/CapsLabel';
import { useTheme } from '@/design/theme';
import { View, type ViewStyle } from 'react-native';

/**
 * Empty state rendered on the History tab when the user has zero session
 * rows of any status. The achievement strip above is suppressed in this
 * case, so this caption is the only signal the page renders.
 */
export function HistoryEmptyState() {
  const { layout, spacing } = useTheme();
  const wrap: ViewStyle = {
    paddingHorizontal: layout.gutter,
    paddingTop: spacing.xl,
  };
  return (
    <View style={wrap} testID="history-empty">
      <CapsLabel style={{ letterSpacing: 1.8 }}>FINISH A SESSION TO SEE IT HERE</CapsLabel>
    </View>
  );
}
