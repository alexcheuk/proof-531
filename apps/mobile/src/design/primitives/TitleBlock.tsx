import { Text as RNText, type StyleProp, View, type ViewStyle } from 'react-native';
import { useTheme } from '../theme';

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
  const { colors, layout, type } = useTheme();

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
      <RNText
        style={{
          fontFamily: `${type.mono}-Medium`,
          fontSize: 10,
          letterSpacing: 2.2,
          textTransform: 'uppercase',
          color: colors.ink2,
          marginBottom: 8,
        }}
      >
        {eyebrow}
      </RNText>
      <RNText
        style={{
          fontFamily: `${type.sans}-Bold`,
          fontSize: 28,
          lineHeight: 32,
          letterSpacing: -0.84,
          color: colors.ink0,
        }}
      >
        {titleBody}
        {trailingDot ? <RNText style={{ color: colors.amber }}>{'.'}</RNText> : null}
      </RNText>
    </View>
  );
}
