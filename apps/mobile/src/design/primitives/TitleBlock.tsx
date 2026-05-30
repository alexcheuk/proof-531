import { type StyleProp, View, type ViewStyle } from 'react-native';
import { useTheme } from '../theme';
import { CapsLabel } from './CapsLabel';
import { Text } from './Text';

type TitleBlockProps = {
  eyebrow: string;
  title: string;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

/**
 * Caps mono eyebrow + 28px display headline + bottom hairline. The modest
 * title vocabulary used by History, Settings, Progress, and Today (workout
 * view).
 *
 * Ported from the PWA `title-block.tsx`. Default padding is
 * `paddingHorizontal: layout.gutter, paddingTop: 24, paddingBottom: 20`.
 * Override via `style` if a screen needs a different rhythm.
 *
 * Accent dot: if `title` ends in a literal `.`, the period is rendered in
 * the amber accent color (matching LiftPageTitle's "Squat."). This mirrors
 * the PWA wordmark treatment and unifies the visual rhythm across screens.
 * Titles without a trailing dot render as-is.
 */
export function TitleBlock({ eyebrow, title, style, testID }: TitleBlockProps) {
  const { colors, layout } = useTheme();

  const containerStyle: ViewStyle = {
    paddingHorizontal: layout.gutter,
    paddingTop: 24,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.lineStrong,
  };

  const trailingDot = title.endsWith('.');
  const titleBody = trailingDot ? title.slice(0, -1) : title;

  return (
    <View testID={testID} style={[containerStyle, style]}>
      <CapsLabel color="ink2" style={{ marginBottom: 8 }}>
        {eyebrow}
      </CapsLabel>
      <Text
        variant="sans"
        weight="bold"
        size={28}
        color="ink0"
        style={{ lineHeight: 32, letterSpacing: -0.84 }}
      >
        {titleBody}
        {trailingDot ? (
          <Text variant="sans" weight="bold" size={28} color="amber">
            {'.'}
          </Text>
        ) : null}
      </Text>
    </View>
  );
}
