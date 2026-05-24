import { useTheme } from '@/design/theme';
import { Text as RNText, type TextStyle } from 'react-native';

export type SeeFullRecordLinkProps = {
  onPress: () => void;
  label?: string;
  testID?: string;
};

/**
 * Secondary text link rendered below the primary CTA on SessionComplete.
 * Caps-mono, ink-2, center-aligned — the visual peer of the CtaBar
 * primary so it reads as the second of two equally-weighted choices
 * (not a tertiary action).
 */
export function SeeFullRecordLink({
  onPress,
  label = 'See full record →',
  testID = 'session-complete-history-link',
}: SeeFullRecordLinkProps) {
  const { colors, type } = useTheme();
  const linkStyle: TextStyle = {
    fontFamily: `${type.mono}-SemiBold`,
    fontSize: 10,
    letterSpacing: 2.2,
    textTransform: 'uppercase',
    color: colors.ink2,
    textAlign: 'center',
    paddingTop: 12,
    paddingBottom: 4,
  };
  return (
    <RNText testID={testID} accessibilityRole="button" onPress={onPress} style={linkStyle}>
      {label}
    </RNText>
  );
}
