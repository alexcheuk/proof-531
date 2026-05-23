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
 * title vocabulary used by History, Settings, and Today (workout view).
 *
 * Ported from the PWA `title-block.tsx`. Default padding is
 * `paddingHorizontal: 24, paddingTop: 24, paddingBottom: 20`. Override via
 * `style` if a screen needs a different rhythm.
 */
export function TitleBlock({ eyebrow, title, style, testID }: TitleBlockProps) {
  const { colors, type } = useTheme();

  const containerStyle: ViewStyle = {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.lineStrong,
  };

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
        {title}
      </RNText>
    </View>
  );
}
