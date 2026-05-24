import { Text as RNText, type TextStyle, View, type ViewStyle } from 'react-native';
import { useTheme } from '../theme';
import type { ColorToken } from '../tokens';

/**
 * Caps eyebrow + sans/display title pair shared by SessionComplete,
 * AmrapLogSheet, OnboardingScreen steps, LiftPage, Review etc.
 *
 * Variants control the title typography. `band` is the tight, 10/2.2 caps
 * header used inside register sections ("The record"). `hero` is the
 * onboarding-style title (eyebrow + 22px sans-bold). `display` is the
 * large headline (eyebrow + 64px sans-bold) used on screen mastheads
 * (today, session complete).
 */
export type SectionHeaderProps = {
  /** Caps eyebrow above the title. Omit to render the title alone. */
  eyebrow?: string;
  /** Title text. Required. */
  title: string;
  /** Typography variant. Defaults to `band`. */
  variant?: 'band' | 'hero' | 'display';
  /** Eyebrow color token. Defaults to `ink2`. */
  eyebrowColor?: ColorToken;
  /** Title color token. Defaults to `ink0`. */
  titleColor?: ColorToken;
  /** Container style escape hatch — use sparingly. */
  style?: ViewStyle;
  testID?: string;
};

export function SectionHeader({
  eyebrow,
  title,
  variant = 'band',
  eyebrowColor = 'ink2',
  titleColor = 'ink0',
  style,
  testID,
}: SectionHeaderProps) {
  const { colors, type } = useTheme();

  const eyebrowStyles = EYEBROW_VARIANTS[variant];
  const titleStyles = TITLE_VARIANTS[variant];

  const eyebrowStyle: TextStyle = {
    ...eyebrowStyles,
    fontFamily: `${type.mono}-SemiBold`,
    color: colors[eyebrowColor],
  };
  const titleStyle: TextStyle = {
    ...titleStyles,
    fontFamily:
      titleStyles.fontFamily === 'sans-bold' ? `${type.sans}-Bold` : `${type.sans}-Medium`,
    color: colors[titleColor],
  };

  return (
    <View testID={testID} style={style}>
      {eyebrow ? <RNText style={eyebrowStyle}>{eyebrow}</RNText> : null}
      <RNText style={titleStyle}>{title}</RNText>
    </View>
  );
}

const EYEBROW_VARIANTS: Record<'band' | 'hero' | 'display', TextStyle> = {
  band: {
    fontSize: 10,
    letterSpacing: 2.2,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  hero: {
    fontSize: 10,
    letterSpacing: 2.2,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  display: {
    fontSize: 10,
    letterSpacing: 2.2,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
};

const TITLE_VARIANTS: Record<'band' | 'hero' | 'display', TextStyle & { fontFamily: string }> = {
  band: {
    fontFamily: 'sans-medium',
    fontSize: 13,
    letterSpacing: -0.13,
  },
  hero: {
    fontFamily: 'sans-bold',
    fontSize: 24,
    letterSpacing: -0.72,
  },
  display: {
    fontFamily: 'sans-bold',
    fontSize: 64,
    lineHeight: 60,
    letterSpacing: -2.88,
  },
};
