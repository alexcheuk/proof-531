import { type StyleProp, View, type ViewStyle } from 'react-native';
import { useTheme } from '../theme';

/**
 * 1px hairline divider — replaces the recurring `borderTopWidth: 1 +
 * borderColor: colors.line` blobs that appear inside session bands, set
 * rows, and the session top bar.
 *
 * `tone="default"` uses the faint `line` color; `tone="strong"` uses the
 * heavier `lineStrong` — match whatever the surrounding section uses.
 */
export type DividerProps = {
  tone?: 'default' | 'strong';
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

export function Divider({ tone = 'default', style, testID }: DividerProps) {
  const { colors } = useTheme();
  const color = tone === 'strong' ? colors.lineStrong : colors.line;
  return (
    <View
      testID={testID}
      style={[{ height: 1, backgroundColor: color, alignSelf: 'stretch' }, style]}
    />
  );
}
